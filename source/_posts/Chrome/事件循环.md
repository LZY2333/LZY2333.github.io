---
title: 事件循环
date: 2023-04-04 09:59:00
categories: 知识点
tags: 
    - Chrome
---


### chrome浏览器进程

__浏览器进程__
界面显示 用户交互 子进程管理 提供储存功能

__渲染进程__
将HTML CSS JS转换为用户交互的页面
排版引擎Blink JS引擎V8 运行其中
非同源网站,每个Tab一个渲染进程
安全考虑,渲染进程运行在沙箱模式下

|GUI渲染线程        |   解析HTML，CSS，构建DOM树    | 
|JS引擎线程         |   JS内核，等待任务队列的任务，处理JS脚本，与GUI线程互斥    |
|事件触发线程        |  JS事件绑定，JS异步操作，浏览器事件如鼠标点击，将其回调添加事件队列     |
|定时触发器线程      |    setTimeout，setTimeout，低于4ms的时间间隔算为4ms   |
|异步http请求线程    |    http请求，等返回结果将回调函数推入任务队列   |

__GPU进程__
初衷是为了实现3D CSS 效果
随后 UI界面都采用 GPU来绘制

__网络进程__
负责网络资源的加载
之前只是作为 浏览器进程 的一个模块

__插件进程__
插件易崩溃,通过插件进程来隔离,保证不对浏览器和页面造成影响

![node 事件循环](https://p1-jj.byteimg.com/tos-cn-i-t2oaga2asx/gold-user-assets/2020/1/18/16fb7aed8db21b8d~tplv-t2oaga2asx-zoom-in-crop-mark:4536:0:0:0.image)


### 感谢

[「硬核JS」一次搞懂JS运行机制](https://juejin.cn/post/6844904050543034376)