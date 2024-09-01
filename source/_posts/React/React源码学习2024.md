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

`React.forwardRef` 本质上是接收一个 函数组件render, 返回 具有render属性, type属性 的 virtualDOM对象

reactDom解析到一个组件一个 virtualDOM, type为forwardRef时,

就会将props和ref 传递给render函数执行, 拿到 virtualDOM对象

> 裸函数组件无法直接从Props内拿到ref,
> 打包时, babel解析组件标签, ref作为props属性传递,
> 执行时, `React.createElement` 执行会删除Props上的ref, key, 将其挂载为Props同级属性, 返回 virtualDOM对象

## Mount

mount阶段仅比render阶段多一个Diff操作

`DOM-Diff` 用于找出 新旧虚拟DOM的不同, 根据 虚拟DOM的不同 去更新真实DOM

> render 和 mount 三个步骤相同: 生成 virtualDOM, 转化 真实DOM,  挂载 真实DOM
