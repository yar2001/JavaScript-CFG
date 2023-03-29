import { useCallback, useMemo, useState } from 'react';
import { IoPlay } from 'react-icons/io5';
import { Subject } from 'rxjs';
import { createSourceFile, ScriptTarget, ScriptKind } from 'typescript';
import { CFGData, generateCFG, isCFGBlock } from '../../CFG';
import CodeEditor from '../../Editor';
import Mermaid from '../../Mermaid';
import { generateOutput } from '../../output';
import { evalInSandbox, variableToConsoleText } from '../../Sandbox';
import { defaultCode } from '../../template';
import { TemplateSelector } from '../../TemplateSelector';
import { ErrorBoundary } from '../../utils/errorBoundary';

export function HomePage() {
  const [code, setCode] = useState(defaultCode['foo']);

  const [editor$] = useState(new Subject<'format' | 'darkTheme' | 'dayTheme' | 'forceUpdateCode'>());

  const [consoleText, setConsoleText] = useState('');
  const onCodeChange = useCallback((code: string) => {
    setCode(code);
  }, []);

  const mermaidCode = useMemo(() => {
    const ast = createSourceFile('./src/index.ts', code, ScriptTarget.ES2016, true, ScriptKind.JS);

    function drawCFG({ nodes, edges, lastNodes }: CFGData): string {
      let mermaidCode = '';
      nodes.forEach((node) => {
        node.text = node.text.replaceAll('"', "'");
        if (isCFGBlock(node)) {
          mermaidCode += `state "${node.text}" as ${node._id}{\n`;
          mermaidCode += drawCFG(node.children);
          mermaidCode += '\n}\n';
          return;
        }
        mermaidCode += `state "${node.text}" as ${node._id}\n`;
      });

      edges.forEach((edge) => {
        mermaidCode += `${edge.begin}-->${edge.end}\n`;
      });
      if (nodes.length) {
        mermaidCode += `[*]-->${nodes[0]._id}\n`;
      }
      lastNodes.forEach((node) => {
        mermaidCode += `${node._id}-->[*]\n`;
      });

      return mermaidCode;
    }
    return 'stateDiagram-v2\n' + drawCFG(generateCFG(ast));
  }, [code]);

  return (
    <>
      <div className="flex flex-col bg-gray-100 divide-y lg:grid grow lg:grid-rows-1 lg:grid-cols-2 lg:divide-x ">
        <div className="flex flex-col overflow-y-auto bg-white lg:h-screen">
          <div className="flex items-center justify-between gap-2 px-3 py-1">
            <TemplateSelector
              onSelect={(name) => {
                editor$.next('forceUpdateCode');
                setCode(defaultCode[name]);
              }}
            />
            <button
              className="p-1 transition-colors rounded-md bg-blue-50 active:bg-blue-100"
              onClick={() => {
                console.log(generateOutput(code));

                const GlobalEnv = {
                  Math,
                  Function,
                  Array,
                  Symbol,
                  Object,
                  Date,
                };
                setConsoleText((c) => c + '\n');
                evalInSandbox(code, {
                  ...GlobalEnv,
                  console: {
                    log(...args: any[]) {
                      const consoleText = args.map((arg) => variableToConsoleText(arg)).join(' ');
                      setConsoleText((c) => c + consoleText + '\n');
                      console.log(...args);
                    },
                  },
                });
              }}
            >
              <IoPlay className="w-5 h-5 text-blue-500" />
            </button>
          </div>
          <CodeEditor noSemanticValidation value={code} onChange={onCodeChange} command$={editor$} />
          <div className="flex flex-col border-t">
            <div className="px-3 py-1 text-xs text-gray-800 select-none">Output</div>
            <div className="h-56 px-3 overflow-y-scroll">
              {consoleText.split('\n').map((text) => (
                <p key={Math.random()}>{text}</p>
              ))}
            </div>
          </div>
        </div>
        <div className="h-full overflow-y-auto bg-white lg:h-screen">
          <ErrorBoundary key={mermaidCode}>
            <Mermaid chart={mermaidCode} />
          </ErrorBoundary>
        </div>
      </div>
    </>
  );
}
