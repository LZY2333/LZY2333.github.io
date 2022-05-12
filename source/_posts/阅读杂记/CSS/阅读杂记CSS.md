---
title: 阅读杂记CSS
date: 2022-04-25 02:10:41
categories: 经验帖
tags:
    - CSS
    - 杂记
summary: CSS杂记，阅读杂记系列为 【对日常看过的一些有趣帖子的笔记】/【对某一细节进行搜索深入了解后的分析】/【对某一技术原理架构分析后的脑图】，总贴记录 待研究的知识点 及 小知识点，分贴记录大知识点
---

# 阅读杂记CSS

## 什么是盒模型

CSS盒模型分为 标准盒模型 IE盒模型, 由 margin border padding content

标准盒模型 width 和 height 只包括 content的大小
IE盒模型 width 和 height 等于 content + padding + border

box-sizing: content-box(默认值,标准盒模型)
box-sizing: border-box(IE盒模型)

一个 块级 默认定位 未声明 width 的盒子,其宽度为100%,也就是父盒子content的宽度,同时盒子的padding和border会向内挤压空间

一个 绝对定位 未声明width 的盒子

普通文档流中块框的垂直外边距才会发生外边距合并，行内框、浮动框或绝对定位之间的外边距不会合并。

## CSS选择器的优先级

内联 > ID选择器 > 类选择器/属性选择器 > 标签选择器。

会计算 上面四类选择器的 出现次数,从左往右依次比较,以较大的为准,如果相同,则比较下一位.

如果四位均相同,则 后出现的会覆盖前面出现的

!important 的优先级最高,内联+important 的优先级最高

## 什么是重绘和重排

## 水平垂直的多种实现方式

## flex布局

## lineHeight如何继承


## 对BFC的理解

## 实现两栏布局

## 实现圣杯布局和双飞翼布局
