
---
title: React和Vue的区别
date: 2024-05-06 10:39:36
categories: 技术栈
tags:
    - Vue
    - React
summary: 
---


## React 和 Vue 的区别

[React和Vue全方位对比](https://juejin.cn/post/7250834664260829243?searchId=2024050611250976DA66D7732C54253995)

[个人理解Vue和React区别](https://juejin.cn/post/6844904158093377549?from=search-suggest)

[珠峰](http://zhufengpeixun.com/strong/html/126.11.react-1.html#t112.%E4%B8%BA%E4%BB%80%E4%B9%88%20React%20%E4%BC%9A%E5%BC%95%E5%85%A5%20JSX?)

虚拟dom是什么? 原理? 优缺点?

vue 和 react 在虚拟dom的diff上，做了哪些改进使得速度很快?

vue 和 react 里的key的作用是什么? 为什么不能用Index？用了会怎样? 如果不加key会怎样?
react 与 vue 数组中 key 的作用是什么？
提升diff算法的判断速度，
diff算法 会首先判断 新旧 key 和 元素类型 是否一致，如果一致再去递归判断子节点

React 和 Vue 的本质区别: 
Vue 是静态分析 template 文件，采用预编译优化，在解析模板的同时构建 AST 依赖树，同时标记出可能会变化的动态节点。
利用数据双向绑定，进行数据拦截或代理，进行响应式处理。从而能够比较精准的计算出有改变的 DOM，减少计算量。

React 是局部渲重新渲染，核心就是一堆递归的 React.createElement 的执行调用。
其优化的方向是不断的优化 React.createElement 的执行速度，让其更快，更合理的创建最终的元素。

React状态机

## 为什么Vue不需要Fiber

详情见 vue文件夹下的《React和Vue的区别》

### AOT vs JIT

AOT，Ahead Of Time，提前编译或预编译，宿主环境获得的是编译后的代码，在浏览器中我们可以直接下载并运行编译后的代码，比如：Vue的template是通过Vue-loader编译后才能使用。

JIT，Just In Time，即时编译 ，代码在宿主环境编译并执行，每个文件都是单独编译的，当我们更改代码时不需要再次构建整个项目，比如：React中JSX只有在浏览器运行的时候才知道具体代码。

模版语法AOT空间比较大
[为什么react需要fiber时间分片而vue没有](https://juejin.cn/post/7255876429518405687)

你以为react不想做编译时优化吗？做不到太多啊，Dan也提过issues，用prepack做render的优化，但是做的事情最多也只是循环展开，静态变量计算，还是跳不过diff。所以只能做一些runtime的优化，比如Fiber。


模板优化，不同语言直接走不同策略
react性能确实不如vue，原因在于vue模板的语法做了限制（v-xxx）于是可以在编译时进行优化（给节点加flag走不同策略，甚至是静态节点），jsx却是支持几乎所有的语法就没法在这方面进行优化了（如果AI接入提前理解全部代码优化也是可能的）。

### vue性能更好为什么不用vue

更好的生态

更好的TS支持

更好的开发体验(jsx支持几乎所有的语法)

更高素质的开发者

有句话就less is more, 作为一个定为为工具库的UI框架， react 给的 api非常少 实际上是给了开发者更大的自由度，

很多功能需要自己去实现，也因此很多性能上的问题都是开发者自己造成的，

对react理解不深

react作为一个仅仅是定为为工具库的UI框架并没有掌控整个项目 (vue在这方面更像是完形填空)

react框架自己迭代能做的优化不及用户一行代码造成的性能损失大

用react就必须用ES6 用TS，必须踩过无数react的坑，react优化，理解react原理
