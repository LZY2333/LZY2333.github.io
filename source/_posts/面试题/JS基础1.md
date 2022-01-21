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



### 防抖的this

绑定this的 fn中的this 会指向 debounce 执行时的对象

```js
function debounce(fn, wait) {
    let timer
    this.a = '123456'
    return function() {
        this.b = '12'
        let args = arguments
        let _this = this
        if(timer) { clearTimeout(timer) }
        timer = setTimeout(() => {
            fn.apply(_this,args)
        }, wait);
    }
}
let a = {x:'1651'}
a.c = debounce(function(b){console.log(this,b)},500) // 这里不能用箭头函数，不然会console windows
a.c(1);a.c(1);a.c(1);a.c(1);

a.d = function(){console.log(this)}
a.d()

// {x: '1651', c: ƒ, d: ƒ}
// 间隔 0.5秒
// {x: '1651', c: ƒ, d: ƒ} 1
```

不绑定this, fn中的this 会指向 windows

```js
function debounce(fn, wait) {
    let timer
    return function() {
        let args = arguments
        if(timer) { clearTimeout(timer) }
        timer = setTimeout(() => {
            fn(args)
        }, wait);
    }
}
let a = {x:'1651'}
a.c = debounce(function(b){console.log(this,b)},500) // 这里不能用箭头函数，不然会console windows
a.c(1);a.c(1);a.c(1);a.c(1);

a.d = function(){console.log(this)}
a.d()

// 此处是d() 被调用
// {x: '1651', c: ƒ, d: ƒ}
// 间隔 0.5秒
// windows {}
// arguments {}
```

为什么'不绑定this fn中的this 会指向 windows'?

fn定义在window中,内部调用fn 相当于 window.fn。

this的指向只考虑三种情况，

1.谁调用指向谁(通过点调用，如a.XXX)

2.new 关键词创造的对象内部函数的调用this 永远指向 该对象(内部调用了bind)

3.bind apply 绑定了this，之后this永远不会改变

```js
function a(fn) {
    this.k = '123456'
    fn() // 相当于window.fn()
}
function b() {
    console.log(this)
}
a(b)
```


### 防抖的immediate