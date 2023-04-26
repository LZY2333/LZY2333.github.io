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

__虚拟DOM具有哪些属性__

注意，组件中通过props是拿不到ref 和key的，被delete并挂载在了vdom上，但可以拿到children

## Diff算法(React15)

__DOM-Diff的根本目的是复用旧真实dom,减少渲染消耗__

__React的 Diff算法 只同层级比较，不同key不同type直接替换整个分支__

在React中由 `compareTwoVdom`, `updateChildren` 两个函数进行处理。

`compareTwoVdom`，根据新旧vdom比较两个节点，

1. 如果二者type不同，卸载 oldVdom 整个分支，根据 新vdom 创建 新真实DOM分支，并插入。

2. 如果二者type相同，复用 旧真实DOM，更新 真实DOM的Props属性，`updateChildren` 更新子节点。

`updateChildren`，子节点比较，进行 插入、移动、删除 三种操作。

1. 旧Vdom生成map结构，key为旧Vdom的key，遍历新vdom，查找是否存在 key相同可复用的旧Vdom

2. 可复用的旧Vdom会因为序号变更可能会被标记为 Move，无旧Vdom命中的新Vdom会被标记为 PLACEMENT

3. 每找到一个可复用的旧Vdom 就将其从map中删除，剩下的不可复用的vdom将其真实DOM unmount卸载

4. 再根据 patch补丁 标记，对剩余vdom进行操作。

> unMountVdom,卸载的过程，会找到其真实DOM，Ref置为空，递归卸载子Vdom，最后移除自己的真实DOM。

> 函数组件和类组件没有自己的真实DOM，需要递归调用findDOM，拿到子代vdom的真实DOM

> 需要移动: 可复用的 旧真实DOM 索引 比上一个不需要移动的节点的索引要小的话

## key的作用

__提升diff算法的判断速度__

React在进行节点对比时，会先对 新旧Vdom 的 key 进行判断，只有 key 相同，才进行进一步的对比。

key不同时，直接判定 旧真实DOM 不能复用，根据新数据创建 新真实DOM， 卸载 旧真实DOM。

key相同时，再进一步判断 新旧Vdom 的type，type不同则卸载，type相同，则复用 旧真实DOM。

__用index作为key__ 

__1. 可能会引发没有必要的真实DOM更新，但界面不会出现问题__

假设在数据头 进行了 添加 删除 操作，index作为key不会改变，同时type相同，则会判定所有DOM需要复用并更新。

__2. 如果不存在对 数据头 的添加删除操作，则可以使用index作为key。__

__3. 如果包含输入类的DOM，界面会出现问题__

__Diff算法(React16+)未解决__

## 事件机制

### 合成事件
__React合成事件__ SyntheticEvent，DOM原生事件再次封装，加上了一些自定义的属性和函数,
stopPropagation阻止React事件冒泡，
preventDefault 阻止浏览器默认行为，
nativeEvent代表原生DOM

浏览器兼容

多平台适配，ReactNative也能使用；

实现事件委托，减少事件绑定

统一进行事件处理

批量更新，一次事件内触发的setState更新放在更新队列内收集，全部收集完成后逐个处理，得到新state，再触发一次性渲染

事件池机制，避免频繁创建和销毁SyntheticEvent对象，释放过程将SyntheticEvent对象的大部分属性置为null，提升旧浏览器的性能。

### 事件代理

事件绑定时
1. 事件监听 绑定在 容器root上， 
2. 事件处理函数 以 键值对的形式储存在 DOM.store中，key为事件类型 value为事件处理函数。

事件触发时
1. 事件冒泡，触发 容器root 的事件监听，容器root 调用其 统一事件处理函数，
2. 统一事件处理函数 通过event.target 拿到对应DOM， event.type 拿到事件类型
3. 通过 DOM.store[event.type] 调用 真正的相应 事件处理函数handler(并传入 合成事件 )
   
> 这种做法叫切片编程，react可以在事件处理时做一些统一的事情，比如 处理浏览器兼容性

### 批量更新

一次浏览器事件触发多个监听handler，一个监听handler调用多个setState，多次属性修改，合并为一次vdom更新，和渲染更新。

1. 统一事件处理函数被调用时，将标记 isBatchingUpdate 置为true，随后 循环调用 事件触发的所有handler

2. 当标记为true时，所有 handler 内 setState 的属性更新都会储存在更新队列中。

3. 等 所有 handler执行完毕，再 更新所有vdom，并将 标记 isBatchingUpdate 置为false，再 diff创建真实DOM。

> 标记为false时，setState 的属性更新 会直接更新vdom，diff创建真实DOM。
> 其实并没有异步,还在当次同步任务内,只不过数据更新在所有handler执行完之后
> 这么做使得React无法控制的异步setState变为了更安全的立即更新，而React控制范围内的setState为批量更新。

### React 17以后 事件机制有什么不同？

1. 以前委托到document，17事件委托到root
为了允许同时运行多个版本React

2. React事件处理捕获和冒泡：
React17以前，是捕获到冒泡，再自己模拟一遍捕获和冒泡，一个个去触发捕获事件和冒泡事件，与原生事件顺序不兼容。
React17以后，是每个事件注册两道，一道捕获，一道冒泡，捕获触发的时候一个个去触发捕获事件，冒泡触发的时候一个个去触发冒泡事件。
React capture阶段的合成事件提前到原生事件capture阶段执行

3. 移除事件池机制；

4. 事件有优先级。 连续事件 > 用户阻塞事件 > 离散事件

__React 中 onChange 的原生事件是什么？__

__input组件中，onChange失去焦点时触发，onInput输入时触发__

## 生命周期

挂载
constructor
componentWillMount
render
componentDidMount

更新
componentWillReceiveProps
shouldComponentUpdate
componentWillUpdate
render
componentDidUpdate

卸载
componentWillUnmount

React 16.3 开始
【__getDerivedStateFromProps__】从props获取派发状态,static函数,无法使用this
> 被故意设计成 static 函数,因为以前在 componentWillReceiveProps中用setState会死循环,现在不让用this了

【__getSnapshotBeforeUpdate__】render之后新旧vdom即将对比替换时执行
用于在组件真实DOM更新之前,拿到老真实DOM的一些信息,返回值会传给 componentDidUpdate

挂载
constructor
getDerivedStateFromProps
render
componentDidMount

更新
getDerivedStateFromProps
shouldComponentUpdate
render
getSnapshotBeforeUpdate
componentDidUpdate

卸载
componentWillUnmount

__生命周期的父子组件的执行顺序？__

__函数组件的生命周期？__

## ref原理

ref的本质就是创建一个 `{current:null}` 对象，并将ref对象传递给子组件

子组件在 初始化过程中， 真实dom 创建完成后，赋值给 ref.current

这样，在初始化完成后，外部即可通过ref.current获取到，真实dom

## context原理

1. provider和consumer 的context属性 指向同一个对象

2. provider consumer 本质是渲染其 子vdom，就像函数组件，类组件一样，只不过会给子代添加一些属性。

3. 父Provider往共有对象上存值，在其初始化完成后，子代开始初始化，此时子代consumer就可以从这个对象里拿值并使用

> 本质，createContext() 返回一个context，具有两个属性，provider和consumer，
> 这两个属性对象具有 _context属性，又指向context
> 之后所有给provider挂载的属性，都会挂载进provider._context对象中，供子代consumer使用。


## Hooks(React 16.8)

__为什么不能在条件和循环里使用Hooks__
React的hooks用于存储状态，但函数是无法储存状态的，因为执行完后函数执行栈就会销毁
所以，hooks的状态保存在函数组件的 虚拟dom上，
采用的数据结构也不是 object的键值对模式，而是链表模式。
每个hooks执行都属于链表的一环，初始化执行时顺序储存数据，
后续更新时，顺序读取数据，所以顺序不能被打乱，所以不能在条件和循环内使用。

__useState 和 useReducer 的区别__
useState直接在fiber中储存用户传入的值
useReducer将 用户传入的值 传给reducer处理函数执行后 储存在fiber中。
useState，内部其实就是调用的 useReducer。
useReducer，用于处理复杂的数据处理逻辑。

__useMemo 和 useCallback 的区别__
接收创建函数和依赖项数组作为参数，依赖项改变时才重新计算 memoized 值。
用于避免每次渲染都进行高开销的属性计算
useCallback，依赖变更时才返回新函数，适用于父节点传递函数给子节点调用的情况，可以优化性能。

__useEffect 和 useLayoutEffect 区别__


__useContext原理__
useContext本身的原理非常简单，就是从传入的context对象上读取了他的，下划线currentValue属性
使用react.createContext的时候会创建一个全局对象context，
这个对象有provider consumer _currentValue属性
在父节点调用provider 会对 currentValue进行赋值，在子节点再从currentValue取值。

__useRef是单例的__
useRef的返回值ref 对象在组件的整个生命周期内持续存在
而不像setState一样，其值需要在下一个生命周期才得到体现。
但是注意， 变更 .current 属性不会引发组件重新渲染。



__useEffect 依赖为空数组与 componentDidMount 区别__
二者都是会在组件初次渲染完成后执行一次。
两者最根本的区别在于，
componentDidMount 的时机更为精确，他确确实实是在组件创建完真实DOM并挂载完成后立即调用的。
useEffect 实际上是创建了一个宏任务，在下个事件循环执行，这个时候也必然已经完成了渲染流程。

__函数组件的useState和类组件的setState有什么区别__
类组件的setState，修改的数据储存在其实例中，useState储存在当前函数组件对应的fiber中。
类组件的setState，是真正的修改数据的操作，useState不是。




__1. 为什么 React 和 Vue3 都选择了hooks，它带来了那些便利？__
[浅谈: 为啥vue和react都选择了Hooks🏂？](https://juejin.cn/post/7066951709678895141)

[在 Vue3 中实现 React 原生 Hooks（useState、useEffect）进而深入理解 React Hooks 的本质原理](https://juejin.cn/post/7121363865840910372)

[大厂面试题每日一题](https://q.shanyue.tech/fe/react/14.html)

[Hooks 对于 Vue 意味着什么？](https://juejin.cn/post/7062259204941152293)

[React Hooks: 给React带来了什么变化？](https://juejin.cn/post/6844904149453111304)

__为什么传入二次相同的状态，函数组件不更新__
数据和虚拟dom是更新了的，UI没更新，DOM复用了旧DOM。
数据都没更新只可能是使用了PureComponent

__hooks和生命周期的异同__
类组件的生命周期函数，是在注册之后，在组件运行的特定时间进行调用。
函数组件的hooks，在函数每次执行的时候都会被调用。

__自定义Hook__
自定义Hook必须以use开头，内部可以调用其他hooks，用于抽离公共逻辑
hooks的特性更像是组件，两个组件调用同一个hooks，state不会共享。


__6. HOC 和 hook 的区别？__
[【React深入】从Mixin到HOC再到Hook](https://juejin.cn/post/6844903815762673671)

## 组件通信
[八股文](https://juejin.cn/post/7016593221815910408#heading-71)

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

## React和Vue对比

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

## 性能优化
React.PureComponent,React.memo,当属性不变时，不重新渲染，跳过更新逻辑
memo在渲染的时候和函数组件一样，拿到vdom然后渲染，
但是在更新的时候，会通过传入的compare函数执行，进行props对比，如果不同，才会更新，如果相同，则会复用旧虚拟dom

最外层加上，内层也会相当于PureComponent，因为父组件不更新子组件也不会更新

使用 React.memo 来缓存组件。
使用 React.useMemo 缓存大量的计算。
避免使用匿名函数。
利用 React.lazy 和 React.Suspense 延迟加载不是立即需要的组件。
尽量使用 CSS 而不是强制加载和卸载组件。
使用 React.Fragment 避免添加额外的 DOM。

[React性能优化的8种方式了解一下？](https://juejin.cn/post/6844903924302888973)

1. 在 React 中如何做好性能优化 ?
代码分割 (在 React 中如何实现代码分割)[https://zh-hans.reactjs.org/docs/code-splitting.html]

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


## React18

## Fiber是什么

可简单认为是,以链表结构相连的 虚拟DOM结构,同时挂载了 组件状态和更新操作 等数据

__一种架构名称__ : React16的Reconciler基于Fiber节点实现，被称为Fiber Reconciler。

React15的Reconciler采用递归的方式执行，数据保存在递归调用栈中，所以被称为stack Reconciler。

__一种数据结构名称__ : 一个Fiber节点对应一个React element，也对应一个虚拟DOM，以及更多的信息，组件的类型，虚拟DOM、真实DOM等信息。

__React的最小工作单元__ : 运行时,Fiber 储存了该组件改变的状态、要执行的操作（删除/插入/更新...）。


## Diff算法(React18)

React同时维护两棵虚拟DOM树：一棵表示当前的DOM结构，另一棵在React状态变更将要重新渲染时生成。

React通过比较这两棵树的差异，决定是否需要修改DOM结构，以及如何修改。

但是目前的代码，似乎是自上而下，一边生成新vdom，一边进行比较更新，

而不是生成整个新vdom树，再新旧vdom树进行比较更新。

旧的虚拟DOM树一直存在，新的一边对比一边生成？