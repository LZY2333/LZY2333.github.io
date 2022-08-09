---
title: AdvancedCSS&Sass
date: 2022-08-08 21:54:51
categories: 技术栈
tags:
    - CSS
---

# AdvancedCSS&Sass

`line-height: 1;` 使 lineHeight 为 fontSize 的 x 倍

`background-size: cover;background-position: bottom` 保持底部不变，其他位置对背景裁剪。

`background-image: linear-gradient(to right bottom,rgba(126,213,111,0.8),rgba(40,180,131,0.8)), url(../image/hero.jpg)`

从左上到右下 线性渐变的背景，下面再一个图片背景

padding不会被继承

`clip-path: polygon(0 0, 100% 0, 100% 200px, 0 100%)` 输入多个xy轴坐标点，连成多边形，多边形外部会被裁剪