---
title: React笔记
date: 2021-11-19 05:39:59
categories: 技术栈
tags: 
    - React
---

# React笔记

__新版本编译后不使用`React.createElement`创建元素__

[JSX_runtime实现](http://www.zhufengpeixun.com/strong/html/123.jsx-runtime.html)

新版本React11开始,babel转义后 已经不用`React.createElement`来创建React元素了.

新的方式是`import {jsx as __jsx} from "react/jsx-runtime"`

然后JSX源代码编译为 `__jsx("h1",{id:"title"},"title")`,

老版本是`React.createElement("h1",{id:"title"},"title")`,

这样的好处是 如果 jsx代码里其实全是js,就不需要react的参与,

此时老模式,依旧需要引入`import React from 'react'`,因为编译完后需要`React.`.

`"build": "cross-env DISABLE_NEW_JSX_TRANSFORM=true react-scripts build"` 

禁用新的转换器,用老的方式来编译

__编译是什么时候发生的__

JSX经过 webpack打包,期间经过babel编译,编译成纯粹的JS,就是所谓的打包后的文件.

用户访问时,返回HTML页面,HTML引用打包完的JS文件,JS执行,形成虚拟DOM(React元素),渲染成页面.


webpack编译时,检测到JSX,就用babel,将源代码中的JSX部分进行了替换,

`babel`将 JSX 编译为 编译后的纯粹的JS代码(产生了`React.creatElement`)时,用到了AST语法树.

浏览器执行时,`React.createElement(type, config, children)`返回虚拟DOM,

`ReactDOM.render(reactElement,真实dom选择器容器)`渲染成页面.

__React组件必须首字母大写,React是通过首字母是否大写判断是否是自定义组件,小写就是原生标签了__
