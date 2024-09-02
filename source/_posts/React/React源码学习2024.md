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

## DOM-Diff原理

`DOM-Diff` 用于找出 新旧虚拟DOM的不同, 根据 虚拟DOM的不同 去更新真实DOM, 从而做到复用真实DOM, 减少渲染

在React中由 `reconcileSingleElement`, `reconcileChildrenArray` 两个函数进行处理。

`reconcileSingleElement`，根据新旧vdom比较两个节点，

1. 如果二者type不同，卸载 oldVdom 整个分支，根据 新vdom 创建 新真实DOM分支，并插入。

2. 如果二者type相同，复用 旧真实DOM，更新 真实DOM的Props属性，`updateChildren` 更新子节点。

`reconcileChildrenArray`

__遍历__ 先遍历一遍 新虚拟DOM数组, 对每个 新虚拟DOM 都会记录其需要做的操作，创建 移动 删除

找 旧虚拟DOM中 key值相同的 能复用的 虚拟DOM,

把可以直接复用 而不用移动的, 留着 并对其递归调用compareTwoVdom深度对比更新属性和其子节点,

__记录__ 把 需要移动的 Move节点 以及 需要新建的 Create节点 新旧虚拟DOM及其插入位置 记录下来

__删除__ 在真实DOM中卸载 需要移动 以及没复用到的 旧真实DOM

__创建__ 重新按顺序创建更新 Move节点的真实DOM 以及 Create节点的真实DOM 并插入文档流

> 0. React的 Diff算法 只同层级比较，不同key不同type直接替换整个分支
> 1. 可以直接复用而不需要移动的节点:
> diff 会永远保证后续新复用的新旧节点相对位置一致，不一致的可复用旧节点会被标记为move, 从而被直接删除
> 2. 如果遍历到 第一个 新虚拟DOM 能复用 最后一个 旧虚拟DOM，则中间所有的可复用虚拟DOM对应的真实DOM 都会被从上下文删除再创建
> 3. 待补充，使用index作为key
