---
title: RxJS repeatWhen实现轮询
date: 2022-02-02 19:31:31
categories: 知识点
tags: 
    - RxJS
---
# RxJS repeatWhen实现轮询

## 前言

(无关内容，可直接跳过)

下面是 2021-04-13 23:35:14 的留言 ----------------------------------

业务上有个轮询操作，最近又自学了RxJS，

不想妥协嵌套函数，不想使用settimeout，想写一段代码检视会上大家第一眼看不懂的代码，

想着憋一个轮询出来应该不难吧....

结果可能是RxJS用的人相对少，或者很多地方都是能用就行，

所以问了查了很多地方，问了很多人，也没有满意的答案，

直到我翻到了repeatWhen这个操作符，才有了一丝希望，谁知道这又是一个新坑的开始...

经过不断的尝试，搜索，翻看文档，查看源码(在公司没外网权限，手机硬查.....)，

终于是写了一版(可以说是菜鸟本鸟了)，

回家复现了出来，这里做个笔记，真能帮到有需要的人便是我最开心的事.

下面是 2021-11-05 10:25:12 的留言 ----------------------------------

今天进一下掘金居然看到有人给这篇文章点赞了

但是之前文章并没有把 repeatWhen 讲的很透，甚至有个小错误

这个操作符经过我在公司项目半年的实际运用后已经基本摸清，现在改一版更详细的讲解

## repeatWhen

首先是最核心的 __repeatWhen__

这个操作符由 __源Observable__ 调用,

repeatWhen接收一个函数, 该函数被称为 __notifier__,

__notifier__ 返回值必须是一个Observable,

当该 返回值Observable 内部的next被调用

则 源Observable 会再次创建 并被subscribe(再次调用),

当该 返回值Observable 内部的error complete被调用,

则 无事发生,事件结束

最基础的使用方式如下

```js
let count = 0
const ori = new Observable((Observer)=>{ // 源Observable
    console.log(++count)
    Observer.complete()
})
ori.pipe(
    repeatWhen(() => { // notify函数
        return new Observable(Observer => {
            Observer.next()
        })
    })
)
.subscribe(() => {})
// 1
// 2
```

其原理是 repeatWhen 创建了一个 源Observable 的镜像,

当源Observable的complete被调用, 则触发notify函数, 并将 镜像源Observable

交由notify函数触发

相当于 镜像源Observable 订阅了 notify 返回的Observable.

这个 notify 被 镜像源Observable 订阅 的感觉 可以看官方例子理解
```js
import { of, fromEvent } from 'rxjs';
import { repeatWhen } from 'rxjs/operators';

const source = of('Repeat message');
const documentClick$ = fromEvent(document, 'click');

source.pipe(repeatWhen(() => documentClick$)
).subscribe(data => console.log(data))
```

但是个人最建议的使用方式还是下面这种

repeatWhen 还会给 __notifier__ 传入一个 __notifications__,

这个 __notifications__ 似乎是一个 Subject(可理解为Observable的一种)

当源Observable的complete被调用,__notifications__ 内部的next就会被调用

可直接使用此 __notifications__ 而不 new Observable,

```js
let count = 0
const ori = new Observable((Observer)=>{
    console.log(++count)
    Observer.complete()
})
ori.pipe(
    repeatWhen((notifications) => {
        return notifications.pipe(
            // takeWhile:当内部函数返回true时 调用next,否则complete
            takeWhile(() => count < 5)
        )
    })
)
.subscribe(() => {})
//1 2 3 4 5 循环5次
```

[rxjs_repeatWhen官网解释](https://rxjs.dev/api/operators/repeatWhen)

## 实现轮询

话都在注释里

```js
import { Component, OnInit } from '@angular/core';
import { Observable, Subject } from 'rxjs'
import { repeatWhen,delay,takeWhile,timeout } from 'rxjs/operators'

@Component({
    selector: 'app-test',
    templateUrl: './test.component.html',
    styleUrls: ['./test.component.css']
})
export class TestComponent implements OnInit {
    constructor() {}
    ngOnInit(): void {
        let count = 0
        const source = new Observable(observer => {
            console.log('----------start----------'); // start标记
            setTimeout(() => { // 模拟异步获取后端数据
                console.log('get'); // get标记
                count ++ // 模拟拿到数据,并修改状态，例如 进度条进度 todo....
                observer.complete() // 请求完就complete，触发repeatWhen
            }, 2000);
        })
        source.pipe(
            repeatWhen((notifications) => {
                return notifications.pipe(
                    delay(2000),
                    takeWhile(() => {
                        console.log('judge count < 5 while repeat,count:',count);
                        return count < 5
                    }),
                    // 可设置20秒轮询超时时间，此20秒包含 请求时间 及 delay(2000) 的时间
                    // 例如在此处20秒大概是5次轮询后超时
                    // timeout(20000) 
                )
            })
        )
        .subscribe()
        // ----------start---------- (创建新observable发起请求)
        // 2秒 (向后台请求时间)
        // get (获得数据)
        // 2秒 (设置的延迟请求时间)
        // judge count < 5 while repeat,count: 1 (判断是否达到循环终止条件)
        // ----------start---------- (立即下过一次请求开始)
        // .....
        // ----------start---------- (创建新observable发起请求)
        // 2秒 (向后台请求时间)
        // get (获得数据)
        // 2秒 (设置的延迟时间)
        // judge count < 5 while repeat,count: 5 (判断是否达到循环终止条件)
        // (结束)
}

```