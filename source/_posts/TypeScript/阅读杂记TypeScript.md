---
title: 阅读杂记TypeScript
date: 2023-03-09 07:50:14
categories: 经验帖
tags:
    - React
    - 杂记
summary: jS杂记，阅读杂记系列为 【对日常看过的一些有趣帖子的笔记】/【对某一细节进行搜索深入了解后的分析】/【对某一技术原理架构分析后的脑图】，总贴记录 待研究的知识点 及 小知识点，分贴记录大知识点
---


### 泛型***

### infer

### type和interface的区别

一般情况下定义接口用interface，定义常量用type，定义对象两个都可以

相同点: 都能描述 对象，都能基于另一个类型进行扩展(extends/&)

不同点: 

interface 可以同名重载， type 同名会报错

type 声明的是类型别名，而 interface 声明的是新类型。

type 可用于 可以定义基本类型 / 联合类型 / 元祖类型（ string、number、bool、undefined、null），

而 interface 只能描述对象（含数组、函数、包装对象、元组）。

### any、unknown、never、void***

### 常见的工具类型

TS中，如果声明了一个对象，又声明了一个对象和之前的对象大部分key是相同的，怎么做。