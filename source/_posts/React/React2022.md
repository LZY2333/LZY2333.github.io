## React原理十问

从最简单的一个函数组件开始。


总结了React使用者应该知道的十个实现原理。

我在讲的过程中会尽量运行代码出来给你们看，如果比较麻烦的，我就直接说结论了。

本次分享主要基于React15讲述React原理，其他版本为辅，可能顺便讲一讲和其他框架的区别。

16   fiber
16.8 hooks
18   优先级调度 并发执行

我认为React15框架是所有框架里最简单的

但即使去掉react-router，去掉redux，光React15知识点依旧很多

其中最重要的，也是我认为所有框架最重要的两条线，沿着这两条线来研究源码，可以事半功倍。

要理解一个框架，最终要的是 初始化 和 更新

初始化原理: React如何将实现组件化，如何将组件渲染成DOM?

更新原理: React如何将数据变化响应到视图？

JSX 类组件和函数组件 DOM-DIFF hooks 生命周期

我基本是想到哪里讲到哪里，有什么问题可以直接问，能多讲一些。

### 1.代码中所有JSX其实都是函数

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

babel对JSX语法进行正则匹配，通过AST语法树，将JSX代码替换为了`React.createElement()`


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

> 其实所有框架 组件的 HTML模板部分 都是如此 被打包为 一个函数，当组件被调用时，返回虚拟DOM

ESLint

### 2.函数组件的调用原理

```js
function FunctionComponent(props) {
    return <h1 className='title' style={{ color: props.color }}>{props.name}:{props.children}</h1>
}
let element = <FunctionComponent color="orange" name="luoziyu" age={25} >我是函数组件的儿子</FunctionComponent>
console.log(element);
ReactDOM.render(element, document.getElementById('root'));
```
antd组件库

```js
function FunctionComponent(props) {
    return React.createElement("h1", {
        className: "title",
        style: {
            color: props.color
        }
    }, props.name, ":", props.children)
}

let element = React.createElement(FunctionComponent, {
  color: "orange",
  name: "luoziyu",
  age: 25
}, "\u6211\u662F\u51FD\u6570\u7EC4\u4EF6\u7684\u513F\u5B50")

console.log(element)
// {
//     $$typeof: Symbol(react.element),
//     key: undefined,
//     props: {
//         color: "orange",
//         name: "luoziyu",
//         age: 25,
//         children: {
//             props: "我是函数组件的儿子"
//         }
//     },
//     ref: undefined,
//     type: FunctionComponent(props)
// }
ReactDOM.render(element, document.getElementById('root'));
```

函数组件调用也是JSX语法，在打包后，同样将被编译为`createElement`函数的形式。

不同的是:

原生节点直接将DOM标签作为类型传入，组件节点则传入组件函数本身作为类型

这也是为什么函数需要先引入后使用，需要当前执行上下文中存在此函数，才能执行。

> 注意：分清哪部分代码在编译时执行，哪部分代码在浏览器中执行

展示代码

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

如果新虚拟DOM节点 和 旧虚拟DOM节点较大不同，则删除 旧真实DOM节点，创建新真实DOM节点

(Diff的根本目的是尽量复用旧DOM节点，从而节省性能)

### React.createElement 和 ReactDOM.render 原理

现在我们知道了，要理解react，这两个函数就是我们的切入点，

理解了这两个函数，就能理解react的运行

直接上代码




这期的时间应该勉强够讲完函数组件的初始化，还有类组件的初始化和更新

因为函数组件的更新涉及hooks，讲起来就多了

函数组件的初始化更好理解，类组件的更新更好理解(代码简单，思想是一样的)

React的原理就是这么简单(不含fiber时)

react的事件绑定

类组件的更新是合并，函数组件的更新是直接替换，

每一个虚拟DOM都会对应一个真实DOM吗 

createDOM 递归调用，会产生多层虚拟DOM，最终会层层传递，返回一个唯一根节点的真实DOM

vdom.oldRenderVdom上会挂载其渲染的子Vdom(多层函数组件嵌套)，而子vdom链的终点，必然是一个真实DOM

每一个组件渲染的时候都能想象其渲染过程，更新的时候想象其更新过程。

更新和初始化是两条基本不同的运行路线，

再稍微多讲一点，代码都会开始变复杂了。

### 组件的更新以及为什么说React不是MVVM框架

上面聊的所有其实都是 React项目的初始化，或者说组件的初始化

因为，组件的更新 相对复杂(但也很简单)，并且 组件的更新 和初始化异曲同工。

所有框架的学习有两点关键，跟着这两个流程走，能思路更为清晰。

也就是 __初始化__ 和 __更新__

__更新__

### ref

### DOMDiff






