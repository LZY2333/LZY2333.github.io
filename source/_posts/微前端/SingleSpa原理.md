---
title: SingleSpa原理
date: 2023-09-13 19:27:19
categories: 技术栈
tags: 
    - 微前端
---


## SingleSpa原理

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

### SingleSpa

SingleSpa本身已是一个成熟的微前端框架

__渐进式技术栈升级__: 新功能使用新框架，旧项目不用重新可以继续共存

__大应用拆分__: 分包，按需动态加载模块

__技术栈无关__: 可使用多个前端框架

__多团队合作，独立部署__: 微应用可独立部署

其原理是: 基于路由进行微应用调度，基于微应用暴露的生命周期，对微应用进行控制

### 使用方法

```html
<!-- 基座index.html 中需用如下格式写入 公共包CDN地址映射，微应用地址映射，并import基座entry包-->
<script type="systemjs-importmap">
{
    "imports": {
        "single-spa": "https://cdn.jsdelivr.net/npm/single-spa@5.9.0/lib/system/single-spa.min.js",
        "index.js": "xxx",
        "app1": "xxx"
    }
}
</script>
<script>
System.import('index.js');
</script>

```

```js
// 基座index.js 注册微应用，并调用start，开启路由监听，渲染页面
import { registerApplication, start } from 'single-spa';

// 基座中调用中注册 注册微应用，需要提供微应用的加载路径，以及告知何时渲染该微应用
registerApplication({
    name: 'app1',
    app: () => System.import('app1'), // 加载
    activeWhen: location => location.hash.startsWith('#/app1'),
    customProps: {}
})

// 开启路由监听
start()
```

```js
// 微应用中暴露接口，接入的微应用需要提供三个生命周期函数，供singleSpa调度
let app1 = {
    bootstrap: async () => console.log('app1 bootstrap2'), // 初始化
    mount: async (props) => console.log('app1 mount', props), // 挂载
    unmount: async (props) => console.log('app1 unmount', props) // 卸载
}
```

如果是对接vue react的微应用，有专门的 single-spa-react包 single-spa-vue包 

用于生成暴露给singleSpa的接口，也就是 bootstrap，mount，unmount
```js
import React from "react";
import ReactDOM from "react-dom";
import singleSpaReact from "single-spa-react";
import Root from "./root.component";

const lifecycle = singleSpaReact({
  React,
  ReactDOM,
  rootComponent: Root,
  errorBoundary(err, info, props) {
    // Customize the root error boundary for your microfrontend here.
    return null;
  },
});
// 接入协议 ， 子应用必须提供接入协议
// 对于single-spa 而言 保留接入协议 就可以接入到项目中
export const { bootstrap, mount, unmount } = lifecycle;
```

基于路由的微前端

微应用提供的四个生命周期接口

加载loadApp 初始化bootstrap 挂载mount 卸载unmount

singleSpa 监听路由的变化，通过调用微应用的生命周期接口，调度微应用


### 实现原理

__调度微应用__

每次路由发生变化，触发浏览器事件，触发singleSpa的监听回调，调用reroute方法:

1. 遍历微应用activeWhen方法，根据路由，及微应用当前状态，将所有微应用分为三类 toUnMount toLoad toMount

2. 分别调用 这三类微应用的 unMount load mount 方法，

    加载微应用，执行并在指定位置渲染dom，完成一个singleSpa的生命周期。

__监听路由__

本质上是在微应用监听到路由变化产生回调之前，先监听路由产生回调。

1. 调用原生addEventListener，监听'hashchange','popstate'，调用reroute函数，检测中根据路由调度微应用

2. 劫持addEventListener,记录微应用对 'hashchange','popstate' 的监听callback,

    每次路由产生变化，先执行完SingleSpa的reroute渲染，再执行微应用的路由监听callback

3. 额外劫持了 pushState，replaceState，在劫持中手动派发popstate事件，

    因为这两个原生接口的调用，造成的路由切换不会触发 'hashchange','popstate'的事件派发，


如果有vue-router react-router的源码基础，对微前端更好理解，其实是一样的东西

但是微前端的对路由的拦截，比vue-router react-router更高一层，因为微前端拦截了addEventListener



