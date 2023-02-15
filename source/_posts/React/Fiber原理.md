---
title: Fiber原理
date: 2022-06-26 17:34:22
categories: 经验帖
tags: 
    - React
---

### fiber

React16.13 开始中使用了 Fiber 架构

React Fiber 是 React 核心算法的重新实现。

它的主要特点是渐进式渲染: 能够将渲染工作分割成块，并将其分散到多个帧。

fiber 结构就是为实现并发而准备的。

[神光大佬的彻底搞懂 React 18 并发机制的原理](https://mp.weixin.qq.com/s/mQ2xQi9K1d6idAAsQSw0Mw)

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

Reconciler 递归生成新虚拟DOM树的过程无法中断，递归更新时间超过了16ms，用户会感觉卡顿掉帧。

无法中断让渡给渲染线程，如果中途中断函数调用，则执行栈销毁，无法复用之前的中间状态。

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

#### 卡顿即掉帧

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

虚拟DOM和Fiber是一一对应的，虚拟DOM是对象形式，Fiber是链表形式，且储存了更多更新信息，描述的都是DOM树。

Fiber树在初始的时候会建立，后续通过增删改修改Fiber树。 


回头再补:React18以前会EffectList(副作用链)收集副作用，React18.2没有effect了。现在从根节点递归收集副作用

#### 为什么Vue不需要Fiber



### 之后的内容均未定.....TODO.....


Fiber 的粒度为 vdom, 每一个 vdom 内都被表示为 一个Fiber(整个React也是一个Fiber)

Fiber 的链表结构,每一个单元包含了 payload（数据）和nextUpdate（指向下一个单元的指针）
```js
// 一个更新单元,例如一次setState,在创建时 nextUpdate为空,在进入updateQueue内才会用上
class Update {
    constructor(payload, nextUpdate) {
        this.payload = payload // setState 传的数据 或 函数
        this.nextUpdate = nextUpdate // 下一个要执行的 Update 的指针
    }
}
// 更新队列
class UpdateQueue {
    constructor() {
        this.baseState = null // 总状态,上一次的状态
        this.firstUpdate = null // 更新链表的头
        this.lastUpdate = null // 更新链表的尾
    }
    enqueueUpdate(update) {
        // 当前链表是空链表
        if (!this.firstUpdate) {
            this.firstUpdate = this.lastUpdate = update
        } else {
            // 当前链表不为空
            this.lastUpdate.nextUpdate = update
            this.lastUpdate = update
        }
    }

    // 获取state，然后遍历这个链表，进行更新
    forceUpdate() {
        let currentState = this.baseState || {}
        let currentUpdate = this.firstUpdate
        while (currentUpdate) {
            // 判断是函数还是对象，是函数则需要执行，是对象则直接返回
            let nextState = typeof currentUpdate.payload === 'function' ? currentUpdate.payload(currentState) : currentUpdate.payload
            currentState = { ...currentState, ...nextState }
            currentUpdate = currentUpdate.nextUpdate
        }
        // 更新完成后清空链表
        this.firstUpdate = this.lastUpdate = null
        this.baseState = currentState
        return currentState
    }

}

let queue = new UpdateQueue()
queue.enqueueUpdate(new Update({ name: 'www' }))
queue.enqueueUpdate(new Update({ age: 10 }))
queue.enqueueUpdate(new Update(state => ({ age: state.age + 1 })))
queue.enqueueUpdate(new Update(state => ({ age: state.age + 1 })))
queue.forceUpdate()
console.log(queue.baseState);
```

__特别像vue2的依赖收集!!!!__

[如何理解 React Fiber 架构？](https://www.zhihu.com/question/49496872/answer/2137978516)

### 为什么Vue不需要Fiber

Vue的更新粒度为组件级,更新粒度更小

React的不论在哪setState,都是从根节点开始更新的

react因为先天的不足——无法精确更新，所以需要react fiber把组件渲染工作切片；而vue基于数据劫持，更新粒度很小，没有这个压力；

### 感谢



有一说一,这篇文章对Fiber的结构讲得不是很清楚[走进React Fiber的世界](https://juejin.cn/post/6943896410987659277#comment)



### 回头看
[为什么 React 的 Diff 算法不采用 Vue 的双端对比算法？](https://juejin.cn/post/7116141318853623839#heading-10)

[函数式组件与类组件有何不同？](https://overreacted.io/zh-hans/how-are-function-components-different-from-classes/)
