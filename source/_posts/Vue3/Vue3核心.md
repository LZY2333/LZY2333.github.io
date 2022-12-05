---
title: Vue3核心
date: 2022-12-05 17:12:41
categories: 技术栈
tags: 
    - Vue3
---

## Vue3核心

### Vue3变化

__模块拆分__ 可单独使用Vue的某个模块，如Reactive响应式模块，而不引入整个Vue

__组合式API__ 通过TreeShaking实现按需引入，使用简洁，减少打包体积，抽取公共逻辑方便，无this指向疑惑

__自定义渲染器__ 针对不同平台基于Vue进行对接，更方便


### Proxy

#### 1. Proxy 解决了defineProperty 多个痛点


#### 2. Proxy 需要 receiver 和 reflect

> Reflect 用于属性绑定this，call用于函数绑定this

#### 3. WeakMap 与 多次代理 与 多层代理

多次代理: 对 同一对象 进行 多次proxy代理

多层代理: 对 对象代理返回的proxy对象，进行代理

这两种情况都需要提前判断，直接返回第一次代理的结果


__多层代理__

Vue3.0的方案, 创建一个反向映射表,Proxy => 原对象,浪费性能

现在的方案是, 

在 Proxy 的 get 上增加了一个Proxy标记,

进行代理前先检查 对象 是否存在该标记 表示已经是个 Proxy 直接返回该 对象

> WeakMap 的 key 只能是对象





## effect
顾名思义副作用