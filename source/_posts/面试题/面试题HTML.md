---
title: 面试题HTML
date: 2022-04-25 07:11:27
categories: 面试
tags:
    - 面试题
    - HTML
---

# 面试题HTML

### 如何理解HTML语义化
增加代码可读性
利于SEO,让搜索引擎更容易读懂
无CSS的情况下,页面也能有良好的内容结构.

### script 标签中 defer 和 async 的区别
      script：阻碍HTML解析,只有下载好并执行完脚本才会继续解析 HTML。
async script：解析HTML过程中进行脚本的异步下载,下载成功立马执行,有可能会阻断 HTML 的解析。
defer script：完全不会阻碍HTML的解析,解析完成之后再按照顺序执行脚本。