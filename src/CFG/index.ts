import { first, Subject } from 'rxjs';
import {
  Block,
  createNodeArray,
  DoStatement,
  Expression,
  ExpressionStatement,
  factory,
  ForInStatement,
  ForOfStatement,
  ForStatement,
  isBlock,
  isBreakStatement,
  isContinueStatement,
  isDoStatement,
  isExpressionStatement,
  isForInStatement,
  isForOfStatement,
  isForStatement,
  isFunctionDeclaration,
  isIfStatement,
  isReturnStatement,
  isThrowStatement,
  isWhileStatement,
  Node,
  NodeArray,
  Statement,
  WhileStatement,
} from 'typescript';

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
  Throw = 'throw',
}

export interface LastNode {
  _id: string;
  type: LastNodeType;
}

export function isCFGBlock(node: CFGNode): node is CFGBlock {
  return !!(node as CFGBlock).children;
}

export function generateCFG(astNode: Node | undefined): {
  nodes: CFGNode[];
  edges: CFGEdge[];
  lastNodes: LastNode[];
} {
  if (!astNode) {
    return { nodes: [], edges: [], lastNodes: [] };
  }

  function getStatementsFromAstNode(astNode: Node): NodeArray<Statement> {
    //@ts-expect-error
    if (astNode.statements) {
      //@ts-expect-error
      return astNode.statements;
    }

    return factory.createNodeArray([astNode as Statement]);
  }
  const statements = getStatementsFromAstNode(astNode);

  const nodes: CFGNode[] = [];
  const edges: CFGEdge[] = [];
  let lastNodes: LastNode[] = [];

  const nextNodeId$ = new Subject<string>(); //when calling "next", it will notify last node current nodeId

  for (let index = 0; index < statements.length; index++) {
    const statement = statements[index];

    lastNodes = lastNodes.filter((lastNode) => lastNode.type !== LastNodeType.Normal);

    const nodeId = statement.pos.toString();

    if (isExpressionStatement(statement)) {
      const expression = statement.expression;

      nodes.push({
        _id: nodeId,
        text: expression.getText()?.replaceAll('"', "'"),
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
    if (isFunctionDeclaration(statement) && statement.body) {
      const block: CFGBlock = {
        _id: nodeId,
        text: `function ${statement.name?.escapedText}`,
        children: generateCFG(statement.body),
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
    if (isIfStatement(statement)) {
      nodes.push({
        _id: nodeId,
        text: 'if: ' + statement.expression.getText()?.replaceAll('"', "'"),
      });
      nextNodeId$.next(nodeId);

      const { nodes: thenNodes, edges: thenEdges, lastNodes: thenLastNodes } = generateCFG(statement.thenStatement);

      if (thenNodes.length) {
        nodes.push(...thenNodes);
        edges.push(...thenEdges);
        edges.push({
          begin: nodeId,
          end: thenNodes[0]._id,
        });

        nextNodeId$.pipe(first()).subscribe((nextId) => {
          if (!statement.elseStatement) {
            edges.push({
              begin: nodeId,
              end: nextId,
            });
          }
          thenLastNodes.forEach((thenLastNode) => {
            if (thenLastNode.type !== LastNodeType.Normal) return;
            edges.push({
              begin: thenLastNode._id,
              end: nextId,
            });
          });
        });
        if (!statement.elseStatement) {
          lastNodes.push({ _id: nodeId, type: LastNodeType.Normal });
        }
        lastNodes.push(...thenLastNodes);
      }

      if (statement.elseStatement) {
        const { nodes: elseNodes, edges: elseEdges, lastNodes: elseLastNodes } = generateCFG(statement.elseStatement);

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
    if (isForStatement(statement)) {
      const initializer = statement.initializer;
      if (!initializer) continue;
      nodes.push({
        _id: initializer.pos.toString(),
        text: 'for: ' + statement.initializer?.getText()?.replaceAll('"', "'") ?? '',
      });
      nextNodeId$.next(initializer.pos.toString());

      const condition = statement.condition;
      if (!condition) continue;
      nodes.push({
        _id: condition.pos.toString(),
        text: 'for cond: ' + statement.condition?.getText()?.replaceAll('"', "'") ?? '',
      });
      edges.push({
        begin: initializer.pos.toString(),
        end: condition.pos.toString(),
      });

      const incrementor = statement.incrementor;
      if (!incrementor) continue;
      nodes.push({
        _id: incrementor.pos.toString(),
        text: 'for inc: ' + statement.incrementor?.getText()?.replaceAll('"', "'") ?? '',
      });
      edges.push({
        begin: condition.pos.toString(),
        end: incrementor.pos.toString(),
      });

      solveLoop(statement, condition, {
        onBodyNodes(bodyNodes) {
          edges.push({
            begin: incrementor.pos.toString(),
            end: bodyNodes[0]._id,
          });
        },
      });
      continue;
    }
    if (isWhileStatement(statement)) {
      const condition = statement.expression;
      if (!condition) continue;
      nodes.push({
        _id: condition.pos.toString(),
        text: 'while: ' + statement.expression?.getText()?.replaceAll('"', "'") ?? '',
      });
      nextNodeId$.next(condition.pos.toString());

      solveLoop(statement, condition, {
        onBodyNodes(bodyNodes) {
          edges.push({
            begin: condition.pos.toString(),
            end: bodyNodes[0]._id,
          });
        },
      });

      continue;
    }
    if (isDoStatement(statement)) {
      const condition = statement.expression;
      if (!condition) continue;

      nodes.push({
        _id: nodeId,
        text: 'do',
      });
      nodes.push({
        _id: condition.pos.toString(),
        text: 'do while: ' + statement.expression?.getText()?.replaceAll('"', "'") ?? '',
      });
      edges.push({
        begin: condition.pos.toString(),
        end: nodeId,
      });
      nextNodeId$.next(nodeId);

      solveLoop(statement, condition, {
        onBodyNodes(bodyNodes) {
          edges.push({
            begin: nodeId,
            end: bodyNodes[0]._id,
          });
        },
      });
      continue;
    }
    if (isForInStatement(statement)) {
      const expression = statement.expression;
      if (!expression) continue;
      nextNodeId$.next(expression.pos.toString());
      nodes.push({
        _id: expression.pos.toString(),
        text:
          'for: ' +
            statement.initializer?.getText()?.replaceAll('"', "'") +
            ' in ' +
            statement.expression?.getText()?.replaceAll('"', "'") ?? '',
      });

      solveLoop(statement, expression, {
        onBodyNodes(bodyNodes) {
          edges.push({
            begin: expression.pos.toString(),
            end: bodyNodes[0]._id,
          });
        },
      });
      continue;
    }
    if (isForOfStatement(statement)) {
      const expression = statement.expression;
      if (!expression) continue;
      nextNodeId$.next(expression.pos.toString());
      nodes.push({
        _id: expression.pos.toString(),
        text:
          'for: ' +
            statement.initializer?.getText()?.replaceAll('"', "'") +
            ' of ' +
            statement.expression?.getText()?.replaceAll('"', "'") ?? '',
      });

      solveLoop(statement, expression, {
        onBodyNodes(bodyNodes) {
          edges.push({
            begin: expression.pos.toString(),
            end: bodyNodes[0]._id,
          });
        },
      });
      continue;
    }
    if (isContinueStatement(statement)) {
      nodes.push({
        _id: nodeId,
        text: 'continue',
      });
      nextNodeId$.next(nodeId);

      lastNodes.push({ _id: nodeId, type: LastNodeType.Continue });
      continue;
    }
    if (isBreakStatement(statement)) {
      nodes.push({
        _id: nodeId,
        text: 'break',
      });
      nextNodeId$.next(nodeId);

      lastNodes.push({ _id: nodeId, type: LastNodeType.Break });
      continue;
    }
    if (isReturnStatement(statement)) {
      nodes.push({
        _id: nodeId,
        text: statement.getText()?.replaceAll('"', "'"),
      });
      nextNodeId$.next(nodeId);

      lastNodes.push({ _id: nodeId, type: LastNodeType.Return });
      continue;
    }
    if (isThrowStatement(statement)) {
      nodes.push({
        _id: nodeId,
        text: statement.getText()?.replaceAll('"', "'"),
      });
      nextNodeId$.next(nodeId);

      lastNodes.push({ _id: nodeId, type: LastNodeType.Throw });
      continue;
    }

    nodes.push({
      _id: nodeId,
      text: statement.getText()?.replaceAll('"', "'"),
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

  function solveLoop(
    statement: WhileStatement | ForStatement | DoStatement | ForInStatement | ForOfStatement,
    condition: Expression,
    { onBodyNodes }: { onBodyNodes?: (nodes: CFGNode[]) => void } = {}
  ) {
    const { nodes: bodyNodes, edges: bodyEdges, lastNodes: bodyLastNodes } = generateCFG(statement.statement);

    if (bodyNodes.length) {
      onBodyNodes?.(bodyNodes);
      nodes.push(...bodyNodes);
      edges.push(...bodyEdges);

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
        if (bodyLastNode.type === LastNodeType.Return || bodyLastNode.type === LastNodeType.Throw) {
          return;
        }

        edges.push({
          begin: bodyLastNode._id,
          end: condition.pos.toString(),
        });
      });

      lastNodes.push(
        ...bodyLastNodes.filter(
          (bodyLastNode) => ![LastNodeType.Continue, LastNodeType.Break].includes(bodyLastNode.type)
        )
      );
    }

    nextNodeId$.pipe(first()).subscribe((nextId) => {
      edges.push({
        begin: condition.pos.toString(),
        end: nextId,
      });
    });
  }
}
