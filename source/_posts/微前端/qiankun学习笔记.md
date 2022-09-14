---
title: qiankun学习笔记
date: 2022-09-14 23:24:22
categories: 技术栈
tags: 
    - 微前端
---

## qiankun学习笔记

### 微前端

微前端 理念核心在于 __解耦__

将整个项目解耦为 一个个可以独立部署的项目，同时也可被主项目组合使用。

### 微前端的优点

1. __技术栈无关__: 不限制接入应用的技术栈，微应用具备完全自主权

2. __独立开发、独立部署__: 微应用仓库独立，前后端可独立开发，部署完成后主框架自动完成同步更新

3. __增量升级__: 渐进式重构的重要策略，新老技术栈同时应用

4. __独立运行时__: 微应用之间相互独立,状态不共享

[qiankun介绍](https://qiankun.umijs.org/zh/guide)

### Why Not Iframe

iframe 优势是能完美解决 样式隔离、js 隔离, 劣势是 无法突破这些隔离.

__URL不同步__. 例如: 刷新丢失URL,无法 前进 后退

__UI不同步,DOM结构不共享,无法合并计算样式.__ 例如: iframe内弹出的弹出,要求 遮罩 居中 随浏览器Resize

__全局上下文完全隔离，内存变量不共享__ 例如: 无法 数据状态同步, iframe设置的cookie会被视为第三方cookie, 被浏览器禁止.

__慢__ 每次进入 都须 重新加载资源, 重建浏览器上下文

[Why Not Iframe](https://www.yuque.com/kuitos/gky7yw/gesexv)


### 公共逻辑抽离的 各种方式对比

[微前端模块共享你真的懂了吗](https://juejin.cn/post/6984682096291741704)


### single-spa



[从0实现一个前端微服务（上）](https://juejin.cn/post/6844904046822686733)

[微前端框架 之 qiankun 从入门到源码分析](https://juejin.cn/post/6885211340999229454)

[微前端框架 之 single-spa 从入门到精通](https://juejin.cn/post/6862661545592111111)

[你的 import 被 webpack 编译成了什么？](https://juejin.cn/post/6859569958742196237)



