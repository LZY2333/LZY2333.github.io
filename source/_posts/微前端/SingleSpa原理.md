---
title: SingleSpa
date: 2023-09-13 19:27:19
categories: 技术栈
tags: 
    - 微前端
---


## SingleSpa

### 原理

微应用提供的四个生命周期接口

加载loadApp 激活bootstrap 挂载mount 卸载unmount

singleSpa 监听路由的变化，通过调用微应用的生命周期接口，调度微应用


### 实现原理

自己先addEventListener，监听'hashchange','popstate'，触发检测，检测中根据路由调度微应用的加载和挂载

额外劫持了pushState，replaceState，在劫持中手动派发popstate事件，
因为这两个造成的路由切换不会触发 'hashchange','popstate'的监听，

劫持了addEventListener,如果用户对'hashchange','popstate'进行了监听,
则延后执行 用户的 监听callback,等我 singleSpa把应用 加载 挂载完之后，再去执行用户的callback
