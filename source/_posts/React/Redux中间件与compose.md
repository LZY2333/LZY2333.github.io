---
title: Redux中间件与compose
date: 2022-03-09 15:36:26
categories: 技术栈
tags: 
    - React
---

# Redux中间件与compose

Redux中间件可以 在使用者 dispatch触发action后，在执行reducer更新视图前，做一些操作

本质上是做了 函数劫持，重写了`store.dispatch`方法，在`oldDispatch`执行前,