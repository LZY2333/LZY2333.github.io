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

[🔥 连八股文都不懂还指望在前端混下去么](https://juejin.cn/post/7016593221815910408#heading-71)


## React

### 1. 请说一下你对 React 的理解?

[珠峰](http://zhufengpeixun.com/strong/html/126.11.react-1.html)




## JSX

[珠峰](http://zhufengpeixun.com/strong/html/126.11.react-1.html#t112.%E4%B8%BA%E4%BB%80%E4%B9%88%20React%20%E4%BC%9A%E5%BC%95%E5%85%A5%20JSX?)




## React事件机制

### 1. 描述一下React的事件机制，优点，缺点？

[珠峰](http://zhufengpeixun.com/strong/html/126.12.react-4.html#t102.React%E4%BA%8B%E4%BB%B6%E7%B3%BB%E7%BB%9F)

[珠峰](http://zhufengpeixun.com/strong/html/126.11.react-1.html#t707.%20%E8%AF%B7%E8%AF%B4%E4%B8%80%E4%B8%8B%E4%BD%A0%E5%AF%B9%20React%20%E5%90%88%E6%88%90%E4%BA%8B%E4%BB%B6%E7%9A%84%E7%90%86%E8%A7%A3%EF%BC%9F)

### 2. 16和17事件机制有什么不同？

### 3. React 中 onChange 的原生事件是什么？





## Hooks

### 1. 为什么 React 和 Vue3 都选择了hooks，它带来了那些便利？

[浅谈：为啥vue和react都选择了Hooks🏂？](https://juejin.cn/post/7066951709678895141)

[在 Vue3 中实现 React 原生 Hooks（useState、useEffect）进而深入理解 React Hooks 的本质原理](https://juejin.cn/post/7121363865840910372)

[大厂面试题每日一题](https://q.shanyue.tech/fe/react/14.html)

[Hooks 对于 Vue 意味着什么？](https://juejin.cn/post/7062259204941152293)

[React Hooks：给React带来了什么变化？](https://juejin.cn/post/6844904149453111304)

### 2. 为什么不能在条件和循环里使用Hooks？

[为什么不能在条件和循环里使用Hooks?](https://zh-hans.reactjs.org/docs/hooks-rules.html#explanation)

### 3. 为什么不能在函数组件外部使用Hooks？

### 4. React Hooks的状态保存在了哪里？

### 5. 为什么传入二次相同的状态，函数组件不更新？ 

### 6. HOC 和 hook 的区别？

[【React深入】从Mixin到HOC再到Hook](https://juejin.cn/post/6844903815762673671)

### 7. 如何将类组件转换为函数组件？

[[译] 5种方法将React类组件转换为具有React Hooks的功能组件](https://juejin.cn/post/6844903830203678727)

### 1. 函数组件的useState和类组件的setState有什么区别？

### 2. react hooks 中如何模拟 componentDidMount

`useEffect(callback, []);`

useState useEffect用法及原理

useReducer 和 useContext

自定义Hook 和 useCallback

useEffect 和 useLayoutEffect 区别

useCallback() 和 useMemo() 的区别

useEffect 依赖为空数组与 componentDidMount 区别




## 请说一下React中的渲染流程

[珠峰](http://zhufengpeixun.com/strong/html/126.11.react-1.html#t485.%20%E8%AF%B7%E8%AF%B4%E4%B8%80%E4%B8%8B%20React%20%E4%B8%AD%E7%9A%84%E6%B8%B2%E6%9F%93%E6%B5%81%E7%A8%8B)





## diff算法





## 函数组件和类组件

[珠峰](http://zhufengpeixun.com/strong/html/126.11.react-1.html#t354.%20%E5%87%BD%E6%95%B0%E7%BB%84%E4%BB%B6%E5%92%8C%E7%B1%BB%E7%BB%84%E4%BB%B6%E7%9A%84%E7%9B%B8%E5%90%8C%E7%82%B9%E5%92%8C%E4%B8%8D%E5%90%8C%E7%82%B9?)





## React Fiber

[React 中 fiber 是用来做什么的](https://q.shanyue.tech/fe/react/165.html)






## React-router

[React/Vue 中的 router 实现原理如何](https://q.shanyue.tech/fe/react/463.html#history-api)





## React组件通信方式

[八股文](https://juejin.cn/post/7016593221815910408#heading-71)






## React版本区别

React15 和 16 执行过程的区别 初始化  更新

### React 17.0 有什么变化

1.合成事件的变化，事件委托放在了 root 元素上，同时去掉了事件池

2.全新 jsx 的变化，可以单独使用 jsx，不需要手动引入 react;

旧版 jsx 会被转换为 React.createElement, 新版 jsx 转换为_jsx()

### React 18.0 有哪些更新







## 性能优化

### 1. 在 React 中如何做好性能优化 ?

代码分割 (在 React 中如何实现代码分割)[https://zh-hans.reactjs.org/docs/code-splitting.html]

### react 与 vue 数组中 key 的作用是什么？

提升diff算法的判断速度，

diff算法 会首先判断 新旧 key 和 元素类型 是否一致，如果一致再去递归判断子节点




## 虚拟DOM带来了什么好处？

[大厂面试题每日一题](https://q.shanyue.tech/fe/react/70.html)

## 什么是函数式编程

## 类组件

(类组件有哪些缺点?)(生命周期有哪些)(setState 同步还是异步)

[先记一下位置回头总结](https://www.modb.pro/db/122805)

## React 涉及的算法

## LRU算法
在React16.6引入了Suspense和React.lazy，用来分割组件代码。