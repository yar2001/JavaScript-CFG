import React from 'react';

interface Props {}

export function DocPage({}: Props) {
  return (
    <>
      <div className="w-full px-5 py-3 space-y-4 overflow-auto ">
        <div className="max-w-4xl px-4">
          <h1 className="mb-4 text-3xl font-bold ">Document</h1>
          <h2 className="text-2xl font-bold text-gray-800">What is a Control Flow Graph?</h2>
          <p className="mt-4 text-lg text-gray-600">
            A Control Flow Graph (CFG) is a graphical representation of the possible paths that a program can take
            during its execution. It can help you understand how your code works, find errors and optimize performance.
          </p>
          <p className="mt-4 text-lg text-gray-600">
            A CFG consists of nodes and edges. Each node represents a basic block, which is a sequence of statements
            that has only one entry point and one exit point. Each edge represents a control flow relation between two
            basic blocks, such as a conditional branch or a loop.
          </p>
          <h2 className="mt-8 text-2xl font-bold text-gray-800">Why use a Control Flow Graph?</h2>
          <p className="mt-4 text-lg text-gray-600">A CFG can be useful for various purposes, such as:</p>
          <ul className="mt-4 text-lg text-gray-600 list-disc list-inside">
            <li>
              Static analysis: A CFG can be used to analyze the properties and behavior of a program without executing
              it. For example, you can use a CFG to check if your code has any unreachable or dead code, which is code
              that never gets executed. You can also use a CFG to perform data flow analysis, which tracks how data
              values flow through your program and detects potential errors such as uninitialized variables or unused
              assignments.
            </li>
            <li>
              Syntax analysis: A CFG can be used to parse and validate the syntax of your code. For example, you can use
              a CFG to check if your code follows certain coding standards or conventions. You can also use a CFG to
              generate an Abstract Syntax Tree (AST), which is another representation of your code that focuses on its
              syntactic structure rather than its control flow.
            </li>
            <li>
              Code generation: A CFG can be used to generate executable code from your source code. For example, you can
              use a CFG to compile your JavaScript code into machine code that runs on your computer or browser. You can
              also use a CFG to transform your code into another language or format that suits your needs.
            </li>
          </ul>
          <h2 className="mt-8 text-2xl font-bold text-gray-800">Conclusion</h2>
          <p className="mt-4 text-lg text-gray-600">
            A Control Flow Graph (CFG) is an important tool for analyzing and understanding JavaScript code.It shows how
            control flows through your program,and helps you find problems and optimize performance.It also enables
            various applications such as static analysis,syntax analysis,and code generation.
          </p>
        </div>
      </div>
    </>
  );
}
