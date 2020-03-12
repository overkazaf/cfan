# CFAN
CFAN(稀饭，源于我狗狗的名字)是一个基于NodeJS的轻量级TemplateEngine，具备引下几个语法特性
+ include
+ JS fragment
+ expression

## Why CFAN
+ 轻量，学习简单
+ 可使用JS片段，较EJS/Pug的多层嵌套更简洁
+ 定位于给定模板的数据填充，与Jade/Pug不同，

## Usage
```js
npm i cfan
```

## Examples
```js
const cfan = require('cfan');
const html = cfan.renderFile(fileName, options, model);
```
### Filters
在cfan中，filter可自行根据需求实现，使用JS语法即可
```html
<div class="friend-list">
  <h2><#= userId #></h2>
  <ul class="user-list">
    <#=
      friends
      .filter(f => f.friends.includes(userId))
      .map(user => {
        return '<li class="user-name">' + user.name + '</li>';
      });
    #>
  </ul>
</div>
```

## Integrate with express
```js
const cfan = require('cfan');

cfan.config({
  // ...
});
// const html = cfan.renderFile(fileName, options, model);

express.get('/user/:fileName', (req, res) => {
  res.send(cfan.renderFile(fileName, options, model));
});
```


## Motivation
+ EJS
+ Jade/Pug
