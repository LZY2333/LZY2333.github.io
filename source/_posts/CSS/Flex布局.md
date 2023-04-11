---
title: Flex布局
date: 2023-03-06 10:31:26
categories: 经验帖
tags:
    - CSS
summary: 2009年，W3C 提出了一种新的方案----Flex 布局，可以简便、完整、响应式地实现各种页面布局。目前，它已经得到了所有浏览器的支持，这意味着，现在就能很安全地使用这项功能。
---

### 基本概念

![阮一峰大佬的flex属性图](https://www.ruanyifeng.com/blogimg/asset/2015/bg2015071004.png)

flex容器(flex container) flex项目(flex item)

主轴(main axis) 主轴开始位置(main start) 主轴结束位置(main end)

交叉轴(cross axis) 交叉轴开始位置(cross start) 交叉轴结束位置(cross end)

主轴长度(main size) 交叉轴长度(cross size)

### 容器属性

#### justify-content(主轴对齐方式)
flex-start：左对齐
flex-end：右对齐
center：居中
space-between：两端对齐，项目之间的间隔都相等。
space-around：每个项目两侧的间隔相等。所以，项目之间的间隔比项目与边框的间隔大一倍。

#### align-items(交叉轴对齐方式)
stretch：如果项目未设置高度或设为auto，将占满整个容器的高度。
flex-start：交叉轴的起点对齐。
flex-end：交叉轴的终点对齐。
center：交叉轴的中点对齐。
baseline: 项目的第一行文字的基线对齐。

#### flex-direction(主轴方向)
row: 主轴为水平方向，起点在左端。
row-reverse: 主轴为水平方向，起点在右端。
column: 主轴为垂直方向，起点在上沿。
column-reverse: 主轴为垂直方向，起点在下沿。
 
#### flex-wrap(是否换行)
nowrap: 不换行
wrap: 换行
wrap-reverse: 换行,但是头部在下 
 
#### flex-flow
flex-flow: flex-direction || flex-wrap;
 
#### align-content(多轴线对齐方式)
flex-start | flex-end | center | space-between | space-around | stretch;
如果只有一行,则该属性无效

### 项目属性

#### flex-grow:number(瓜分剩余空间的比例)
默认为0,代表即使有剩余空间也不瓜分.
有剩余空间,flex-grow不为0 的 各item按 数字比例瓜分剩余空间.

#### flex-shrink:number(缩小溢出空间的比例)
按宽度比例 且 按数字比例 进行缩小.
item超出容器宽度时,按 宽度*数字比例 的占额 * 溢出宽度 得到该缩小的宽度.

#### flex-basis
max-width/min-width > flex-basis > width > box

#### flex
flex: none | [ <'flex-grow'> <'flex-shrink'>? || <'flex-basis'> ]
默认: 0 1 auto  不长大但能缩小
auto: 1 1 auto  能长大能缩小
none: 0 0 auto  不长大不缩小
1   : 1 1 0     能长大能缩小,默认宽0

#### align-self(交叉轴对齐方式)
auto: 表示继承父元素的align-items属性
stretch：如果项目未设置高度或设为auto，将占满整个容器的高度。
flex-start：交叉轴的起点对齐。
flex-end：交叉轴的终点对齐。
center：交叉轴的中点对齐。
baseline: 项目的第一行文字的基线对齐。

#### order:integer(排列顺序)
数字越小排列越前


### 感谢

此篇为[阮一峰大佬的flex语法篇](https://www.ruanyifeng.com/blog/2015/07/flex-grammar.html)笔记

flex相关知识细节总是会忘,每次忘都会重新去找大佬这篇博客,写得太好了

记为精简笔记,供自己后续快速查阅复习



