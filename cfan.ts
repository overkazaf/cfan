const fs = require('fs');
const INCLUDE_SEPERATOR = '|';
const defaultParseOptions = {
  open: '<#',
  close: '#>',
  suffix: '.cfan',
};

function evalObj(objString: string) {
  if (!objString) return undefined;
  else return new Function('', `return ${objString.trim()}`)();
}

function parse(input: string, options: any = defaultParseOptions) {
  const open = options.open;
  const close = options.close;
  const parseQueue: any[] = [];
  let i = 0;
  while (i < input.length) {
    const start = input.indexOf(open, i);
    if (start === -1) {
      parseQueue.push(input.substring(i));
      break;
    } else {
      if (i < start) parseQueue.push(input.substring(i, start));
      i = start;
      i += open.length;
    }
    switch(input[i]) {
      case '=': // expression, we use this case to output vars or simply echo strings
      case '$': // // JS sandbox, will use a sandbox enviroment to exec codes later
      case '@': // function fragment, no need to define function any more
        const fnFlag = input[i] === '$';
        const fnFragment = input[i] === '@';
        let jsCode = input.substring(i+1, input.indexOf(close, i));
        // output
        i += jsCode.length;
        if (fnFragment || fnFlag) {
          if (fnFragment) {
            const fn = new Function('scope', `
              with(scope) {
                ${jsCode}
              }
            `);
            parseQueue.push(fn);
          } else {
            jsCode = `${eval(jsCode)}`;
            parseQueue.push(jsCode);
          }
        } else {
          jsCode = `
            let buf = '';
            with (scope) {
              buf += ${jsCode};   
            }
            return buf;
          `;
          const func: Function = new Function('scope', jsCode);
          parseQueue.push(func);
        }
        break;
      case '!':
        // include
        try {
          const includeExpr = input.substring(i+1, input.indexOf(close, i));
          const [ includedFile, subModel ] = includeExpr.split(INCLUDE_SEPERATOR);
          const codes = fs.readFileSync(`${includedFile.trim()}${options.suffix}`).toString();
          let ir;
          if (subModel) {
            ir = compile(parse(codes, options), evalObj(subModel));
          } else {
            ir = parse(codes, options);
          }
          parseQueue.push(ir);
          i += includedFile.length;
        } catch(e) {
          throw new Error('Cannot parse include directives ' + e.stack);
        }
        break;
      default:
        continue;
    }
    const end = input.indexOf(close, i);
    if (end === -1) throw new Error(`Cannot find close tag ${close} in string ${input}, ${JSON.stringify(parseQueue)}`);
    else {
      i = end;
      i += close.length;
    }
  }

  return parseQueue;
}

function preCompile(queue: any[], model: any): any {
  return queue.map(item => {
    if (typeof item === 'function') {
      return item(model);
    } else if (Array.isArray(item)) {
      return preCompile(item, model).join('');
    } else {
      return item;
    }
  });
}

function compile(queue: any[], model: any) {
  return preCompile(queue, model).join('');
}

const model = { 
  abc: [ { name: 'John'}, { name: 'Alex' } ],
  age: 12,
  ccc: 33,
  admin: {
    name: 'kevin',
  },
  profile: {
    email: 'abc@gmail.com',
  },
};

function render(code: string, options: any = defaultParseOptions, model: any) {
  const parseQueue = parse(`${code}`, options);
  return compile(parseQueue, model)
}

function renderFile(fileName: string, options: any = defaultParseOptions, model: any) {
  try {
    const code = fs.readFileSync(fileName + options.suffix).toString();
    const parseQueue = parse(`${code}`, options);
    return compile(parseQueue, model)
  } catch(e) {
    throw e;
  }
}


const html: string = renderFile('examples/index', undefined, {
  userId: '123',
  userName: 'Tomdd',
  friends: [
    { userId: '2', friends: ['123', '122'], name: 'Kevin1'},
    { userId: '3', friends: ['113', '122'], name: 'Kevin2'},
    { userId: '4', friends: ['13', '123'], name: 'Kevin3'},
  ],
});
console.log(html);