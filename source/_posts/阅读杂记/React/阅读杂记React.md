---
title: 阅读杂记React
date: 2022-04-29 14:58:58
categories: 经验帖
tags:
    - React
    - 杂记
summary: jS杂记，阅读杂记系列为 【对日常看过的一些有趣帖子的笔记】/【对某一细节进行搜索深入了解后的分析】/【对某一技术原理架构分析后的脑图】，总贴记录 待研究的知识点 及 小知识点，分贴记录大知识点
---

# 阅读杂记React

[一文带你梳理React面试题（2023年版本）](https://juejin.cn/post/7182382408807743548#heading-13)

## 虚拟DOM带来了什么好处？

[大厂面试题每日一题](https://q.shanyue.tech/fe/react/70.html)

## React事件系统

React 中 onChange 的原生事件是什么？

16和17事件机制有什么不同？

这样做的优点
抹平浏览器差异,更好的实现跨平台
方便

## Hooks

### Hooks特性

react hooks，它带来了那些便利？

[大厂面试题每日一题](https://q.shanyue.tech/fe/react/14.html)

[为什么不能在条件和循环里使用Hooks?](https://zh-hans.reactjs.org/docs/hooks-rules.html#explanation)


为什么不能在函数组件外部使用Hooks?

React Hooks的状态保存在了哪里?

为什么传入二次相同的状态，函数组件不更新?

函数组件的useState和类组件的setState有什么区别?

HOC 和 hook 的区别

react hooks 与 class 组件对比


### Hooks个体
useState useEffect用法及原理

useReducer 和 useContext

自定义Hook 和 useCallback

useEffect 和 useLayoutEffect 区别

useCallback() 和 useMemo() 的区别

useEffect 依赖为空数组与 componentDidMount 区别


### 其他

[useEffect 中如何使用 async/await](https://q.shanyue.tech/fe/react/236.html)
### react hooks 中如何模拟 componentDidMount

`useEffect(callback, []);`


## React Fiber

[React 中 fiber 是用来做什么的](https://q.shanyue.tech/fe/react/165.html)

## 请说一下React中的渲染流程

## React版本区别

React15 和 16 执行过程的区别

初始化  更新

### React 17.0 有什么变化

1.合成事件的变化，事件委托放在了 root 元素上，同时去掉了事件池

2.全新 jsx 的变化，可以单独使用 jsx，不需要手动引入 react;

旧版 jsx 会被转换为 React.createElement, 新版 jsx 转换为_jsx()


## React-router

[React/Vue 中的 router 实现原理如何](https://q.shanyue.tech/fe/react/463.html#history-api)




## React18有哪些更新


## 性能优化

在 React 中如何做好性能优化 ?

### 代码分割

(在 React 中如何实现代码分割)[https://zh-hans.reactjs.org/docs/code-splitting.html]

### react 与 vue 数组中 key 的作用是什么？

提升diff算法的判断速度，

diff算法 会首先判断 新旧 key 和 元素类型 是否一致，如果一致再去递归判断子节点








## 什么是函数式编程

## 类组件

类组件有哪些缺点?

(先记一下位置回头总结)[https://www.modb.pro/db/122805]

生命周期有哪些

setState 同步还是异步

## React 涉及的算法
## LRU算法
在React16.6引入了Suspense和React.lazy，用来分割组件代码。