import React from 'react';

interface Props {}

export function AboutPage({}: Props) {
  return (
    <>
      <div className="py-5 space-y-4 px-7 ">
        <h1 className="mb-4 text-3xl font-bold">About</h1>
        <div className="max-w-4xl text-lg text-gray-600">
          JavaScript CFG is a tool that generates Control Flow Graphs (CFGs) of JavaScript and TypeScript code. It uses
          TypeScript as a parser to handle both languages and produce CFGs. The project was developed as my
          undergraduate graduation project.
        </div>
        <div>
          <iframe
            src="https://ghbtns.com/github-btn.html?user=yar2001&repo=JavaScript-CFG&type=star&count=true"
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
    </>
  );
}
