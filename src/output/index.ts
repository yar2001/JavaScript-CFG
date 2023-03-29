import { createSourceFile, ScriptTarget, ScriptKind } from 'typescript';
import { CFGData, generateCFG, isCFGBlock } from '../CFG';

export type OutputData = {
  repo: string; // the owner/repo
  path: string; // the full path to the original file
  func_name: string; // the function or method name
  original_string: string; // the raw string before tokenization or parsing
  language: string; // the programming language
  code: string; // the part of the original_string that is code
  code_tokens: string[]; // tokenized version of code
  docstring: string | null; // the top-level comment or docstring, if it exists in the original string
  docstring_tokens: string[] | null; // tokenized version of docstring
  sha: string | null; // this field is not being used [TODO: add note on where this comes from?]
  partition: 'train' | 'valid' | 'test'; // a flag indicating what partition this datum belongs to. This is not used by the model. Instead we rely on directory structure to denote the partition of the data.
  url: string; // the url for the code snippet including the line numbers
  cfg_dependency: Record<string, string[]>; // extract the control flow graph from the code, the format is "source node": ["target node", "target node", ...]
  data_dependency: Record<string, string[]>; // extract the data dependency graph from the code, the format is "source node": ["target node", "target node", ...]
};

export function generateOutput(code: string): OutputData {
  const output: OutputData = {
    repo: '',
    path: '',
    func_name: '',
    original_string: code,
    language: 'javascript',
    code,
    code_tokens: [],
    docstring: null,
    docstring_tokens: null,
    sha: null,
    partition: 'train',
    url: '',
    cfg_dependency: {},
    data_dependency: {},
  };

  const sourceFile = createSourceFile('./src/index.ts', code, ScriptTarget.ES2016, true, ScriptKind.JS);

  output.code_tokens = sourceFile.statements.map((statement) => {
    return statement.getText();
  });

  const docstring = sourceFile.statements[0].getFullText();
  if (docstring.startsWith('/**')) {
    output.docstring = docstring;
    output.docstring_tokens = docstring.split(' ');
  }

  const { edges, lastNodes, nodes } = generateCFG(sourceFile);

  function generateCFGDependency(beginId: string, { nodes, edges, lastNodes }: CFGData) {
    nodes.forEach((node) => {
      if (isCFGBlock(node)) {
        output.cfg_dependency[`${node._id}: ${node.text}`] = [];
        generateCFGDependency(node._id, node.children);
        return;
      }
      output.cfg_dependency[`${node._id}: ${node.text}`] = [];
    });

    edges.forEach((edge) => {
      const beginNode = nodes.find((n) => n._id === edge.begin);
      const endNode = nodes.find((n) => n._id === edge.end);
      if (!beginNode || !endNode) return;
      output.cfg_dependency[`${beginNode._id}: ${beginNode.text}`].push(`${endNode._id}: ${endNode.text}`);
    });
    if (nodes.length) {
      output.cfg_dependency[`${beginId}: Begin`] = [`${nodes[0]._id}: ${nodes[0].text}`];
    }
    lastNodes.forEach((node) => {
      const nodeData = nodes.find((n) => n._id === node._id);
      if (!nodeData) return;
      output.cfg_dependency[`${nodeData._id}: ${nodeData.text}`].push(`${beginId}: End`);
    });
  }

  generateCFGDependency('root', { nodes, edges, lastNodes });
  return output;
}
