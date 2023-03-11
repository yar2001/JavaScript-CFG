export const defaultCode: Record<string, string> = {
  foo: `function foo() {
    console.log('Hello JavaScript!');
    foo2();
}

function foo2() {
    console.log('Hello Function 2!');
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
