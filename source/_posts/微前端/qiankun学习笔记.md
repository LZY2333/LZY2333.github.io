---
title: qiankun学习笔记
date: 2023-09-22 16:33:05
categories: 技术栈
tags: 
    - 微前端
---

## qiankun学习笔记

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

### Why Not Iframe

iframe 优势是能完美解决 样式隔离、js 隔离, 劣势是 无法突破这些隔离.

__路由隔离__. 例如: 刷新丢失URL,无法 前进 后退

__UI隔离,DOM结构不共享,无法合并计算样式.__ 例如: iframe内弹出的弹出,要求 遮罩 居中 随浏览器Resize

__全局上下文隔离，内存变量不共享__ 例如: 无法 数据状态同步, iframe设置的cookie会被视为第三方cookie, 被浏览器禁止.

__慢__ 每次进入 都须 重新加载资源, 重建浏览器上下文

[Why Not Iframe](https://www.yuque.com/kuitos/gky7yw/gesexv)

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