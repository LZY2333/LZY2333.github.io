---
title: React源码学习2024
date: 2024-09-01 16:19:19
categories: 技术栈
tags: 
    - React
---

## 函数组件实现

打包时, 被babel解析为

## 类组件实现

## 类组件更新原理

## 事件合成原理

## useRef原理

`useRef`只是创建了一个对象,然后将该对象保存在Fiber节点之后能随时拿到

reactDOM 在执行渲染时, 检测到某ReactElement挂载了Ref属性,

会将 该ReactElement的真实DOM 挂载在 Ref的current属性上.

> 原生DOM  会挂载其真实DOM
> 类组件   会挂载其实例
> 函数组件 则由内部自行定义挂载逻辑, 比如 useImperativeHandle, 比如透传给原生DOM
> 函数组件没有实例, 每次调用都是直接返回视图

## React.forwardRef原理

`React.forwardRef` 用于转发ref, 让函数组件能获取到父组件挂载的ref

`React.forwardRef` 本质只是简单的接收一个 函数组件render, 返回 具有render属性, type属性 的 虚拟DOM对象

reactDom解析到一个虚拟DOM type为forwardRef时,即为 forwardRef生成的组件,

就会将props和ref 传递给render函数执行, 拿到 虚拟DOM对象, 再继续递归挂载真实DOM

> 裸函数组件无法直接从Props内拿到ref,
> 打包时, babel解析组件标签, ref作为props属性传递,
> 执行时, `React.createElement` 执行会删除Props上的ref, key, 将其挂载为Props同级属性, 返回 虚拟DOM对象

## DOM-Diff原理(补充具体是哪两个函数名称)

`DOM-Diff` 用于找出 变更的虚拟DOM，根据变更的虚拟DOM 去更新真实DOM, 从而做到复用真实DOM, 减少渲染

在React中由 `reconcileSingleElement`, `reconcileChildrenArray` 两个函数进行处理。

diff 最核心的是对 新旧子虚拟DOM 的比较，用到了最关键的key值，根据key值是否相同 判断是否能复用真实DOM

`reconcileChildrenArray`

__遍历__ 新虚拟DOM数组, 对每个 新虚拟DOM 都会记录其需要做的操作，创建 移动 删除

找 旧虚拟DOM中 key值相同的 能复用的 虚拟DOM,

把可以直接复用 而不用移动的, 留着 并对其递归调用 更新深度对比更新属性和其子节点,

__记录__ 把 需要移动的 Move节点 以及 需要新建的 Create节点 新旧虚拟DOM及其插入位置 记录下来

__删除__ 在真实DOM中卸载 需要移动 以及没复用到的 旧真实DOM

__创建__ 重新按顺序创建更新 Move节点的真实DOM 以及 Create节点的真实DOM 并插入文档流

`reconcileSingleElement`，通过type比较

1. 如果二者type不同，卸载 oldVdom 整个分支，根据 新vdom 创建 新真实DOM分支，并插入。

2. 如果二者type相同，复用 旧真实DOM，更新 真实DOM的Props属性，`updateChildren` 更新子节点。

> 0. React的 Diff算法 只同层级比较，不同key不同type直接替换整个分支
> 1. 可以直接复用而不需要移动的节点:
> diff 会永远保证后续复用的旧节点相对位置一致，不一致的可复用旧节点会被标记为move, 其真实DOM会先卸载再更新插入
> 比如 1234 变成 4123
> 2. 如果遍历到 第一个 新虚拟DOM 能复用 最后一个 旧虚拟DOM，则中间所有的可复用虚拟DOM对应的真实DOM 都会被从上下文删除再创建
> 3. 待补充，使用index作为key

## React.memo原理

react.memo返回的不是虚拟dom是一个普通对象，&&type为memo。`<memoedFunction />`标签解析返回为&&type是reactNode，type是memo返回的对象，type.type是函数组件render

type就是函数组件函数本身，作为函数传入，创建dom时调用。

### 浅比较

> PureComponent 就是基于类组件的 shouldComponentUpdate 与 浅比较 实现

## 类组件存在三个问题

https://legacy.reactjs.org/docs/hooks-intro.html#motivation

第四点，类组件对渲染性能优化不友好

## Hooks原理

不建议使用useLayoutEffect

https://react.dev/reference/react/useLayoutEffect#caveats

原始版本是全局变量来控制hooks，react18不是。都是存在数据池中。hooks就是从数据池中捞数据并返回。

## Fiber架构优点

js单线程占用浏览器主进程和渲染流程互斥。js递归调用执行太久导致卡顿明显，且递归调用无法挂起和恢复。浏览器空闲时再进行协调计算，减少对渲染进程的阻塞。

想要实现挂起和恢复，首先要做任务的拆分。于是需要fiber

虚拟dom -> fiber树 -> 真实dom -> 挂载

fiber作为桥梁能做很多事情

为什么要使用fiber架构，fiber架构能拆分任务。
1.从而实现，时间切片，并发模式，优先级调度，从而解决性能问题。
2.更好的可维护性可扩展，使得内部代码更模块化。

> 帧与卡顿

https://developer.chrome.com/blog/inside-browser-part3?hl=zh-cn#inner-workings-of-a-render-process

> requestIdleCallback，获取浏览器空闲时间。但react源码并没有使用此api，存在浏览器兼容问题，调用时间不可控，子任务消耗大同样会有性能问题，没有优先级。
> 组件和原生标签都会生成fiber节点

## Fiber是什么

fiber是什么，三种解释，fiber具有的属性

## 待确定主题

Fiber架构介绍
https://github.com/acdlite/react-fiber-architecture

### 工作循环(？)

协调：计算新的组件状态和虚拟dom，这个阶段会被拆分成较小的工作单元
提交：辅助讲新的虚拟dom应用到实际的dom上（？）

### 并发模式

并发模式（原本的大任务拆成小任务，在空闲时间执行？），
时间切片（在浏览器每次空闲时间做任务），
优先级调度
