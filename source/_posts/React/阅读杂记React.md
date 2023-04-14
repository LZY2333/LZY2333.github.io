---
title: 阅读杂记React
date: 2023-01-28 09:32:51
categories: 经验帖
tags:
    - React
    - 杂记
summary: jS杂记，阅读杂记系列为 【对日常看过的一些有趣帖子的笔记】/【对某一细节进行搜索深入了解后的分析】/【对某一技术原理架构分析后的脑图】，总贴记录 待研究的知识点 及 小知识点，分贴记录大知识点
---

[一文带你梳理React面试题（2023年版本）](https://juejin.cn/post/7182382408807743548#heading-13)

[🔥 连八股文都不懂还指望在前端混下去么](https://juejin.cn/post/7016593221815910408#heading-71)


## React版本区别

React 15
【stack架构】采用不可中断的递归方式更新的Stack Reconciler（老架构）
【Reconciler协调器】负责找出变化的组件
【Renderer渲染器】负责将变化的组件渲染到页面上

React 16
【Fiber 架构】采用可中断的遍历方式更新的Fiber Reconciler（新架构）
【Scheduler调度器】调度任务的优先级，高优先级的任务先进入 Reconciler
【Hooks】

React 17
【事件委托变更】不再挂在document上，挂载在根DOM容器中，使React可多版本并存
【新jsx-runtime】无需引入React，减小包装尺寸，考虑多版本React共存的情况
【移除事件池复用机制】

React 18
1. 直接ReactDOM.render 的api 改变为 ReactDOM.createRoot。
2. 【自动批处理】，无论同步异步
3. Lane优先级 代替 

React 18之前，只有在React 事件处理函数中才会进行批处理更新，
异步API不会进行批处理，promise、setTimeout、原生事件处理函数中、或任何其它事件内。

批处理: 多个状态更新批量处理，合并成一次更新，这样只进行一次渲染
以前，同步内多处setState，只进行一次组件重新渲染，setTimeout内有几次setState，就重新渲染几次

为什么要改1中的api: 为了兼容老版本
在18中使用render老api代表使用17的特性，使用新api代表开启18的特性，也即自动批处理。

[React18 新特性解读](https://juejin.cn/post/7094037148088664078)

## Fiber是什么

可简单认为是,以链表结构相连的 虚拟DOM结构,同时挂载了 组件状态和更新操作 等数据

__一种架构名称__ : React16的Reconciler基于Fiber节点实现，被称为Fiber Reconciler。

React15的Reconciler采用递归的方式执行，数据保存在递归调用栈中，所以被称为stack Reconciler。

__一种数据结构名称__ : 一个Fiber节点对应一个React element，也对应一个虚拟DOM，以及更多的信息，组件的类型，虚拟DOM、真实DOM等信息。

__React的最小工作单元__ : 运行时,Fiber 储存了该组件改变的状态、要执行的操作（删除/插入/更新...）。

## JSX是什么

【本质】JSX本质上是 React.createElement() 的语法糖。

【目的】React团队希望 __结构与样式与事件 能够高内聚形成组件__，而组件与组件之间低耦合，达到复用和组合的目的。

【目的】JSX可以将JS与HTML标签结合使用，使得 __UI与逻辑结合__ 在一起，而不是强行分割，增加心智负担。

【不同】JSX不引入新的的概念和语法，只需要写JS，且具有JS所有功能，__不同于模板语法__。

【原理】Babel解析 源码 生成AST，匹配修改AST后， 反向解析 生成 打包后的源码

## 虚拟DOM

【概念】虚拟DOM是描述真实DOM的JS对象

【本质】JSX 本地打包后变成 createElement，运行时 createElement 执行返回的 虚拟DOM

【优点】数据渲染视图，无需关注DOM修改，减少心智负担，专注业务逻辑，从而提升开发效率。

【优点】自动Diff以及批处理提升性能，跨平台兼容，跨浏览器兼容

【缺点】虚拟DOM占内存，首屏渲染相对慢，需要从零遍历构建第一颗fiber树

## Diff算法




## 事件机制

减少绑定，提高性能

统一进行事件处理

合成事件，就是把React原生事件 再加上了一些自定义的属性和函数

批量更新，一次事件内触发的setState更新放在更新队列内收集，全部收集完成后逐个处理，得到新state，再触发一次性渲染。

__React事件处理捕获和冒泡__
React17以前，是捕获到冒泡，再自己模拟一遍捕获和冒泡，一个个去触发捕获事件和冒泡事件，与原生事件顺序不兼容。
React17以后，是每个事件注册两道，一道捕获，一道冒泡，捕获触发的时候一个个去触发捕获事件，冒泡触发的时候一个个去触发冒泡事件。

1. 描述一下React的事件机制，优点，缺点？
[珠峰](http://zhufengpeixun.com/strong/html/126.12.react-4.html#t102.React%E4%BA%8B%E4%BB%B6%E7%B3%BB%E7%BB%9F)

[珠峰](http://zhufengpeixun.com/strong/html/126.11.react-1.html#t707.%20%E8%AF%B7%E8%AF%B4%E4%B8%80%E4%B8%8B%E4%BD%A0%E5%AF%B9%20React%20%E5%90%88%E6%88%90%E4%BA%8B%E4%BB%B6%E7%9A%84%E7%90%86%E8%A7%A3%EF%BC%9F)

2. 16和17事件机制有什么不同？

3. React 中 onChange 的原生事件是什么？



## Lane优先级

[react - 关于 react 为什么要从 ExpirationTime 切换到 lane 的一次考古](https://juejin.cn/post/7095307142046941191)
顺便看看这个大佬的其他文章

## 类组件和函数组件

类组件面向对象编程，函数组件函数式思想
都可以接收属性并返回ReactElement

__函数组件更加契合 React 框架的设计理念__
React 组件的主要工作 就是 一个吃进数据、吐出 UI 的函数。
React 框架的主要工作 就是 把声明式的代码转换为命令式的 DOM 操作。

__函数组件的优点__
语法简单
易于测试
Hooks 提供了更细粒度的逻辑组织与复用 
更好地适用于时间切片与并发模式

__类组件的缺点__
this 的模糊性
业务逻辑散落在生命周期中
类组件可以通过继承实现逻辑复用，但是继承的灵活性差，细节屏蔽多，不推荐使用
类组件需要创建并保存实例，会占用一定内存


## 生命周期

## Hooks

__1. 为什么 React 和 Vue3 都选择了hooks，它带来了那些便利？__
[浅谈: 为啥vue和react都选择了Hooks🏂？](https://juejin.cn/post/7066951709678895141)

[在 Vue3 中实现 React 原生 Hooks（useState、useEffect）进而深入理解 React Hooks 的本质原理](https://juejin.cn/post/7121363865840910372)

[大厂面试题每日一题](https://q.shanyue.tech/fe/react/14.html)

[Hooks 对于 Vue 意味着什么？](https://juejin.cn/post/7062259204941152293)

[React Hooks: 给React带来了什么变化？](https://juejin.cn/post/6844904149453111304)

__2. 为什么不能在条件和循环里使用Hooks？__
[为什么不能在条件和循环里使用Hooks?](https://zh-hans.reactjs.org/docs/hooks-rules.html#explanation)

__3. 为什么不能在函数组件外部使用Hooks？__
__4. React Hooks的状态保存在了哪里？__
__5. 为什么传入二次相同的状态，函数组件不更新？ __
__6. HOC 和 hook 的区别？__
[【React深入】从Mixin到HOC再到Hook](https://juejin.cn/post/6844903815762673671)

__7. 如何将类组件转换为函数组件？__
[[译] 5种方法将React类组件转换为具有React Hooks的功能组件](https://juejin.cn/post/6844903830203678727)

__1. 函数组件的useState和类组件的setState有什么区别？__
__2. react hooks 中如何模拟 componentDidMount__
`useEffect(callback, []);`
useState useEffect用法及原理
useReducer 和 useContext
自定义Hook 和 useCallback
useEffect 和 useLayoutEffect 区别
useCallback() 和 useMemo() 的区别
useEffect 依赖为空数组与 componentDidMount 区别






## 组件通信
[八股文](https://juejin.cn/post/7016593221815910408#heading-71)







## React和Vue对比

[珠峰](http://zhufengpeixun.com/strong/html/126.11.react-1.html#t112.%E4%B8%BA%E4%BB%80%E4%B9%88%20React%20%E4%BC%9A%E5%BC%95%E5%85%A5%20JSX?)

虚拟dom是什么? 原理? 优缺点?

vue 和 react 在虚拟dom的diff上，做了哪些改进使得速度很快?

vue 和 react 里的key的作用是什么? 为什么不能用Index？用了会怎样? 如果不加key会怎样?

React 和 Vue 的本质区别: 
Vue 是静态分析 template 文件，采用预编译优化，在解析模板的同时构建 AST 依赖树，同时标记出可能会变化的动态节点。
利用数据双向绑定，进行数据拦截或代理，进行响应式处理。从而能够比较精准的计算出有改变的 DOM，减少计算量。

React 是局部渲重新渲染，核心就是一堆递归的 React.createElement 的执行调用。
其优化的方向是不断的优化 React.createElement 的执行速度，让其更快，更合理的创建最终的元素。



## 性能优化

使用 React.memo 来缓存组件。
使用 React.useMemo 缓存大量的计算。
避免使用匿名函数。
利用 React.lazy 和 React.Suspense 延迟加载不是立即需要的组件。
尽量使用 CSS 而不是强制加载和卸载组件。
使用 React.Fragment 避免添加额外的 DOM。

[React性能优化的8种方式了解一下？](https://juejin.cn/post/6844903924302888973)

1. 在 React 中如何做好性能优化 ?
代码分割 (在 React 中如何实现代码分割)[https://zh-hans.reactjs.org/docs/code-splitting.html]

2. react 与 vue 数组中 key 的作用是什么？
提升diff算法的判断速度，
diff算法 会首先判断 新旧 key 和 元素类型 是否一致，如果一致再去递归判断子节点

在React16.6引入了Suspense和React.lazy，用来分割组件代码。




## React

__请说一下你对 React 的理解?__
[珠峰](http://zhufengpeixun.com/strong/html/126.11.react-1.html)

__请说一下React中的渲染流程__
[珠峰](http://zhufengpeixun.com/strong/html/126.11.react-1.html#t485.%20%E8%AF%B7%E8%AF%B4%E4%B8%80%E4%B8%8B%20React%20%E4%B8%AD%E7%9A%84%E6%B8%B2%E6%9F%93%E6%B5%81%E7%A8%8B)

__受控组件和非受控组件__ 
React没有双向绑定

受控组件: 使用state控制表单元素的value，使用onChange 与 setState更新state，从而更新视图，控制用户输入过程表单的操作。

非受控组件: 通过使用Ref属性拿到DOM，再通过.value拿到数据。

绝大部分时候推荐使用受控组件来实现表单，因为在受控组件中，表单数据由React组件负责处理

当然如果选择非受控组件的话，表单数据相当于由DOM自己处理。

file类型的表单控件只能由用户设置值，作为非受控组件

[受控组件与非受控组件](https://juejin.cn/post/6858276396968951822#heading-2)

__React 组件是怎么渲染为 DOM 元素到页面上的__
__React 中 setState 调用以后会经历哪些流程__
__如何进行数据管理__
__你提到了 React Context，说一下它的原理__
__能说一下 Redux 的原理吗__
__useState 是怎么实现的__
__通过下标指定 key 的话会有什么问题？__

__React 中 fiber 是用来做什么的__
[React 中 fiber 是用来做什么的](https://q.shanyue.tech/fe/react/165.html)
Fiber出现在React16版本，在15及以前的版本，React更新DOM都是使用递归的方式进行遍历，每次更新都会从应用根部递归执行，且一旦开始，无法中断，这样层级越来越深，结构复杂度高的项目就会出现明显的卡顿。fiber架构出现就是为了解决这个问题，fiber是在React中最小粒度的执行单元，可以将fiber理解为是React的虚拟DOM。在React中，更新fiber的过程叫做调和，每一个fiber都可以作为一个执行单元进行处理，同时每个fiber都有一个优先级lane（16版本是expirationTime）来判断是否还有空间或时间来执行更新，如果没有时间更新，就会把主动权交给浏览器去做一些渲染（如动画、重排、重绘等），用户就不会感觉到卡顿。然后，当浏览器空闲了（requestIdleCallback），就通过scheduler（调度器）将执行恢复到执行单元上，这样本质上是中断了渲染，不过题改了用户的体验。React实现的fiber模式是一个具有链表和指针的异步模型。
fiber作为react创建的element和真实DOM之间的桥梁，每一次更新的触发会在React element发起，经过fiber的调和，然后更新到真实DOM上。fiber上标识了各种不同类型的element，同时记录了对应和当前fiber有关的其他fiber信息（return指向父级、child指向子级、sibling指向兄弟）。
在React应用中，应用首次构建时，会创建一个fiberRoot作为整个React应用的根基。然后当ReactDOM.render渲染出来时，会创建一个rootFiber对象（一个Ract应用可以用多个rootFiber，但只能有一个fiberRoot），当一次挂载完成时，fiberRoot的current属性会指向对应rootFiber。挂载完成后，会进入正式渲染阶段，在这个阶段必须知道一个workInProgerss树（它是正在内存在构建的Fiber树，在一次更新中，所有的更新都发生在workInProgeress树上，更新完成后，将变成current树用于渲染视图）,当前的current树（rootFiber）的alternate会作为workInProgerss，同时会用alternate将workInProgress与current树进行关联（该关联只有在初始化第一次创建alternate时进行）。


## React 涉及的算法
__LRU算法__
在React16.6引入了Suspense和React.lazy，用来分割组件代码。

## React-router
[React/Vue 中的 router 实现原理如何](https://q.shanyue.tech/fe/react/463.html#history-api)