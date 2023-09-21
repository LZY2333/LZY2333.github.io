---
title: SingleSpa
date: 2023-09-13 19:27:19
categories: 技术栈
tags: 
    - 微前端
---


## SingleSpa

### 微前端

#### 第一步，解决了什么痛点:
__大应用拆分__
__渐进式技术栈升级__

附带优势:
__多团队合作，独立部署__
__技术栈无关__

#### 第二步，实现了什么功能:
__沙箱:CSS隔离，JS隔离，路由隔离__
__微应用调度__

#### 第三步，如何实现沙箱和微应用调度....
qiankun:   实现沙箱，实现微应用接入配置简化，无痛接入
singleSpa: 实现基于路由进行微应用调度，定义了微应用生命周期
systemJS:  实现动态加载模块

三者是层层递进的关系，qiankun的实现依赖了singleSpa，singleSpa依赖了systemJS

本文将从从最基础的singleSpa展开，singleSpa的原理

### 使用方法

### 原理
基于路由的微前端

微应用提供的四个生命周期接口

加载loadApp 激活bootstrap 挂载mount 卸载unmount

singleSpa 监听路由的变化，通过调用微应用的生命周期接口，调度微应用


### 实现原理
相当于，在用户的路由监听之前，先监听了一层路由，其余基本和路由功能一样，没有沙箱功能

调用原生addEventListener，监听'hashchange','popstate'，
这两个路由事件触发时，检测中根据路由调度微应用

然后劫持了addEventListener,如果用户对'hashchange','popstate'进行了监听,
则延后执行 用户的 监听callback,等我 singleSpa把应用 加载 挂载完之后，再去执行用户的callback
劫持了用户的劫持

额外劫持了pushState，replaceState，在劫持中手动派发popstate事件，
因为这两个原生接口的调用，造成的路由切换不会触发 'hashchange','popstate'的监听，



如果有vue-router react-router的源码基础，对微前端更好理解，其实是一样的东西
但是微前端的对路由的拦截，比vue-router react-router更高一层，因为微前端拦截了addEventListener




每次路由发生变化，触发浏览器事件，触发singleSpa的监听回调，调用reroute方法，
遍历微应用activeWhen方法，根据路由，及微应用当前状态，将所有微应用分为三类 toUnMount toLoad toMount
如果根据当前路由，activeWhen返回true，代表你需要被展示，但是文件还没被加载，那就 toLoad，
如果文件已经被加载，那就 toMount， 如果activeWhen返回false， 那就 toUnMount

最后分别调用 这三类微应用的 unMount load mount 方法，完成一个singleSpa的生命周期。