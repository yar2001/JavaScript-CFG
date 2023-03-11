import { first, Subject } from 'rxjs';
import typescript from 'typescript';

export type CFGNode = {
  _id: string;
  text: string;
};

export type CFGEdge = {
  begin: string;
  end: string;
};

export interface CFGBlock extends CFGNode {
  children: CFGData;
}

export interface CFGData {
  nodes: CFGNode[];
  edges: CFGEdge[];
  lastNodes: LastNode[];
}

enum LastNodeType {
  Normal = 'normal',
  Continue = 'continue',
  Break = 'break',
  Return = 'return',
}

export interface LastNode {
  _id: string;
  type: LastNodeType;
}

export function isCFGBlock(node: CFGNode): node is CFGBlock {
  return !!(node as CFGBlock).children;
}

export function generateCFG(statements: typescript.NodeArray<typescript.Statement> | undefined): {
  nodes: CFGNode[];
  edges: CFGEdge[];
  lastNodes: LastNode[];
} {
  if (!statements) {
    return { nodes: [], edges: [], lastNodes: [] };
  }

  const nodes: CFGNode[] = [];
  const edges: CFGEdge[] = [];
  let lastNodes: LastNode[] = [];

  const nextNodeId$ = new Subject<string>(); //when calling "next", it will notify last node current nodeId

  for (let index = 0; index < statements.length; index++) {
    const statement = statements[index];

    lastNodes = [];

    const nodeId = statement.pos.toString();

    if (typescript.isExpressionStatement(statement)) {
      const expression = statement.expression;

      nodes.push({
        _id: nodeId,
        text: expression.getText(),
      });

      nextNodeId$.next(nodeId);
      nextNodeId$.pipe(first()).subscribe((nextId) => {
        edges.push({
          begin: nodeId,
          end: nextId,
        });
      });
      lastNodes.push({ _id: nodeId, type: LastNodeType.Normal });
      continue;
    }
    if (typescript.isFunctionDeclaration(statement) && statement.body) {
      const bodyStatements = statement.body.statements;
      const block: CFGBlock = {
        _id: nodeId,
        text: `function ${statement.name?.escapedText}`,
        children: generateCFG(bodyStatements),
      };

      nodes.push(block);
      nextNodeId$.next(nodeId);
      nextNodeId$.pipe(first()).subscribe((nextId) => {
        edges.push({
          begin: nodeId,
          end: nextId,
        });
      });
      lastNodes.push({ _id: nodeId, type: LastNodeType.Normal });
      continue;
    }
    if (typescript.isIfStatement(statement)) {
      nodes.push({
        _id: nodeId,
        text: 'if: ' + statement.expression.getText(),
      });
      nextNodeId$.next(nodeId);

      const thenStatements = (statement.thenStatement as typescript.Block).statements;
      const { nodes: thenNodes, edges: thenEdges, lastNodes: thenLastNodes } = generateCFG(thenStatements);

      if (thenNodes.length) {
        nodes.push(...thenNodes);
        edges.push(...thenEdges);
        edges.push({
          begin: nodeId,
          end: thenNodes[0]._id,
        });
        nextNodeId$.pipe(first()).subscribe((nextId) => {
          edges.push({
            begin: nodeId,
            end: nextId,
          });
          thenLastNodes.forEach((thenLastNode) => {
            if (thenLastNode.type !== LastNodeType.Normal) return;
            edges.push({
              begin: thenLastNode._id,
              end: nextId,
            });
          });
        });
        lastNodes.push({ _id: nodeId, type: LastNodeType.Normal });
        lastNodes.push(...thenLastNodes);
      }

      if (statement.elseStatement) {
        const elseStatements = (statement.elseStatement as typescript.Block).statements;
        const { nodes: elseNodes, edges: elseEdges, lastNodes: elseLastNodes } = generateCFG(elseStatements);

        if (elseNodes.length) {
          nodes.push(...elseNodes);
          edges.push(...elseEdges);
          edges.push({
            begin: nodeId,
            end: elseNodes[0]._id,
          });
          nextNodeId$.pipe(first()).subscribe((nextId) => {
            elseLastNodes.forEach((elseLastNode) => {
              if (elseLastNode.type !== LastNodeType.Normal) return;
              edges.push({
                begin: elseLastNode._id,
                end: nextId,
              });
            });
          });
          lastNodes.push(...elseLastNodes);
        }
      }
      continue;
    }
    if (typescript.isForStatement(statement)) {
      const initializer = statement.initializer;
      if (!initializer) continue;
      nodes.push({
        _id: initializer.pos.toString(),
        text: 'for: ' + statement.initializer?.getText() ?? '',
      });
      nextNodeId$.next(initializer.pos.toString());

      const condition = statement.condition;
      if (!condition) continue;
      nodes.push({
        _id: condition.pos.toString(),
        text: 'for cond: ' + statement.condition?.getText() ?? '',
      });
      edges.push({
        begin: initializer.pos.toString(),
        end: condition.pos.toString(),
      });
      nextNodeId$.pipe(first()).subscribe((nextId) => {
        edges.push({
          begin: condition.pos.toString(),
          end: nextId,
        });
      });

      const incrementor = statement.incrementor;
      if (!incrementor) continue;
      nodes.push({
        _id: incrementor.pos.toString(),
        text: 'for inc: ' + statement.incrementor?.getText() ?? '',
      });
      edges.push({
        begin: condition.pos.toString(),
        end: incrementor.pos.toString(),
      });

      const bodyStatements = (statement.statement as typescript.Block).statements;
      const { nodes: bodyNodes, edges: bodyEdges, lastNodes: bodyLastNodes } = generateCFG(bodyStatements);

      if (bodyNodes.length) {
        nodes.push(...bodyNodes);
        edges.push(...bodyEdges);
        edges.push({
          begin: incrementor.pos.toString(),
          end: bodyNodes[0]._id,
        });
        bodyLastNodes.forEach((bodyLastNode) => {
          if (bodyLastNode.type === LastNodeType.Break) {
            nextNodeId$.pipe(first()).subscribe((nextId) => {
              edges.push({
                begin: bodyLastNode._id,
                end: nextId,
              });
            });
            return;
          }
          if (bodyLastNode.type === LastNodeType.Return) {
            return;
          }

          edges.push({
            begin: bodyLastNode._id,
            end: condition.pos.toString(),
          });
        });

        lastNodes.push(...bodyLastNodes.filter((bodyLastNode) => bodyLastNode.type !== LastNodeType.Continue));
      }
      continue;
    }
    if (typescript.isWhileStatement(statement)) {
      const condition = statement.expression;
      if (!condition) continue;
      nodes.push({
        _id: condition.pos.toString(),
        text: 'while: ' + statement.expression?.getText() ?? '',
      });
      nextNodeId$.next(condition.pos.toString());

      const bodyStatements = (statement.statement as typescript.Block).statements;
      const { nodes: bodyNodes, edges: bodyEdges, lastNodes: bodyLastNodes } = generateCFG(bodyStatements);

      if (bodyNodes.length) {
        nodes.push(...bodyNodes);
        edges.push(...bodyEdges);
        edges.push({
          begin: condition.pos.toString(),
          end: bodyNodes[0]._id,
        });
        bodyLastNodes.forEach((bodyLastNode) => {
          edges.push({
            begin: bodyLastNode._id,
            end: condition.pos.toString(),
          });
        });

        lastNodes.push(...bodyLastNodes);
      }
      continue;
    }
    if (typescript.isContinueStatement(statement)) {
      nodes.push({
        _id: nodeId,
        text: 'continue',
      });
      nextNodeId$.next(nodeId);

      lastNodes.push({ _id: nodeId, type: LastNodeType.Continue });
      continue;
    }
    if (typescript.isBreakStatement(statement)) {
      nodes.push({
        _id: nodeId,
        text: 'break',
      });
      nextNodeId$.next(nodeId);

      lastNodes.push({ _id: nodeId, type: LastNodeType.Break });
      continue;
    }
    if (typescript.isReturnStatement(statement)) {
      nodes.push({
        _id: nodeId,
        text: 'return',
      });
      nextNodeId$.next(nodeId);

      lastNodes.push({ _id: nodeId, type: LastNodeType.Return });
      continue;
    }

    nodes.push({
      _id: nodeId,
      text: statement.getText(),
    });

    nextNodeId$.next(nodeId);
    nextNodeId$.pipe(first()).subscribe((nextId) => {
      edges.push({
        begin: nodeId,
        end: nextId,
      });
    });
    lastNodes.push({ _id: nodeId, type: LastNodeType.Normal });
  }

  nextNodeId$.complete();
  return { nodes, edges, lastNodes: lastNodes };
}
