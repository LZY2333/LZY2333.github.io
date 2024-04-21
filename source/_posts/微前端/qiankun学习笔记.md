---
title: qiankun学习笔记
date: 2023-09-22 16:33:05
categories: 技术栈
tags: 
    - 微前端
---

## qiankun学习笔记

### 微前端

https://www.lumin.tech/blog/micro-frontends-1-concept/

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

### Why Not Iframe

iframe 优势是能完美解决 样式隔离、js 隔离, 劣势是 无法突破这些隔离.

__URL隔离__. 例如: 刷新丢失URL,无法 前进 后退

__UI隔离__,DOM结构不共享,无法合并计算样式. 例如: iframe内弹出的弹出,要求 遮罩 居中 随浏览器Resize

__JS隔离__,全局上下文隔离，内存变量不共享 例如: 无法 数据状态同步, iframe设置的cookie会被视为第三方cookie, 被浏览器禁止.

__慢__ 每次进入 都须 重新加载资源, 重建浏览器上下文

[Why Not Iframe](https://www.yuque.com/kuitos/gky7yw/gesexv)

Why Not Single-spa: 无JS沙箱，无通信机制，无预加载

京东的 Micro App，字节的 GarFish，腾讯的 无界

选择qiankun最重要的一点: 阿里大品牌背书，社区活跃度高，demo，使用者众多，甚至有钉钉群微信群，大佬免费在线解答。

不管用哪个新技术，在本地化的过程中，不出问题是不可能的，重要的是有没有解决方案，有没有人遇过这个问题。

当然还有更重要的一点: 我们的大佬指定要阿里的qiankun

### 父子应用通信

路由参数、localStorage、eventBus、生命周期函数


### qiankun接入过程中遇到的问题



### qiankun使用

```js

registerMicroApps([
    {
        name: 'reactApp',
        entry: '//localhost:40000', // 默认react启动的入口是10000端口
        activeRule: '/react', // 当路径是 /react的时候启动
        container: '#container', // 应用挂载的位置
        loader, // 微应用加载时触发钩子
        props: { a: 1, util: {} } // 可传给微应用生命周期的属性
    },
    {
        name: 'vueApp',
        entry: '//localhost:20000', // 默认react启动的入口是10000端口
        activeRule: '/vue', // 当路径是 /react的时候启动
        container: '#container', // 应用挂载的位置
        loader,
        props: { a: 1, util: {} }
    }
], {
    // qiankun的生命周期钩子，作用不大
    beforeLoad() {
        console.log('before load')
    },
    beforeMount() {
        console.log('before mount')
    },
    afterMount() {
        console.log('after mount')
    },
    beforeUnmount() {
        console.log('before unmount')
    },
    afterUnmount() {
        console.log('after unmount')
    }
})
// start可以传入一些额外的配置
start()

```

### CSS隔离方案

css-module，scoped 打包的时候生成选择器名字实现隔离
BEM 规范
CSS in js
shadowDOM 严格的隔离

### JS隔离方案

window快照方案: 储存一份window属性快照，对比，记录属性新增修改，失活时从window删除变化属性性，激活时复原变化属性

浪费内存

演化方案: 仅储存window 新增修改的属性，不储存window属性，基于proxy

最终方案：多例代理，基于proxy