---
title: 手写Promise
date: 2022-06-23 22:17:31
categories: 经验帖
tags:
    - JS基础
summary: 一篇简单的Promise实现，离A+规范还远，但是对于理解Promise原理，绰绰有余了....从实现 同步Promise，到处理异步，再到处理链式调用，层层递进，非常友好。
---

# 手写Promise

## myPromise 1.0 解决同步

### 特性

`myPromise 1.0`版本将完成一个能处理同步状态的`promise`(不考虑异步)。

实现了`promise`的以下特性，很多日常使用的时候并没有注意到，却不知不觉在用了。

1.`promise`构造函数接收一个`executor`函数，且该函数立即执行(即同步执行)

2.`executor`函数接收两个`promise`内部提供的方法`resolve方法`和`reject方法`用于供使用者调用，

在合适的时候改变`promise`成合适的状态

3.`executor`函数内部执行异常时会被捕获并执行`reject`

4.具备三个状态(`fulfilled`成功,`rejected`失败,`pending`等待) 和 

then方法(使用者用于传入`onFulfilled函数`和`onRejected函数`)

5.`promise`默认处于`pending`状态，且只有`promise`处于`pending`状态时，

内部的`executor`才能成功调用`resolve`或`reject`并改变状态。


### 源码

```js
const RESOLVED = 'RESOLVED'
const REJECTED = 'REJECTED'
const PENDING = 'PENDING'

class Promise {
    constructor(executor) {
        this.status = PENDING; // Promise状态
        this.value = undefined; // 用户调用resolve传入的成功数据
        this.reason = undefined; // 用户调用reject传入的失败数据

        let resolve = (value) => {
            if (this.status !== PENDING) return //  5.pending状态一旦改变，无法再变
            this.status = RESOLVED
            this.value = value
        }

        let reject = (reason) => {
            if (this.status !== PENDING) return
            this.status = REJECTED
            this.reason = reason
        }

        try {
            executor(resolve, reject); // 1.executor立即执行，2.resolve/reject方法供使用者调用
        } catch (error) {
            reject(error)  // 3. executor执行异常时 调用reject
        }

    }
    
    then(onFulfilled, onRejected) { // 4. 提供then方法
        if (this.status === RESOLVED) {
            onFulfilled(this.value);
        }
        if (this.status === REJECTED) {
            onRejected(this.reason)
        }
    }
}
```

__then方法基本逻辑__

接收两个参数，代表 成功回调 / 失败回调

被调用时根据 promise的状态，决定promise链的下一步进哪个分支

__then方法 每次返回一个 new Promise 就成了 Promise链__

此时的Promise 无法成Promise链，因为then函数没有写完全

总所周知，Promise能链式调用的根本原理是每次返回一个 new Promise，

因为每个Promise的状态被改变后都是不可再变的，无法复用

__then方法 加上 if(this.status === PENDING) 就解决了 异步__

### 马上试试

```js
let Promise = require('./promise') //引入自己的promise实验一下

let myPromise = new Promise((resolve,reject) => {
  resolve('成功')//改变状态由pending变resolve
  throw new Error('抛出异常')//后两行执行已经没有反应
  reject('失败')
})
myPromise.then((data) => {
  console.log('then resolve---',data);
},(err) => {
  console.log('then reject---',err);
})
```

最后输出:my promise working then resolve--- 成功

## myPromise 1.5 解决异步

```js
class Promise {
    constructor(executor) {
        this.status = PENDING;
        this.value = undefined;
        this.reason = undefined;
        this.onResolvedCallbacks = []; // 储存异步时，then传递的成功回调
        this.onRejectedCallbacks = []; // 储存异步时，then传递的失败回调

        let resolve = (value) => {
            if (this.status !== PENDING) return
            this.status = RESOLVED
            this.value = value
            this.onResolvedCallbacks.forEach(fn=>fn()); // 异步时，then相当于订阅了成功事件的回调，resolve相当于通知
        }

        let reject = (reason) => {
            if (this.status !== PENDING) return
            this.status = REJECTED
            this.reason = reason
            this.onRejectedCallbacks.forEach(fn=>fn());
        }

        try {
            executor(resolve, reject);
        } catch (error) {
            reject(error)
        }

    }
    
    then(onFulfilled, onRejected) {
        if (this.status === RESOLVED) {
            onFulfilled(this.value);
        }
        if (this.status === REJECTED) {
            onRejected(this.reason)
        }
        if(this.status === PENDING){ // 执行到then时promise状态还是pending，说明executor异步
            this.onResolvedCallbacks.push(()=>{
                onFulfilled(this.value);
            });
            this.onRejectedCallbacks.push(()=>{ // 注意不是push(onFulfilled)
               onRejected(this.reason);
            });
        }
    }
}
```

__发布订阅模式__

关键点在于,当executor是异步函数时，then方法会比 resolve reject先执行，此时

先将 成功回调 和 失败回调 保存起来，等resolve reject反过来调用。

## myPromise 2.0 解决链式调用

### 源码

```js
class Promise {
    constructor(executor) {
        this.status = PENDING;
        this.value = undefined;
        this.reason = undefined;
        this.onResolvedCallbacks = [];
        this.onRejectedCallbacks = [];

        let resolve = (value) => {
            if (this.status !== PENDING) return
            this.status = RESOLVED
            this.value = value
            this.onResolvedCallbacks.forEach(fn => fn());
        }

        let reject = (reason) => {
            if (this.status !== PENDING) return
            this.status = REJECTED
            this.reason = reason
            this.onRejectedCallbacks.forEach(fn => fn());
        }

        try {
            executor(resolve, reject);
        } catch (error) {
            reject(error)
        }

    }

    then(onFulfilled, onRejected) {
        let promise2 = new Promise((resolve, reject) => {
            if (this.status === RESOLVED) {
                queueMicrotask(() => { // 或者 queueMicrotask()
                    try {
                        let x = onFulfilled(this.value);
                        resolvePromise(promise2, x, resolve, reject)
                    } catch (e) {
                        reject(e)
                    }
                })
            }
            if (this.status === REJECTED) {
                queueMicrotask(() => {
                    try {
                        let x = onRejected(this.reason)
                        resolvePromise(promise2, x, resolve, reject)
                    } catch (e) {
                        reject(e)
                    }
                })
            }

            if (this.status === PENDING) {
                this.onResolvedCallbacks.push(() => {
                    queueMicrotask(() => {
                        try {
                            let x = onFulfilled(this.value);
                            resolvePromise(promise2, x, resolve, reject)
                        } catch (e) {
                            reject(e)
                        }
                    })
                });
                this.onRejectedCallbacks.push(() => {
                    queueMicrotask(() => {
                        try {
                            let x = onRejected(this.reason);
                            resolvePromise(promise2, x, resolve, reject)
                        } catch (e) {
                            reject(e)
                        }
                    })
                });
            }
        })
        return promise2 // 1. 解决链式调用
    }
}
```

`queueMicrotask` 放入下一个微任务执行，是为了让promise2的构造函数执行完，再把promise2传给resolvePromise进行检测循环

2.0解决了什么问题

1. then return new Promise 实现链式调用

2. onFulfilled/onRejected 成功回调 失败回调 返回的也可能是一个promise，需要再等待嵌套的promise结果

3. 如果一个promise 的 then 又return 一个新的 这个promise，则会循环报错，因为永远没有结果。

```js
const p1 = new Promise((resolve, reject) => {
  resolve(true)
})
const p2 = p1.then(value => {
  return p2
})
// 报错
```

### 马上试试

```js
const p1 = new Promise((resolve, reject) => {
    resolve(true)
})

// 测试循环调用报错
const p2 = p1.then(value => {
    return p2
})
p2.then(value => {
    console.log('never')
}, reason => {
    console.log(reason) // error
})

// 测试 成功回调为 promise
p1.then(value => {
    return new Promise((resolve,reject) => {
        setTimeout(() => {
            resolve('p3 resolved')
        }, 500);
    })
})
.then(value => {
    console.log('expect value to be "p3 resolved":',value) // ok
},error => {
    console.log('never', error);
})
```

## 感谢

感谢自己，之前发的掘金的没人看并且烂尾了的两篇手写Promise源码笔记文章。

[三步完成A+规范Promise，平均一行代码一句注释(上)](https://juejin.cn/post/6844904177865326599)

[三步完成A+规范Promise，平均一行代码一句注释(中)](https://juejin.cn/post/6844904184156946439)