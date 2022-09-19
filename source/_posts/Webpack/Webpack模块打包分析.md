---
title: Webpack模块打包分析
date: 2022-09-19 04:11:42
categories: 技术栈
tags: 
    - Webpack
---

## Webpack模块打包分析






[Webpack 将代码打包成什么样子？](https://juejin.cn/post/6844903760188145672#comment)

为什么webpack可以将任何资源转换为浏览器认识的资源？

webpack本质上应该是正则匹配字符串并拼接

cmj导出值 

esm'导出引用， esm的导出是箭头函数，并且是重写get方法，会实时去原模块拿最新的值

但是cmj如果导出的是一个对象，那还是会与原模块实时同步的，因为对象是同一地址