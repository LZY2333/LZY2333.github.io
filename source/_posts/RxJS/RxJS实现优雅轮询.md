---
title: repeatWhen操作符实现轮询
date: 2021-04-13 23:35:14
categories: 知识点
tags: 
    - RxJS
---
# repeatWhen操作符实现轮询

这里写的有点问题，回头修改！！！！！

## 前言

(无关内容，可直接跳过)

业务上有个轮询操作，最近又自学了RxJS，

不想妥协嵌套函数，不想使用settimeout，想写一段代码检视会上大家第一眼看不懂的代码，

想着憋一个轮询出来应该不难吧....

结果可能是RxJS用的人相对少，或者很多地方都是能用就行，

所以问了查了很多地方，问了很多人，也没有满意的答案，

直到我翻到了repeatWhen这个操作符，才有了一丝希望，谁知道这又是一个新坑的开始...

经过不断的尝试，搜索，翻看文档，查看源码(在公司没外网权限，手机硬查.....)，

终于是写了一版(可以说是菜鸟本鸟了)，

回家复现了出来，这里做个笔记，真能帮到有需要的人便是我最开心的事.

## 正文

话都在注释里

```js
import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs'
import { repeatWhen,delay } from 'rxjs/operators'

@Component({
    selector: 'app-test',
    templateUrl: './test.component.html',
    styleUrls: ['./test.component.css']
})
export class TestComponent implements OnInit {

    constructor() { }

    ngOnInit(): void {
        let count = 0
        const source = new Observable(observer => {
            console.log('start'); // start标记
            setTimeout(() => { // 模拟异步获取后端数据
                console.log('get'); // get标记
                const add = 1 // 模拟拿到数据，例如 进度条进度 todo....
                observer.next(add) // 数据传递subscribe
                observer.complete() // 请求完就complete，触发repeatWhen
            }, 1000);
        })
        source.pipe(
            delay(1000), // 模拟延迟4秒向后端再次请求 或 已满足条件结束轮询
            repeatWhen((x) => {
                return new Observable(observer2 => {
                    x.subscribe((a) => {
                        console.log('atest',a); // atest标记，经测试永远为undefined
                        if(count < 5) observer2.next() // 模拟结束条件，count<5 继续轮询
                        else observer2.complete() // count>=5 不再轮询
                    })
                })
            })
        )
        .subscribe((e:number) => {
            count = count + e // 模拟拿到数据进行操作，例如 进度条进度赋值 todo....
            console.log('end',count); // end标记
        })

        // start
        // 1秒 (向后台请求时间)
        // get 1
        // 1秒 (设置的延迟请求时间)
        // end 1
        // atest undefined
        // start (下过一次请求开始)

        // .....
        // start
        // 1秒 (向后台请求时间)
        // get 5
        // 1秒 (设置的延迟请求时间)
        // end 5
        // atest undefined
    }
}

```