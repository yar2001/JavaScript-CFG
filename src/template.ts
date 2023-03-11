export const defaultCode: Record<string, string> = {
  foo: `// test
function foo(){
    console.log('Hello JavaScript!');
}
foo();
`,

  'for-loop': `// For loop with continue and break
function foo() {
    console.log('Hello JavaScript!');
    for (let a = 1; a < 10; a++) {
        console.log('Hello For loop!');
        if (a === 5) {
            a = 6;
            continue;
        }
        if (a === 9) {
            a = 0;
            break;
        }
        if (a === 11) {
            throw new Error('What the hell')
        }
    }
    console.log('Goodbye For loop!');
}
foo();
`,

  'async-try': `class file {
    constructor(filename) {
        this.filename = filename;
        this.openState = false;
    }

    change(state) {
        this.openState = state;
    }

    async getContent() {
        return \`\${this.filename}: content, \${this.openState}\`
    }
}

async function getFile1() {
    return await "111";
}

async function getFile2() {
    return await "222";
}

async function getObjClass() {
    return await {
        a: file,
    }
}

async function getFalse() {
    await false;
}

async function test() {
    let f1 = new file(await getFile1());
    let f2 = new ((await getObjClass()).a)(await getFile2());

    f1.change(await getFalse());
    f2.change(!(await getFalse()));

    return [await f1.getContent(), await f2.getContent()]
}

test().then(console.log)`,

  'nested-loops': `async function getData() {
    return await 1;
}

async function test() {
    let num = 1;

    A: while (num > 1) {
        num += await getData();
        for (let i = 1; i < num; i++) {
            if (i >= 10) {
                continue A;
            }
        }
        while (num < 5) {
            if (num > 5) {
                break;
            } else {
                break A;
            }
        }
    }

    return num;
}

getData().then(console.log)`,
};
