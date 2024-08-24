---
title: qiankun学习笔记
date: 2023-09-22 16:33:05
categories: 技术栈
tags:
  - 微前端
---

## qiankun 学习笔记

### 微前端

https://www.lumin.tech/blog/micro-frontends-1-concept/

#### 第一步，解决了什么痛点:

**大应用拆分**
**渐进式技术栈升级**

附带优势:
**多团队合作，独立部署**
**技术栈无关**
**不同微应用可以组合形成新的产品**

#### 第二步，实现了什么功能:

**沙箱:CSS 隔离，JS 隔离，路由隔离**
**微应用调度**

#### 第三步，如何实现沙箱和微应用调度....

qiankun: 实现沙箱，实现微应用接入配置简化，无痛接入
singleSpa: 实现基于路由进行微应用调度，定义了微应用生命周期
systemJS: 实现动态加载模块

### Why Not Iframe

iframe 优势是能完美解决 样式隔离、js 隔离, 劣势是 无法突破这些隔离.

**URL 隔离**. 例如: 刷新丢失 URL,无法 前进 后退

**UI 隔离**,DOM 结构不共享,无法合并计算样式. 例如: iframe 内弹出的弹出,要求 遮罩 居中 随浏览器 Resize

**JS 隔离**,全局上下文隔离，内存变量不共享 例如: 无法 数据状态同步, iframe 设置的 cookie 会被视为第三方 cookie, 被浏览器禁止.

**慢** 每次进入 都须 重新加载资源, 重建浏览器上下文

[Why Not Iframe](https://www.yuque.com/kuitos/gky7yw/gesexv)

Why Not Single-spa: 无 JS 沙箱，无通信机制，无预加载

京东的 Micro App，字节的 GarFish，腾讯的 无界

选择 qiankun 最重要的一点: 阿里大品牌背书，社区活跃度高，demo，使用者众多，甚至有钉钉群微信群，大佬免费在线解答。

不管用哪个新技术，在本地化的过程中，不出问题是不可能的，重要的是有没有解决方案，有没有人遇过这个问题。

当然还有更重要的一点: 我们的大佬指定要阿里的 qiankun

### 微应用通信

路由参数、localStorage/sessionStorage 、eventBus

官方提供的props: 注册时挂载的props变量，可以在子应用render函数内拿到

### import-html-entry

1.通过 正则匹配，解析出 html 中的 CSS 和 js 文件
2.拉取CSS和JS文件，并内嵌到 微应用HTML文件中
3.使微应用成为 已内嵌好所有CSS和JS的一个HTML文件
4.抛出entry文件等待主应用调用

singleSpa 使用 js entry
qiankun 使用 html entry

__js entry的缺点__

__微应用需要被打包成一个JS文件__:
微应用无法分包，按需加载、首屏资源加载优化、css 独立打包

__主应用需要配置微应用地址__:
微应用无法使用哈希串 否则每次打包都需修改主应用配置, CDN加速时无法解决浏览器缓存

__多个chunk加载顺序需手动配置__:
无按需加载

而 html entry 可以获得独立开发完全相同的体验

> 依赖webpack 的 webpack-manifest-plugin 插件打包出 manifest.json 文件
> 子应用可以实现分包,但是按需加载是不行的。

```js
import importHTML from "import-html-entry";

importHTML("./xxxApp/index.html").then((res) => {
    const { template, scripts, entry, styles } = res
    // template html模板
    // entry    子应用的入口文件
    // scripts  JS文件，含内嵌JS代码及链接加载后的文件的代码
    // styles   样式文件，含内嵌代码及链接加载后的文件的代码

});
```

### CSS 隔离方案

css-module，scoped 打包的时候生成选择器名字实现隔离
BEM 规范
CSS in js
shadowDOM 严格的隔离

insertBefore, appendChild 和 removeChild
防止主应用样式DOM被修改

### JS 隔离方案

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

### qiankun 接入过程中遇到的问题

解决方案去哪找: 谷歌，qiankun github的issue，qiankun的微信支持群。

__微应用通信__

__路由跳转问题__
子应用的路由跳转会基于子应用的base，无法使用`<router-link>` `router.push/router.replace`
`<a>`标签可以跳，但会刷新页面
解决：将主应用路由实例传给子应用，子应用进行封装

__qiankun在子应用中引入资源时报错解决__
qiankun会把静态资源的加载拦截，改用fetch方式获取资源，所以要求这些资源支持跨域，
解决: 使用qiankun提供的 start 接收的对象内的 excludeAssetFilter 判断url放行。

__对微应用实现 keep-alive 需求__
直接display:none

__样式相互影响__
css module，每个模块配置自己的模块前缀

__各个微应用UI风格不统一__
css token，边距 颜色 字体大小，根据场景不同强制要求使用token变量，宣讲


### 性能优化
__async__ 一些插件，埋点，用户调研，字体包
`<script>` html文件的解析，会等待 script 的 加载及执行
`<script async>` 会异步加载脚本，加载完时会停止html解析，执行script
`<script defer>` 会异步加载脚本，加载完时会等待html解析结束，执行script

async 执行顺序不确定 defer 执行顺序

`<link/script rel='preload'>` 在浏览器渲染前 获取css字体等
`<link rel='prefetch'>` 空闲时间加载 图片视频等

https://juejin.cn/post/7306786497712537650?searchId=202404242116183A016FC0387413B8147B

CDN

### keep-alive


### qiankun 使用

```js
registerMicroApps(
  [
    {
      name: "reactApp",
      entry: "//localhost:40000", // 默认react启动的入口是10000端口
      activeRule: "/react", // 当路径是 /react的时候启动
      container: "#container", // 应用挂载的位置
      loader, // 微应用加载时触发钩子
      props: { a: 1, util: {} }, // 可传给微应用生命周期的属性
    },
    {
      name: "vueApp",
      entry: "//localhost:20000", // 默认react启动的入口是10000端口
      activeRule: "/vue", // 当路径是 /react的时候启动
      container: "#container", // 应用挂载的位置
      loader,
      props: { a: 1, util: {} },
    },
  ],
  {
    // qiankun的生命周期钩子，作用不大
    beforeLoad() {
      console.log("before load");
    },
    beforeMount() {
      console.log("before mount");
    },
    afterMount() {
      console.log("after mount");
    },
    beforeUnmount() {
      console.log("before unmount");
    },
    afterUnmount() {
      console.log("after unmount");
    },
  }
);
// start可以传入一些额外的配置
start();
```
