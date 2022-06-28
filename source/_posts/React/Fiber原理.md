---
title: Fiber原理
date: 2022-06-26 17:34:22
categories: 经验帖
tags: 
    - React
---

# Fiber

React16 以上的版本中使用了 Fiber 架构

React Fiber 是 React 核心算法的重新实现。

它的主要特点是渐进式渲染: 能够将渲染工作分割成块，并将其分散到多个帧。

### Fiber解决什么痛点

React15更新时 采用深度优先遍历 递归比对vdom树 同步更新变动的节点 的策略， __Reconciliation协调__ 阶段

这种递归调用 调用栈太深 资源占用高 无法中断, 执行时间长 导致一直占用主线程, 引起浏览器卡顿

于是引入 Fiber 进行调度, 把 __Reconciliation协调__ 过程拆分为 更小粒度 可随时停止 可继续执行

适时地让出 执行权, 让浏览器能及时响应用户交互 UI渲染


那么问题来了,

应该什么时候执行,什么时候让出执行权?

如何让出执行权?

如何拆分成更小粒度?

### 帧

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

__Fiber基本原理__

在 浏览器每帧的空闲阶段 执行 已被拆分成小任务的 协调, 在每一个小任务 执行完后检查 当前帧剩余时间,

如仍有剩余则继续下一个小任务, 如果当前帧已到时限则停止执行,等待下一帧的空闲时间继续执行,

知道 当前协调执行完毕.

__requestAnimationFrame__ 浏览器提供的Api,其注册是回调函数会在4.阶段专门执行.

__requestIdleCallback__ 浏览器提供的Api,其注册是回调函数会在空闲阶段执行.

### 什么是Fiber

1. Fiber 可以理解为是一个执行单元，也可以理解为是一种数据结构。

2. Fiber 将React的更新进行了更细粒度的拆分，使得其可以被中断和恢复，不阻塞主进程执行高优先级的任务

### Fiber的链表结构

Fiber 是一个单链表树结构, 以 单链表 的数据结构, 以 后续遍历 的顺序,储存了 vdom树结构



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



