
---
title: 阅读杂记Webpack
date: 2023-03-09 08:00:40
categories: 经验帖
tags:
    - Vue
    - 杂记
summary: jS杂记，阅读杂记系列为 【对日常看过的一些有趣帖子的笔记】/【对某一细节进行搜索深入了解后的分析】/【对某一技术原理架构分析后的脑图】，总贴记录 待研究的知识点 及 小知识点，分贴记录大知识点
---


### Webpack是什么
webpack是一个前端打包器，帮助开发者将js模块（各种类型的模块化规范）打包成一个或多个js脚本。webpack的工作过程可以分为依赖解析过程和代码打包过程，首先执行对应的build命令，webpack首先分析入口文件，会递归解析AST获取对应依赖，得到一个依赖图。然后为每一个模块添加包裹函数（webpack的模块化），从入口文件为起点，递归执行模块，进行拼接IIFE（立即调用函数表达式：保证了模块变量不会影响全局作用域），产出对应的bundle。


### plugin和loader的区别
loader：用于将不同类型的文件转换成webpack可以识别的文件（webpack只认识js和json）。
plugin：存在于webpack整个生命周期中，是一种基于事件机制工作的模式，可以在webpck打包过程对某些节点做某些定制化处理。同时plugin可以对loader解析过程中做一些处理，协同处理文件。
执行顺序：两者不存在明显的先后顺序，不过webpack在初始化处理时，会优先识别到plugin中的内容。


### webpack优化方案
基于esm的tree shaking
对balel设置缓存，缩小babel-loader的处理范围,及精准指定要处理的目录。
压缩资源（mini-css-extract-plugin，compression-webpack-plugin）
配置资源的按需引入（第三方组件库）
配置splitChunks来进行按需加载（根据）
设置CDN优化

### babel
babel是一个工具链，主要用于将ES2015+代码转换为当前和旧浏览器或环境中向后兼容的Js版本。这句话比较官方，其实babel就是一个语法转换工具链，它会将我们书写的代码（vue或react）通过相关的解析（对应的Preset），主要是词法解析和语法解析，通过babel-parser转换成对应的AST树，再对得到的抽象语法树根据相关的规则配置，转换成最终需要的目标平台识别的AST树，再得到目标代码。
在日程的Webpack使用主要有三个插件：babel-loader、babel-core、babel-preset-env。
babel本质上会运行babel-loader一个函数，在运行时会匹配到对应的文件，根据babel.config.js（.balelrc）的配置（这里会配置相关的babel-preset-env,它会告诉babel用什么规则去进行代码转换）去将代码进行一个解析和转换（转换依靠的是babel-core），最终得到目标平台的代码。

### vite
vite在开环境时基于ESBuild打包，相比webpack的编译方式，大大提高了项目的启动和热更新速度。

### Tree Shaking 的原理，CommonJS能用吗，Tree Shaking 有什么副作用吗？

async 和 defer 区别，使用 async 需要注意什么？（回答下载后立刻执行，如何文件的依赖还没有下载完则会报错）那么 Webpack 是如何解决这个问题的？（我不会哇！）

### Webpack的初始化流程？

### module，chunk，bundle 是什么意思。

### CommonJS 和 ES Module 有什么区别？

### 为什么 ES Module 需要把 import 放在顶部，CommonJS 不需要？