---
title: JS基础1
date: 2022-01-21 09:51:55
categories: 知识点
tags: 
    - 面试题
---

# JS基础1

## 防抖和节流

防抖和节流都是防止某一事件频繁触发

### 防抖(debounce)

施法前摇，在读条期间再次触发会打断施法，重新读条，直到正常读条结束，触发函数。

```js

function debounce(fn, wait) {
    let timer
    return () => {
        let args = arguments
        if(timer) { clearTimeout(timer) }
        timer = setTimeout(() => {
            fn(args)
        }, wait);
    }
}
let a = {}
a.c = debounce((b)=>{console.log(this,b)},500)
a.c()

```

### 节流