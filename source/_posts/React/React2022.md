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











### fiber

React16.13 开始中使用了 Fiber 架构

React Fiber 是 React 核心算法的重新实现。

它的主要特点是渐进式渲染: 能够将渲染工作分割成块，并将其分散到多个帧。

#### Fiber解决卡顿

React15更新时 采用深度优先遍历 递归比对vdom树 同步更新变动的节点 的策略 (__Reconciliation协调__ 阶段)

这种递归调用 无法中断, 而 JS 线程和渲染线程是互斥的, 如果 JS 执行时间过长 导致一直占用主线程, 引起浏览器卡顿

且 递归调用 调用栈太深时 资源占用高 


于是引入 Fiber 进行调度, 把 __Reconciliation协调__ 过程拆分为 更小粒度 可随时停止 可继续执行

适时地让出 执行权, 让浏览器能及时响应用户交互 UI渲染

那么问题来了,

应该什么时候执行,什么时候让出执行权?

如何让出执行权?

如何拆分成更小粒度?

应该拆成多小的粒度?

#### 为什么说React15协调阶段不能被中断

以前是函数递归遍历，生成新虚拟DOM，新旧虚拟DOM进行比较，更新真实DOM。

如果中途中断函数调用，则执行栈销毁，无法恢复之前的进度。

React Fiber 先将虚拟DOM构建为Fiber树(初始化时就构建了)，

更新时每执行完一个fiber，就检查剩余时间，只要记录好当前fiber，随时中断，随时开始


React15
```js
//我们有一个虚拟DOM
let element = (
  <div id="A1">
    <div id="B1">
      <div id="C1"></div>
      <div id="C2"></div>
    </div>
    <div id="B2"></div>
  </div>
)
//虚拟DOM
let vdom = {
  "type": "div",
  "key": "A1",
  "props": {
    "id": "A1",
    "children": [
      {
        "type": "div",
        "key": "B1",
        "props": {
          "id": "B1",
          "children": [
            {
              "type": "div",
              "key": "C1",
              "props": { "id": "C1" },
            },
            {
              "type": "div",
              "key": "C2",
              "props": { "id": "C2" },
            }
          ]
        },
      },
      {
        "type": "div",
        "key": "B2",
        "props": { "id": "B2" },
      }
    ]
  },
}
//以前我们直接把vdom渲染成了真实DOM
function render(vdom, container) {
  //根据虚拟DOM生成真实DOM
  let dom = document.createElement(vdom.type);
  //把除children以外的属性拷贝到真实DOM上
  Object.keys(vdom.props).filter(key => key !== 'children').forEach(key => {
    dom[key] = vdom.props[key];
  });
  //把此虚拟DOM的子节点，也渲染到父节点真实DOM上
  if (Array.isArray(vdom.props.children)) {
    vdom.props.children.forEach(child => render(child, dom));
  }
  container.appendChild(dom);
}
```

React Fiber
```js
//1.把虚拟DOM构建成fiber树
let A1 = { type: 'div', props: { id: 'A1' } };
let B1 = { type: 'div', props: { id: 'B1' }, return: A1 };
let B2 = { type: 'div', props: { id: 'B2' }, return: A1 };
let C1 = { type: 'div', props: { id: 'C1' }, return: B1 };
let C2 = { type: 'div', props: { id: 'C2' }, return: B1 };
//A1的第一个子节点B1
A1.child = B1;
//B1的弟弟是B2
B1.sibling = B2;
//B1的第一个子节点C1
B1.child = C1;
//C1的弟弟是C2
C1.sibling = C2;

//下一个工作单元
let nextUnitOfWork = null;
const hasTimeRemaining = () => Math.floor(Math.random() * 10) % 2 == 0;
//render工作循环
function workLoop() {
  debugger
  //工作循环每一次处理一个fiber,处理完以后可以暂停
  //如果有下一个任务并且有剩余的时间的话，执行下一个工作单元，也就是一个fiber
  while (nextUnitOfWork && hasTimeRemaining()) {
    //执行一个任务并返回下一个任务
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
  }
  console.log('render阶段结束');
  //render阶段结束
}
function performUnitOfWork(fiber) {// A1
  let child = beginWork(fiber);
  //如果执行完A1之后，会返回A1的第一个子节点
  if (child) {
    return child;
  }
  //如果没有子节点
  while (fiber) {//如果没有子节点说明当前节点已经完成了渲染工作
    completeUnitOfWork(fiber);//可以结束此fiber的渲染了 
    if (fiber.sibling) {//如果它有弟弟就返回弟弟
      return fiber.sibling;
    }
    fiber = fiber.return;//如果没有弟弟让爸爸完成，然后找叔叔
  }
}
function beginWork(fiber) {
  console.log('beginWork', fiber.props.id);
  return fiber.child;//B1
}
function completeUnitOfWork(fiber) {
  console.log('completeUnitOfWork', fiber.props.id);
}
nextUnitOfWork = A1;
workLoop();
```

#### 卡顿也被称为掉帧

浏览器的页面是一帧一帧绘制出来的,帧率与设备刷新率保持一致.

假设60hz, 即1000ms刷新60次, 一帧16.6ms, 此时页面渲染是流畅的.

每一帧的开头, 浏览器需要进行 事件处理 UI渲染等高优先级操作, 之后是空闲阶段

![一个完整的帧](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/4f288e9135ed414d871ad2fd2715d85d~tplv-k3u1fbpfcp-zoom-in-crop-mark:3024:0:0:0.awebp)

1. event事件
2. timer定时器
3. begin Frame 开始帧
4. requestAnimationFrame (请求动画帧)
5. Layout布局
6. Pain绘制
7. requestIdleCallback (Idle Peroid 空闲时间)

#### Fiber基本原理

在 浏览器每帧的空闲阶段 执行 已被拆分成小任务的 协调, 在每一个小任务 执行完后检查 当前帧剩余时间,

如仍有剩余则继续下一个小任务, 如果当前帧已到时限则停止执行,等待下一帧的空闲时间继续执行,

知道 当前协调执行完毕.

__requestAnimationFrame__ 浏览器提供的Api,其注册是回调函数会在4.阶段专门执行.

__requestIdleCallback__ 浏览器提供的Api,其注册是回调函数会在空闲阶段执行.

#### 什么是Fiber

1. Fiber 可以理解为是一个执行单元，也可以理解为是一种数据结构。

2. Fiber 将React的更新进行了更细粒度的拆分，使得其可以被中断和恢复，不阻塞主进程执行高优先级的任务

react请求调度，浏览器执行高优先任务，空闲时间执行react任务

空闲时间，一个个执行任务单元，每次执行完检查一次是否还有空闲时间，

如果有，继续下一个任务单元，

如果没有空闲时间 或 没有任务单元，停止继续执行任务单元，当前同步任务结束，浏览器进入下一个循环

```js
function sleep(duration) {
    for (var t = Date.now(); Date.now() - t <= duration;) { }
}
const fibers = [
    () => {
        console.log('第1个任务开始');
        sleep(5000);
        console.log('第1个任务结束');
    },
    () => {
        console.log('第2个任务开始');
        sleep(20);
        console.log('第2个任务结束');
    },
    () => {
        console.log('第3个任务开始');
        sleep(20);
        console.log('第3个任务结束');
    }
]
requestIdleCallback(workLoop);
function workLoop(deadline) {
    //因为一帧是16.6ms,浏览器执行完高优先级之后，如果还有时间，会执行workLoop,timeRemaining获取此帧剩下的时间
    console.log(`本帧的剩余时间是`, deadline.timeRemaining());
    //如果没有剩余时间了，就会跳出循环
    while (deadline.timeRemaining() > 1 && works.length > 0) {
        performUnitOfWork();
    }
    //如果还有剩余任务
    if (works.length > 0) {
        console.log(`只剩下${deadline.timeRemaining()}ms，不够了，等待浏览器下次空闲 的时候再帮我调用`,);
        requestIdleCallback(workLoop);
    }
}
function performUnitOfWork() {
    let work = works.shift();//取出任务数组中的第一个任务,并移除第一个任务
    work();
}
```
合作式调度

#### Fiber的链表结构

Fiber 是一个单链表树结构, 以 单链表 的数据结构, 以 后续遍历 的顺序,储存了 vdom树结构



#### 额外

1.先有虚拟DOM -> fiber节点 -> 真实DOM

__虚拟DOM和Fiber的结构是一样的，不过虚拟DOM是对象形式，Fiber是链表形式，描述的都是DOM树，同种数据的不同储存方式。__

Fiber树在初始的时候会建立，后续通过增删改修改Fiber树。 


回头再补:React18以前会EffectList(副作用链)收集副作用，React18.2没有effect了。现在从根节点递归收集副作用


### 为什么说React不是MVVM框架







JS的执行和浏览器渲染 两个进程 互斥，JS一直递归调用，不让出主进程，则浏览器不会开始渲染页面。