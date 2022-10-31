---
title: React原理十问
date: 2022-10-31 20:34:56
categories: 技术栈
tags: 
    - React
---

## React原理十问

总结了React使用者应该知道的十个实现原理。

我在讲的过程中会尽量运行代码出来给你们看，如果比较麻烦的，我就直接说结论了。

### 1.所有JSX其实都是函数

__React17以前__

```js
const babel = require('@babel/core');
const sourceCode = `
<h1>
  hello<span style={{ color: 'red' }}>world</span>
</h1>
`;
const result = babel.transform(sourceCode, {
  plugins: [
    ["@babel/plugin-transform-react-jsx", { runtime: 'classic' }]
  ]
});
console.log(result.code);

// React.createElement("h1", null, "hello", React.createElement("span", {
//   style: {
//     color: 'red'
//   }
// }, "world"));
```

众所周知，所有函数组件都是返回一个JSX，

而现在我们知道了，编译后的函数组件，其实就是返回一个`React.createElement()`

babel对JSX语法进行正则匹配，以拼接字符串的方式，将JSX代码替换为了`React.createElement()`


__React17开始__

```js
const babel = require('@babel/core');
const sourceCode = `
<h1>
  hello<span style={{ color: 'red' }}>world</span>
</h1>
`;
const result = babel.transform(sourceCode, {
  plugins: [
    ["@babel/plugin-transform-react-jsx", { runtime: 'automatic' }]
  ]
});
console.log(result.code);

// import { jsx } from "react/jsx-runtime";
// jsx("h1", {
//   children: ["hello", jsx("span", {
//     style: {
//       color: 'red'
//     },
//     children: "world"
//   })]
// });
```

和替换成 `React.createElement()` 异曲同工

React17开始将JSX库单独提出，以便其他库使用JSX语法，而可以不引入React。

其实所有框架 组件的 HTML模板部分 都是如此 被打包为 一个函数，当组件被调用时，返回虚拟DOM

#### 区分 源码 和 打包后的代码 和 虚拟DOM

__打包后，被正则匹配转换成函数，用函数去描述一个的HTML结构__

__浏览器运行后，函数执行返回虚拟DOM，用虚拟DOM去描述HTML结构__

组件源码(JSX) --> 打包后的组件代码(createElement()) --> 浏览器运行后的组件返回值(描述真实DOM结构的对象)({})


__选择打包为函数，而不是直接打包为虚拟DOM，都返回的是全新的互不影响的虚拟DOM对象__

#### createElement如何参与组件更新

JSX中必然存在很多组件 状态变量，或父组件传入的props变量，例如`(<div>{{name}}</div>)`

这些变量会编译进`createElement()`，类似于`createElement('div',name)`

每一次组件属性更新，执行到`return createElement('div',name)`,都相当于传入了最新的name值

`createElement('div',name)`返回最新虚拟DOM，然后DOM Diff 比较新旧虚拟DOM节点,

如果新虚拟DOM节点 和 旧虚拟DOM节点类似，则复用 旧真实DOM节点，更新渲染真实DOM。

如果新虚拟DOM节点 和 旧虚拟DOM节点较大不同，则删除 新

(Diff的根本目的是尽量复用旧DOM节点，从而节省性能)