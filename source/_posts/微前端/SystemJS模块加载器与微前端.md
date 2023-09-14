---
title: systemJS
date: 2022-09-14 23:24:22
categories: 技术栈
tags: 
    - 微前端
---

## systemJS

### 微前端

#### 第一步，解决了什么痛点:
__大应用拆分__
__渐进式技术栈升级__

附带优势:
__多团队合作，独立部署__

#### 第二步，实现了什么功能:
__沙箱:CSS隔离，JS隔离，路由隔离__
__微应用调度__

#### 第三步，如何实现沙箱和微应用调度....
qiankun:   实现微应用接入配置简化，无痛接入，实现沙箱
singleSpa: 实现基于路由进行微应用调度，定义了微应用生命周期
systemJS:  实现模块化加载

三者是层层递进的关系，qiankun的实现依赖了singleSpa，singleSpa依赖了systemJS

本文将从从最基础的systemJS展开，systemJS的原理

### 模块规范

前端的工程化中最重要的就是模块化

模块: 实现特定功能的文件，每个文件作用域相互独立，通过暴露接口相互引用

模块化优势: 复用性 可维护性 命名冲突 按需加载

模块化规范: ESM，CJS，UMD，AMD，CMD

> 就像主机间的沟通需要各种协议，模块化也有各类规范，其实都是一种统一约定

SystemJS 最初诞生的目的是为了做一个通用的模块加载器，在浏览器端实现对 CommonJS、AMD、UMD 等各种模块的加载。

### systemJS使用


### systemJS原理



CDN是什么原理

[SystemJS 探秘](https://zhuanlan.zhihu.com/p/402155045)

ESModule、CommonJS、AMD、UMD、SystemJS

[学习ES模块、CommonJS、AMD、UMD、SystemJS](https://juejin.cn/post/6870141103958589454#comment)