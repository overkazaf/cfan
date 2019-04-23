const ejs = require('ejs');


const code = `
  <div>
    <h2><%= name %></h2>
    <span><%= abc %></span>
  </div>
`;

const tpl = ejs.compile(code);
