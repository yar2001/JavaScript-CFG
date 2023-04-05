export const defaultJavaScript: Record<string, string> = {
  foo: `function foo() {
    console.log('Hello JavaScript!');
    foo2();
}

function foo2() {
    console.log('Hello Function 2!');
}

foo();`,
  'for-loop': `// For loop
function foo() {
    console.log('Hello JavaScript!');
    for (let a = 0; a < 10; a++) {
        console.log('Hello For Loop!');
    }
    console.log('Goodbye For loop!');
}
foo();`,
  'while-loop': `// While loop with continue and break
function foo() {
    console.log('Hello JavaScript!');
    let a = 0;
    while (a <= 10) {
        console.log('Hello While loop!');
        a++;
        if (a === 5) {
            a = 6;
            continue;
        }
        if (a === 9) {
            a = 0;
            break;
        }
    }
    console.log('Goodbye While loop!');
}
foo();`,

  'do-while-loop': `function foo() {
    console.log('Hello JavaScript!');
    let a = 0;
    do {
        console.log('Hello Do While loop!');
        a++;
        if (a === 5) {
            a = 6;
            continue;
        }
        if (a === 9) {
            a = 0;
            break;
        }
    } while (a <= 10)
    console.log('Goodbye Do While loop!');
}
foo();`,
  'for-of-loop': `// For-of loop with continue and break
function foo() {
    console.log('Hello JavaScript!');
    const arr = [1, 2, 3, 4, 5, 6, 7]
    for (let a of arr) {
        console.log('Hello For-of loop!');
        console.log(a);
    }
    console.log('Goodbye For-of loop!');
}
foo();
`,
  'for-in-loop': `// The for in statement loops through the properties of an object.
// It lets you access the keys and values of an object.
let person = {
  name: 'Alice',
  age: 25,
  city: 'New York'
};


for (let key in person) {
  let value = person[key];
  console.log(key + ': ' + value);
}`,
};

export const defaultCFGData = `{
  "nodes": [
    {
      "_id": "0",
      "text": "function foo()",
      "children": {
        "nodes": [
          { "_id": "54", "text": "console.log('Hello JavaScript!')" },
          { "_id": "92", "text": "let a = 0;" },
          { "_id": "119", "text": "while (a <= 10)" },
          { "_id": "129", "text": "console.log('Hello While loop!')" },
          { "_id": "171", "text": "a++" },
          { "_id": "184", "text": "if (a === 5)" },
          { "_id": "184end", "text": "end-if" },
          { "_id": "207", "text": "a = 6" },
          { "_id": "226", "text": "continue" },
          { "_id": "258", "text": "if (a === 9)" },
          { "_id": "258end", "text": "end-if" },
          { "_id": "281", "text": "a = 0" },
          { "_id": "300", "text": "break" },
          { "_id": "107end", "text": "end-while" },
          { "_id": "335", "text": "console.log('Goodbye While loop!')" }
        ],
        "edges": [
          { "begin": "54", "end": "92" },
          { "begin": "92", "end": "119" },
          { "begin": "119", "end": "129" },
          { "begin": "129", "end": "171" },
          { "begin": "171", "end": "184" },
          { "begin": "207", "end": "226" },
          { "begin": "184", "end": "207" },
          { "begin": "184", "end": "184end" },
          { "begin": "184end", "end": "258" },
          { "begin": "281", "end": "300" },
          { "begin": "258", "end": "281" },
          { "begin": "258", "end": "258end" },
          { "begin": "226", "end": "119" },
          { "begin": "258end", "end": "119" },
          { "begin": "300", "end": "107end" },
          { "begin": "119", "end": "107end" },
          { "begin": "107end", "end": "335" }
        ],
        "lastNodes": [{ "_id": "335", "type": "normal" }]
      }
    },
    { "_id": "377", "text": "foo()" }
  ],
  "edges": [{ "begin": "0", "end": "377" }],
  "lastNodes": [{ "_id": "377", "type": "normal" }]
}`;

export const defaultMermaid =
  'stateDiagram-v2\nstate "function foo()" as 0{\nstate "console.log(\'Hello JavaScript!\')" as 16\nstate "let a = 0;" as 54\nstate "do" as 69\nstate "while (a <= 10)" as 295\nstate "console.log(\'Hello Do While loop!\')" as 78\nstate "a++" as 123\nstate "if (a === 5)" as 136\nstate "end-if" as 136end\nstate "a = 6" as 159\nstate "continue" as 178\nstate "if (a === 9)" as 210\nstate "end-if" as 210end\nstate "a = 0" as 233\nstate "break" as 252\nstate "console.log(\'Goodbye Do While loop!\')" as 303\n16-->54\n295-->69\n54-->69\n69-->78\n78-->123\n123-->136\n159-->178\n136-->159\n136-->136end\n136end-->210\n233-->252\n210-->233\n210-->210end\n178-->295\n210end-->295\n252-->303\n295-->303\n[*]-->16\n303-->[*]\n\n}\nstate "foo()" as 348\n0-->348\n[*]-->0\n348-->[*]\n';
