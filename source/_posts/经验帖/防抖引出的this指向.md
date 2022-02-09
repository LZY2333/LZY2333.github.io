---
title: 防抖引出的this指向
date: 2022-02-09 07:55:16
categories: 经验帖
tags: 
    - 面试题
---

# 防抖引出的this指向

this指向问题 自以为已经无懈可击了,在自学防抖的时候看到了bind(this)

突然好奇，为什么这里需要bind(this),出于什么需求?不bind会怎么样?

同时也发现了自己对this的指向理解还不够深刻，特此做出总结。

## 防抖函数内的bind

防抖函数的时候为什么要bind(this),不bind会怎么样？

### 一个防抖函数

施法前摇，在读条期间再次触发会打断施法，重新读条，直到正常读条结束，触发函数。

```js

function debounce(fn, wait) {
    let timer
    return () => { // 使用了箭头函数，无this问题，fn的this就是debounce的this
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

不用箭头函数，同上面的写法

一个合理的防抖函数 需要给 传入的fn 绑定this，指向 debounce 执行时的对象 a

```js
function debounce(fn, wait) {
    let timer
    this.k = '123456'
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
a.c = debounce(function(b){console.log(this,b)},500) // 这里fn不能用箭头函数，不然会console windows
a.c(1);a.c(1);a.c(1);a.c(1);

// {x: '1651', c: ƒ, d: ƒ} 1  此处是a.c()调用，指向了 a 1651 合理。
```

### 没有bind的防抖会出什么问题？

如果不绑定this, fn中的this 会指向 windows，

如果fn内调用了this，可能会出现与预期不一致的情况，


(下面这句话,也是开篇的提问,bind(this)的需求所在)
如下例，直觉上我们希望`a.c()`内的this,应该是指向`a`的,最终却指向了`windows`

```js
function debounce(fn, wait) {
    let timer
    return function() {
        let args = arguments
        if(timer) { clearTimeout(timer) }
        timer = setTimeout(() => {
            fn(args) // 去掉了bind
        }, wait);
    }
}
let a = {x:'1651'}
a.c = debounce(function(b){console.log(this,b)},500) // 这里不能用箭头函数，不然会console windows
a.c(1);a.c(1);a.c(1);a.c(1);

// windows {}  此处是a.c()调用,this却没有指向 a。
// arguments {}
```

各处查找后，解答如下
## this指向

为什么'不绑定bind(this), fn中的this 会指向 windows'?

this的指向只考虑三种情况，(再次巩固)

__1.调用时的表达式，谁 直接 调用就指向谁(通过点调用，如a.XXX)__

__2.new 关键词创造的对象内部函数的调用this 永远指向 该对象(内部调用了bind)__

__3.bind apply 绑定了this，之后this永远不会改变__

fn 传给debounce函数 实际属于 '调用时谁直接调用就指向谁',`fn()`相当于`windows.fn()`


此外，这次还发现了一些以前没注意到的细节

'调用时谁直接调用就指向谁'还要 注意两点，

__1.这种this的绑定与 函数定义时 的环境无关，只与函数调用时有关__

(个人认为这种情况的的出现，是由于 函数存在 堆中，而不是栈中。)

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
            fn(args)
        }, wait);
    }
}
let a = {x:'1651'}
let  i = { // 把函数写进了对象i里，再传给
    j:'11111',
    k: function(b){console.log(this,b)}
}
a.c = debounce(i.k,500) // 注意这里是传入的i.k，可能直觉上会以为到时候fn指向i，但
a.c(1);a.c(1);a.c(1);a.c(1);
// windows{} 但还是指向了windows
```

__2.只关注'直接'，也就是最近的那一位调用者__

```js
obj.say();
obj.action.say();
window.obj.action.say();

// say输出的this，分别为 obj / action / action
```