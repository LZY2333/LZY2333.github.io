---
title: Fiber
date: 2022-06-26 17:34:22
categories: 经验帖
tags: 
    - React
---

# Fiber

React16以前没有fiber

### why Fiber ?

在react15的时候，dom节点的渲染，是对虚拟节点遍历，创建节点，然后再递归遍历其子节点，创建子节点。

如果层级特别深，会导致同步任务执行太久，阻塞浏览器进程。

特别是UI渲染与JS执行互斥，影响UI渲染，造成卡顿效果。

且递归是无法暂停的。

