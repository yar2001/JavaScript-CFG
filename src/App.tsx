import { Dialog, Transition } from '@headlessui/react';
import { Fragment, Suspense, useCallback, useMemo, useState } from 'react';
import { IoBook, IoBuild, IoInformation, IoPlay } from 'react-icons/io5';
import ReactFlow, { Background, Controls, Node } from 'reactflow';
import 'reactflow/dist/style.css';
import { Subject } from 'rxjs';
import typescript from 'typescript';
import { CFGBlock, CFGData, CFGEdge, CFGNode, generateCFG, isCFGBlock } from './CFG';
import CodeEditor from './Editor';
import Mermaid from './Mermaid';
import { evalInSandbox, variableToConsoleText } from './Sandbox';
import { defaultCode } from './template';
import { TemplateSelector } from './TemplateSelector';
import { ErrorBoundary } from './utils/errorBoundary';

export function App() {
  const [code, setCode] = useState(defaultCode['foo']);

  const [editor$] = useState(new Subject<'format' | 'darkTheme' | 'dayTheme' | 'forceUpdateCode'>());

  const [consoleText, setConsoleText] = useState('');
  const onCodeChange = useCallback((code: string) => {
    setCode(code);
  }, []);

  const [isOpen, setIsOpen] = useState(true);

  const mermaidCode = useMemo(() => {
    const ast = typescript.createSourceFile(
      './src/index.ts',
      code,
      typescript.ScriptTarget.ES2016,
      true,
      typescript.ScriptKind.JS
    );

    function drawCFG({ nodes, edges, lastNodes }: CFGData): string {
      let mermaidCode = '';
      nodes.forEach((node) => {
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
    return 'stateDiagram-v2\n' + drawCFG(generateCFG(ast.statements));
  }, [code]);

  return (
    <>
      <div className="flex flex-col w-screen h-screen overflow-hidden lg:flex-row">
        <div className="flex gap-2 px-2 py-2 bg-neutral-100 shrink-0 lg:flex-col">
          <button className="p-2 transition-colors rounded-md" onClick={() => {}}>
            <IoBuild className="w-6 h-6 text-blue-500" />
          </button>
          <button className="p-2 transition-colors rounded-md" onClick={() => {}}>
            <IoBook className="w-6 h-6 text-gray-400" />
          </button>
          <button className="p-2 transition-colors rounded-md" onClick={() => {}}>
            <IoInformation className="w-6 h-6 text-gray-400" />
          </button>
        </div>
        <div className="grid grid-rows-2 bg-gray-100 divide-y grow lg:grid-rows-1 lg:grid-cols-2 lg:divide-x ">
          <div className="flex flex-col bg-white">
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
            <div className="flex flex-col border-t grow">
              <div className="px-3 py-1 text-xs text-gray-800 select-none">输出</div>
              <div className="h-24 px-3 overflow-y-scroll lg:h-56">
                {consoleText.split('\n').map((text) => (
                  <p key={Math.random()}>{text}</p>
                ))}
              </div>
            </div>
          </div>
          <div className="h-full overflow-auto bg-white">
            <ErrorBoundary>
              <Mermaid chart={mermaidCode} />
            </ErrorBoundary>
            {/* <ReactFlow fitView nodes={nodes} edges={edges} proOptions={{ hideAttribution: true }}>
              <Background />
              <Controls />
            </ReactFlow> */}
          </div>
        </div>
      </div>
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-50"
          onClose={() => {
            setIsOpen(false);
          }}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex items-center justify-center min-h-full p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md py-5 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-xl px-7">
                  <Dialog.Title as="h2" className="text-2xl font-semibold leading-6 text-gray-900">
                    JavaScript CFG
                  </Dialog.Title>
                  <div className="mt-3 space-y-4 text-gray-600">
                    <div>JavaScript CFG is a page to generate Control Flow Graph.</div>
                    <div>
                      <iframe
                        src="https://ghbtns.com/github-btn.html?user=konicyQWQ&repo=babel-plugin-lite-regenerator&type=star&count=true"
                        width="150"
                        height="20"
                        title="GitHub"
                      ></iframe>
                      <div>
                        By{' '}
                        <a
                          className="text-blue-600 hover:text-blue-500"
                          target="_blank"
                          href="https://github.com/yar2001"
                          rel="noreferrer"
                        >
                          @yar2001
                        </a>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4">
                    <button
                      type="button"
                      className="inline-flex justify-center px-4 py-2 text-sm font-medium rounded-md bg-sky-100 text-sky-900 hover:bg-sky-200"
                      onClick={() => setIsOpen(false)}
                    >
                      进入
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}
