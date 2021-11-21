---
title: React杂记
date: 2021-11-19 05:39:59
categories: 技术栈
tags: 
    - React
---

# React杂记

## 新版本编译后不使用`React.createElement`创建元素

[JSX_runtime实现](http://www.zhufengpeixun.com/strong/html/123.jsx-runtime.html)

新版本React11开始,babel转义后 已经不用`React.createElement`来创建React元素了.

新的方式是`import {jsx as __jsx} from "react/jsx-runtime"`

然后JSX源代码编译为 `__jsx("h1",{id:"title"},"title")`,

老版本是`React.createElement("h1",{id:"title"},"title")`,

这样的好处是 如果 jsx代码里其实全是js,就不需要react的参与,

此时老模式,依旧需要引入`import React from 'react'`,因为编译完后需要`React.`.

`"build": "cross-env DISABLE_NEW_JSX_TRANSFORM=true react-scripts build"` 

禁用新的转换器,用老的方式来编译

## 编译是什么时候发生的

JSX经过 webpack打包,期间经过babel编译,编译成纯粹的JS,就是所谓的打包后的文件.

用户访问时,返回HTML页面,HTML引用打包完的JS文件,JS执行,形成虚拟DOM(React元素),渲染成页面.


webpack编译时,检测到JSX,就用babel,将源代码中的JSX部分进行了替换,

`babel`将 JSX 编译为 编译后的纯粹的JS代码(产生了`React.creatElement`)时,用到了AST语法树.

浏览器执行时,`React.createElement(type, config, children)`返回虚拟DOM,

`ReactDOM.render(reactElement,真实dom选择器容器)`渲染成页面.


__React组件必须首字母大写,React是通过首字母是否大写判断是否是自定义组件,小写就是原生标签了__


## 组件的数据来源有两个

一个是父组件的属性,组件内通过`this.props`获取,属性是父组件的不能修改,

一个是自身的状态, state对象 自己内部初始化的,唯一的修改方法是`setState`

## React绑定事件写法与原生不同

1. 属性不是小写而是驼峰命名

2. 值不是字符串而是函数的引用,`onClick={this.handleClick}`

## React的更新是可能是 异步 可能是 同步

__React会 异步批量更新 组件内的state__

组件内调用`setState`修改某数据后,在下面立即console该属性,发现属性未发生改变

这是因为同一次同步任务内所有的数据修改`setState`,会记录在`pendingState`队列

最后在该同步任务执行完毕时,下一个微任务队列内执行数据的更新.

__React对于非自己的提供的接口产生的更新是 同步立即更新 的__

React 在自己能够管理 的范围内比如 事件函数 生命周期函数 内产生的 更新都是 异步批量更新的,

能够管理的范围外的 更新,例如 setTimeout 原生事件 内的更新 都是同步立即更新的.

原理是: 是否批量更新标记isBatchingUpdate,在同步任务开始时置为true,批量更新结束时置为false.

setState被调用时,发现 isBatchingUpdate 为false 就立即更新数据.

## React 的事件都绑定在容器上,而非当前DOM上

__组件的事件处理原理__

1. React事件绑定时,并没有将事件绑定在 当前DOM,而是绑定在 容器div#root

2. 事件绑定在 容器上,事件处理函数 还是保存在 当前DOM.store中
 
3. click 当前DOM,必然事件冒泡,触发 容器div#root 绑定的click事件,

4. 容器调用其 统一事件处理函数 拿到event.target/type,调用 真正的相应 事件处理函数
   
   (并传入react 修改后加了点属性的的event,如果要用的话)

5. target就是 当前DOM,挂载了 事件处理函数,type 就是事件类型,据此调用 当前DOM 上的 事件处理函数

__容器统一事件处理函数会让当前 事件处理 结束后组件的状态 异步批量更新__

1. 容器统一事件处理函数的步骤如下,

2. 首先,updateQueue.isBatchingUpdate=true;// 事件函数执行前先设置批量更新模式为true

3. 这样当前如果有同步任务的setState 就会作为 异步批量更新的一部分,放入 updateQueue 的待更新队列,

   isBatchingUpdate === false,setState会直接同步触发 组件的state更新

4. 此时调用 当前DOM 上的 事件处理函数,如果里面有 setState 就按上面的逻辑来

6. 最后 isBatchingUpdate = false, updateQueue.batchUpdate()启动批量更新

__为什么react要给事件处理函数接收的event加点属性__

1. 兼容多种浏览器,用到时候不用考虑游览器差异

__其他__

1. 你不能通过返回 false 的方式阻止事件默认行为。你必须显式的使用preventDefault

2. 从17以前,事件都是 绑定在document上,委托给document.

3. 同一类型事件,容器只需绑定一次,因为就是注册事件,之后触发target上的 事件处理函数就行.

## 想基于当前同步任务中上一次state修改,来做这次的state修改

想基于同一次同步任务内上次state修改后的数据,来完成这次state的修改.
```js
this.setState({number:this.state.number+1});
console.log(this.state);
// 想基于上一次的state.number+1后的数据,完成这一次的state.number再+1
this.setState({number:this.state.number+1});
console.log(this.state);
// 这样过后,假设一开始number===0,最后number会===1,与想要的结果2不同
```

正确的写法,`this.setState(state=>{number:this.state.number+1})`(使用函数,而非对象)

内部原理:计算最新state状态时,当检测到 当前这次`setState`调用 的参数为函数,

调用该函数,并传入 最新state(已经过同次同步任务之前setState的修改后 并与oldstate 合并了的state),

返回 当前这次`setState`调用 产生的 state作为 最新state 

或者 setState 后强制更新.

## React类组件更新原理

1. 初次渲染的时候已经在页面上放置了一个DIV

2. 更新的时候用新的state,重新render返回新的虚拟DOM,

3. 虚拟DOM再次生产新的真实DOM

4. 新的真实DOM替换老的DIV

