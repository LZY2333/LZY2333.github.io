---
title: React复习记录
date: 2022-11-1 15:54:54
categories: 技术栈
tags:
    - React
---
## React复习记录

本篇讲述 __React15原理__,从 __初始化__ 以及 __更新__ 两条线路进行.

同时我认为,要学习前端框架的原理,沿着这两条线进行学习,有事半功倍的效果.

React几个重要版本更新, 16 fiber, 16.8 hooks, 18 优先级调度 并发执行.

其中fiber,是 React 核心算法的重新实现,也就是说其核心思想依旧不变.

从React15开始,理解React原理,再加入fiber等后续更新,也更能理解fiber的存在价值.

最后要说的是,React15真的很简单,是我看过所有框架原理中最容易理解的一个.

相信读完本文,你也会感叹,原来是这样!

### 1. 代码中所有JSX其实都是函数

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

编译后的函数组件，其实就是返回一个`React.createElement()`

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

### 2. 函数组件的调用原理

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
// 定义一个函数组件,叫XXXXX
function XXXXX(props) {
    return React.createElement("h1", {
        className: "title",
        style: {
            color: props.color
        }
    }, props.name, ":", props.children)
}

let element = React.createElement(XXXXX, {
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
//     type: XXXXX
// }
ReactDOM.render(element, document.getElementById('root'));
```

函数组件调用也是JSX语法，在打包后，同样将被编译为`createElement`函数的形式。

不同的是:

原生节点直接将DOM标签作为 type 传入，函数组件节点则传入 函数本身 作为 type

(,供后续调用,后面会讲到,注意这个type 就是 函数XXXXX,后续可随时拿出来调用)

这也是为什么函数需要先引入后使用，因为 需要当前执行上下文中存在此函数，才能执行。



组件源码(JSX) --> 打包后的组件代码(createElement()) --> 浏览器运行后的组件返回值(描述真实DOM结构的对象)({})

__选择打包为函数，而不是直接打包为虚拟DOM，都返回的是全新的互不影响的虚拟DOM对象__

那么很明显,要理解react, createElement 和 render 这两个函数就是突破口.

### React.createElement 和 ReactDOM.render 原理

`React.createElement` 很简单,就是根据传入属性返回 虚拟DOM对象，以下称vdom，其中最重要的属性为Type

```js
{
    $$typeof: REACT_ELEMENT,// react元素标识
    type,//虚拟DOM元素的类型 'div' 'h1' 或 FunctionComponent
    ref,
    key,
    props// 这是属性对象 id className style ....
}
```

`ReactDOM.render` 代表渲染，使用`createDOM`将 虚拟节点 转换为真实节点，并通过`appendChild`挂载在容器中,完成渲染。

其中的`createDOM`,会判断传入的 vdom 的 type 属性,进行不同的操作,

例如 type 为`h1`等原生标签时, 直接通过 `document.createElement(type)` 创建真实DOM并返回,此时`createDOM`任务完成.

而当 type 为 函数组件时, 则会通过 调用该函数(也就是type)`type(props)`,得到函数组件返回的 第二层vdom.

(注意,函数组件本身是vdom,调用函数组件,会返回一个第二层vdom)

然后对第二层vdom 再次调用 `createDOM`,形成递归,(如果是函数组件返回函数组件,会产生多层递归,多层vdom)

直到获取到 原生标签产生的真实dom,这层的`createDOM`递归才算结束, 创建真实DOM并返回.

```js
/**
 * 需要把虚拟DOM转换成真实DOM并且插入容器中
 * @param {*} vdom 虚拟DOM 
 * @param {*} container 容器
 */
function render(vdom, container) {
  mount(vdom, container);
}
function mount(vdom, container) {
  let newDOM = createDOM(vdom);
  container.appendChild(newDOM);
}
function createDOM(vdom) {
    let { type, props } = vdom;
    let dom;//真实DOM
    if (typeof type === 'function') { // 如果是组件vdom,就调用相应处理
        if (type.isReactComponent) { // 下面两个函数也是返回真实DOM
            return mountClassComponent(vdom);
        } else {
            return mountFunctionComponent(vdom);
        }
    } else { // 如果是原生标签,直接创建真实DOM
        dom = document.createElement(type);
    }
    //让vdom的dom属性指定它创建出来的真实DOM
    vdom.dom = dom;
    return dom; // 返回真实DOM,给mount()函数,mount函数负责把真实DOM进行挂载
}

// *调用render,拿到第二层vdom后,又循环调用了createDOM,给第二层vdom进行转换成真实dom,再返回
function mountClassComponent(vdom) {
    //获取函数本身
    let { type: ClassComponent, props } = vdom;
    //把属性对象传递给函数执行，返回要渲染的虚拟DOM
    let classInstance = new ClassComponent(props);
    let renderVdom = classInstance.render();
    //把上一次render渲染得到的虚拟DOM
    vdom.oldRenderVdom = classInstance.oldRenderVdom = renderVdom;
    return createDOM(renderVdom);
}
function mountFunctionComponent(vdom) {
    //获取函数本身
    let { type, props } = vdom;
    //把属性对象传递给函数执行，返回要渲染的虚拟DOM
    let renderVdom = type(props);
    //vdom.老的要渲染的虚拟DOM=renderVdom,方便后面的DOM-Diff
    vdom.oldRenderVdom = renderVdom;
    return createDOM(renderVdom);
}
```
额外注意, 组件的 vdom虽然没挂载真实DOM,但是挂载了 `oldRenderVdom`,也就是第二层vdom.

其代表意义是 __该函数组件上一次渲染的vdom__, 

而第二层vdom 如果是原生标签 则没有此属性,`oldRenderVdom`为组件专属属性,用于DOM-Diff.

原生标签也有自己的属性 `dom` 指向其渲染的 真实DOM.

> 并非每个vdom都有自己对应的真实dom,或者说可能多层vdom对应一个真实dom,因为组件的存在.


当前真实DOM完成,__children属性上的子vdom开始渲染真实dom并挂载__

```js
function createDOM(vdom) {
  let { type, props } = vdom;
  let dom;
  // 创建当前层真实DOM
  if (type === REACT_TEXT) {
    dom = document.createTextNode(props);
  } else if (typeof type === 'function') {
    if (type.isReactComponent) {
      return mountClassComponent(vdom);
    } else {
      return mountFunctionComponent(vdom);
    }
  } else {
    dom = document.createElement(type);
  }
  if (props) {
    //更新真实dom的属性,如style
    updateProps(dom, props);
    
    //子vdom开始mount
    if (typeof props.children === 'object' && props.children.type) {
      mount(props.children, dom)
    } else if (Array.isArray(props.children)) {
      reconcileChildren(props.children, dom);
    }
  }
  //在创建真实DOM的，把虚拟DOM和真实DOM进行关联
  vdom.dom = dom;
  return dom;
}
function reconcileChildren(children, parentDOM) {
  for (let i = 0; i < children.length; i++) {
    mount(children[i], parentDOM)
  }
}
```

注意代码: 父真实dom先产生,后完成自己的mount(也就是appendChild)过程,

子真实dom后产生,却先于父节点完成自己的mount过程,把自己挂在父节点上.

自上而下,又自下而上的感觉.

最后一步,根真实dom 挂载在 root容器上,浏览器开始渲染dom,展示出视图,React初始化完成.


### 组件的更新以及为什么说React不是MVVM框架

上面聊的所有其实都是 React项目的初始化，或者说组件的初始化

因为，组件的更新 相对复杂(但也很简单)，并且 组件的更新 和初始化异曲同工。

所有框架的学习有两点关键，跟着这两个流程走，能思路更为清晰。

也就是 __初始化__ 和 __更新__

__更新__

### ref

### DOMDiff






