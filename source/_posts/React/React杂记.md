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

## React绑定事件与原生不同

1. 属性不是小写而是驼峰命名

2. 值不是字符串而是函数的引用,`onClick={this.handleClick}`

## React异步更新组件内的state

组件内调用`setState`修改某数据后,在下面立即console该属性,发现属性未发生改变

这是因为同一次同步任务内所有的数据修改`setState`,会记录在`pendingState`队列

最后在该同步任务执行完毕时,下一个微任务队列内执行数据的更新.

## React组件更新原理

1. 初次渲染的时候已经在页面上放置了一个DIV

2. 更新的时候用新的state,重新render返回新的虚拟DOM,

3. 虚拟DOM再次生产新的真实DOM

4. 新的真实DOM替换老的DIV