---
title: JS异步并发调度器
date: 2022-06-26 10:24:34
categories: 经验帖
tags:
    - JS基础
summary: 
---

# JS异步并发调度器

这题目很有意思,业务上也是有这个场景的,写了写.

初看觉得应该很简单,写起来思路若有若无,

第一版写的太复杂,改了几版突然顿悟,最终版简洁易懂(多的就不夸了).

### 源码

最后写完感觉,确实很简单一个功能.

```js
class Scheduler {
    constructor(max) {
        this.max = max
        this.count = 0
        this.queue = []
    }
    add(p) {
        this.queue.push(p)
        this.start()
    }
    start() {
        if (this.count >= this.max || !this.queue.length) return
        this.count++
        this.queue.shift()().finally(() => {
            this.count--
            this.start()
        })
    }
}
```

### 题目

```js
// 延迟函数
const sleep = time => new Promise(resolve => setTimeout(resolve, time));

// 同时进行的任务最多2个
const scheduler = new Scheduler(2);

// 添加异步任务
// time: 任务执行的时间
// val: 参数
const addTask = (time, val) => {
    scheduler.add(() => {
        return sleep(time).then(() => console.log(val));
    });
};

addTask(1000, '1');
addTask(500, '2');
addTask(300, '3');
addTask(400, '4');
// 2
// 3
// 1
// 4
```

搜了搜别人的解法,感觉还是我写的好(有一说一),遂发出来...