---
title: qiankun杂记
date: 2024-04-17 19:02:29
categories: 经验帖
tags:
  - 微前端
  - 杂记
summary: qiankun杂记，阅读杂记系列为 【对日常看过的一些有趣帖子的笔记】/【对某一细节进行搜索深入了解后的分析】/【对某一技术原理架构分析后的脑图】，总贴记录 待研究的知识点 及 小知识点，分贴记录大知识点
---

## qiankun

### 微前端怎么调研的

Why Not Single-spa: 无 JS 沙箱，无通信机制，无预加载

京东的 Micro App，字节的 GarFish，腾讯的 无界

选择 qiankun 最重要的一点: 阿里大品牌背书，社区活跃度高，demo，使用者众多，甚至有钉钉群微信群，大佬免费在线解答。

不管用哪个新技术，在本地化的过程中，不出问题是不可能的，重要的是有没有解决方案，有没有人遇过这个问题。

当然还有更重要的一点: 我们的大佬指定要阿里的 qiankun

### 微前端落地遇到过什么困难

angular 对接 qiankun 对接 react 无现成 demo，需要自己摸索
react 项目通用样式，组件如何预加载
UI 风格如何统一，less token 统一变量

项目大，团队多，在不修改 angular 项目源码的情况下，接入 qiankun
原项目大量属性挂载在 windows 上，突破 JS 沙箱，读写 window 属性，setInterval 被卸载
子应用本地运行
子应用切换，卸载问题

### SnapshotSandbox LegacySandbox ProxySandbox

**snapshotSandbox： 记录 window 对象，每次 unmount 都要和微应用的环境进行 Diff**
激活沙箱时，将 window 的快照信息存到 windowSnapshot 中，
如果 modifyPropsMap 有值，还需要还原上次的状态；
激活期间，可能修改了 window 的数据；
退出沙箱时，将修改过的信息存到 modifyPropsMap 里面，并且把 window 还原成初始进入的状态。

可应用于不支持 proxy 的浏览器，浪费内存，污染 window

**legacySandbox:在微应用修改 window.xxx 时直接记录 Diff，将其用于环境恢复**
在 snapshotSandbox 的基础上优化了 diff，
通过使用 proxy 监听每一次微应用对 window 的 修改 新增操作。
将修改新增前的属性记录在两个对象上，这样在还原的时候就不需要 diff 对比新旧 window，直接还原。
addedPropsMapInSandbox、modifiedPropsOriginalValueMapInSandbox

减少了 diff 过程，依旧污染 window，依旧同时只能单例运行

**proxySandbox：每个微应用都有自己的 proxy**
激活沙箱后，每次对 window 取值的时候，先从自己沙箱环境的 fakeWindow 里面找，
如果不存在，就从 rawWindow(外部的 window)里去找；
当对沙箱内部的 window 对象赋值的时候，会直接操作 fakeWindow，而不会影响到 rawWindow。
每个微应用都有自己的 proxy

支持多个子应用同时运行，不污染全局 window

### 怎么做的主应用或子应用单独启动

**window.POWERED_BY_QIANKUN**
render 函数中判断 如果为 true 就拿 render 接收到的 container，没这个属性就自己 queryRoot

子应用单独启动情况下获取主应用的 cookie 信息，设置跨域，设置 devServer 的跨域，以及 headers 配置 token

```js
headers:{
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': ''
    }
```

### 微前端 qiankun 的实现原理

### qiankun 的 css 隔离和 js 隔离如何实现的

### legacySandbox 会存在变量污染吗

### legacysanbox 是完全隔离吗，怎么实现完全隔离，在 IE 浏览器下怎么实现

### 设计模式会哪些，发布者订阅者模式和观察者模式区别 发布者可以直接调订阅者方法吗

### webpack 优化怎么做的，怎么做到优化 9 倍的，怎么定位耗时长的地方和原因的
