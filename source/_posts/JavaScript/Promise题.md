---
title: Promise题
date: 2022-06-23 22:17:31
categories: 经验帖
tags:
    - JS基础
summary: Promise各种题，Promise各种题，Promise各种题，Promise各种题，Promise各种题，Promise各种题，Promise各种题，Promise各种题
---

async函数在抛出返回值时，会根据返回值类型开启不同数目的微任务

return结果值：非thenable、非promise（不等待）
return结果值：thenable（等待 1个then的时间）
return结果值：promise（等待 2个then的时间）

await 结果值：非thenable、非promise、promise（不等待）
await 结果值：thenable（等待 1个then的时间）

### Promise.all()

```js
Promise.myAll = function (promises) {
    let arr = [], count = 0
    return new Promise((resolve, reject) => {
        promises.forEach((item, i) => {
            Promise.resolve(item).then((res) => {
                arr[i] = res
                count++
                if (count === promises.length) resolve(arr)
            }).catch(reject)
        });
    })
}
```

`new Promise((resolve, reject)=>{})` 代表整体的成功或失败

`promises.forEach((item, i)=>{})` 先每个promise都调用一遍

`if (count === promises.length) resolve(arr)` 所有都成功,则成功

`.catch(reject)` 任意一个失败,则失败

`Promise.resolve(item)`如果是普通函数,常数,立即返回结果

### Promise.race()

```js
Promise.MyRace = function (promises) {
    return new Promise((resolve, reject) => {
        for (const item of promises) {
            Promise.resolve(item).then(resolve, reject)
        }
    })
}
```

这里大佬还给出了`Promise.any`,`Promise.allSettled`两个方法,暂时没用过回头再补.

[滑稽鸭:请实现promise.all](https://juejin.cn/post/7069805387490263047#heading-5)

### 实现mergePromise函数

把传进去的数组按顺序先后执行，并且把返回的数据先后放到数组data中,

类似于 `.all()`,但是 `.all()`是同步开始执行,`.merge` 是等上一个执行完再开始下一个

```js
function mergePromise(promises) {
    let arr = []
    return promises.reduce((pre, cur) => {
        return pre.then(cur).then(res => {
            arr.push(res)
            return arr
        })
    }, Promise.resolve())
}
```

测试代码
```js
const time = (timer) => {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve()
        }, timer)
    })
}
const ajax1 = () => time(2000).then(() => {
    console.log(1);
    return 1
})
const ajax2 = () => time(1000).then(() => {
    console.log(2);
    return 2
})
const ajax3 = () => time(1000).then(() => {
    console.log(3);
    return 3
})

mergePromise([ajax1, ajax2, ajax3]).then(data => {
    console.log("done");
    console.log(data); // data 为 [1, 2, 3]
});
// Promise.all([ajax1(), ajax2(), ajax3()]).then()
// all 和 race 的调用,参数是 new Promise的集合，因为都是同时立即触发，所以直接主动调用函数，
// merge不能这么设计，merge种函数的调用需要由merge调度，所以
// merge 的参数是 函数的集合
// 注意，mergePromise([ajax1, ajax2, ajax3])也是立即开始任务，而非.then之后才执行。
```

### JS异步并发调度器

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

有一说一,我觉得我写的这波就是完美写法,看了很多人写的复杂又好乱嗷...

题目如下

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

或者直接用我的addTask

```js
addTask(timer,text) {
    this.queue.push(() => new Promise((resolve) => {
        setTimeout(() => {
            console.log(text);
            resolve()
        }, timer);
    }))
}
```


### 封装一个异步加载图片的方法

这个相对简单一些，只需要在图片的onload函数中，使用resolve返回一下就可以了。

```js
function loadImg(url) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = function () {
            console.log("一张图片加载完成");
            resolve(img);
        };
        img.onerror = function () {
            reject(new Error('Could not load image at' + url));
        };
        img.src = url;
    })
}
```
这里属实是有点没看懂,应该是对onload API不认识,整完这波Promise回头补一补.

todo..


### Promise 和 async/await 有什么联系

### 使用Promise实现每隔1秒输出1,2,3

```js
const arr = [1, 2, 3]
arr.reduce((p, item) => {
    return p.then(() => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                console.log(item)
                resolve()
            }, 1000)
        })
    })
}, Promise.resolve())
```

其实就是拼了一个 `Promise().resolve().then(setTimeout).then(setTimeout).then(setTimeout)` 的结构,


### 使用Promise实现红绿灯交替重复亮

红灯3秒亮一次，黄灯2秒亮一次，绿灯1秒亮一次；如何让三个灯不断交替重复亮灯？

（用Promise实现）三个亮灯函数已经存在：

```js
function red() {
    console.log('red');
}
function green() {
    console.log('green');
}
function yellow() {
    console.log('yellow');
}

const light = (timer, cb) => new Promise((resolve) => {
    setTimeout(() => {
        cb()
        resolve()
    }, timer);
})

const p = () => light(3000, red)
    .then(() => light(2000, green))
    .then(() => light(1000, yellow))
    .then(() => p())

p()
```
自己写是写出来了，但是没有想到light函数，三个灯一个个写的promise，没想到通用函数

### ajax请求相同资源时，实际只发出一次请求

[前端并发10个相同的请求，怎么控制为只发一个请求？](https://juejin.cn/post/7052700635154219015)

### 第十题

```js
async function test () {
    console.log(1);
    await {
        then (cb) {
            cb();
        },
    };
    console.log(2);
}

test(); // 2个then
console.log(3);

Promise.resolve()
    .then(() => console.log(4))
    .then(() => console.log(5))
    .then(() => console.log(6))
    .then(() => console.log(7));

// 最终结果: 1 3 4 2 5 6 7
```

await 结果值：非thenable、非promise、promise（不等待）
await 结果值：thenable（等待 1个then的时间）

### 第九题

```js
async function async1 () {
    console.log('1')
    await async2()
    console.log('AAA')
}

async function async2 () {
    console.log('3')
    return new Promise((resolve, reject) => {
        resolve()
        console.log('4')
    })
}

console.log('5')

setTimeout(() => {
    console.log('6')
}, 0);

async1()

new Promise((resolve) => {
    console.log('7')
    resolve()
}).then(() => {
    console.log('8')
}).then(() => {
    console.log('9')
}).then(() => {
    console.log('10')
})
console.log('11')

// 最终结果: 5 1 3 4 7 11 8 9 AAA 10 6
```

### 第八题

```js
async function async1 () {
    await async2()
    console.log('A')
}

async function async2 () {
    return new Promise((resolve, reject) => {
        resolve()
    })
}

async1()

new Promise((resolve) => {
    console.log('B')
    resolve()
}).then(() => {
    console.log('C')
}).then(() => {
    console.log('D')
})

// B C D A
```

```js
async function testA () {
    return 1;
}

testA().then(() => console.log(1)); // 1个then
Promise.resolve()
    .then(() => console.log(2)) // 1个then
    .then(() => console.log(3));// 2个then

// (不等待)最终结果: 1 2 3
```

```js
async function testB () {
    return {
        then (cb) {
            cb();
        }
    };
}

testB().then(() => console.log(1)); // 2个then
Promise.resolve()
    .then(() => console.log(2)) // 1个then
    .then(() => console.log(3));// 2个then

// (等待一个then)最终结果: 2 1 3
```

```js
async function testC () {
    return new Promise((resolve, reject) => {
        resolve()
    })
} 

testC().then(() => console.log(1));
Promise.resolve()
    .then(() => console.log(2))
    .then(() => console.log(3))
    .then(() => console.log(4))

// (等待两个then)最终结果: 2 3 1 4
```

async函数在抛出返回值时，会根据返回值类型开启不同数目的微任务

return结果值：非thenable、非promise（不等待）
return结果值：thenable（等待 1个then的时间）
return结果值：promise（等待 2个then的时间）

### 第一题
```js
const fn = () => (new Promise((resolve, reject) => {
  console.log(1);
  resolve('success')
}))
fn().then(res => {
  console.log(res)
})
console.log('start')

// 1
// 'start'
// 'success'
```

### 第二题

```js
Promise.resolve().then(() => {
  return new Error('error!!!')
}).then(res => {
  console.log("then: ", res)
}).catch(err => {
  console.log("catch: ", err)
})
// "then: " "Error: error!!!"
```

返回任意一个非 promise 的值都会被包裹成 promise 对象，

因此这里的`return new Error('error!!!')`

被包裹成了`return Promise.resolve(new Error('error!!!'))`

### 第三题

```js
Promise.resolve(1)
  .then(2)
  .then(Promise.resolve(3))
  .then(console.log)
// 1
```

`.then` 或者 `.catch` 的参数期望是函数，传入非函数则会发生值透传

第一个then和第二个then中传入的都不是函数，一个是数字类型，一个是对象类型，

因此发生了透传，将resolve(1) 的值直接传到最后一个then里。

### 第四题

```js
function runAsync (x) {
  const p = new Promise(r => setTimeout(() => r(x, console.log(x)), 1000))
  return p
}
function runReject (x) {
  const p = new Promise((res, rej) => setTimeout(() => rej(`Error: ${x}`, console.log(x)), 1000 * x))
  return p
}
Promise.all([runAsync(1), runReject(4), runAsync(3), runReject(2)])
  .then(res => console.log(res))
  .catch(err => console.log(err))

// 1s后输出
// 1
// 3
// 2s后输出
// 2
// Error: 2
// 4s后输出
// 4
```

`.catch()`函数能够捕获到`.all()`里最先的那个异常，并且只执行一次。

且不会影响数组中其它的异步任务的执行

### 第五题

```js
async function async1() {
  console.log("async1 start");
  await async2();
  console.log("async1 end");
}
async function async2() {
  console.log("async2");
}
async1();
console.log('start')

// 前三项均为同步
// 'async1 start'
// 'async2'
// 'start'
// 'async1 end'
```

async 视为 new promise，await(包括await这行)之前都是立即执行的 executor，

await下一行开始都是promise.then


### 第六题

```js
async function async1 () {
  console.log('async1 start');
  await new Promise(resolve => {
    console.log('promise1')
  })
  console.log('async1 success');
  return 'async1 end'
}
console.log('script start')
async1().then(res => console.log(res))
console.log('script end')

// await 后面的promise
// 'script start'
// 'async1 start'
// 'promise1'
// 'script end'
```

await后面的Promise是没有返回值，始终是pending状态，await却始终没有响应...

### 第七题

```js
async function fn () {
    console.log('fn');
    return 1
}
async function fn2() {
    console.log('fn2');
    return await 2
}
fn().then(res => console.log(res))
fn2().then(res => console.log(res))
Promise.resolve('3').then(res => console.log(res))
console.log('start');

// fn
// fn2
// start
// 1
// 3
// 2
```

await 就算跟个常量也会 将其包装为一个promise，因此多一层微任务。、

`return await 2`完全等于 `return await Promise.resolve(2)`

### 感谢

[LinDaiDai_霖呆呆：【建议星星】要就来45道Promise面试题一次爽到底(1.1w字用心整理)](https://juejin.cn/post/6844904077537574919)


[你不知道的async/await魔鬼细节](https://mp.weixin.qq.com/s/Gr7ajRYYazdm5YQvZS6gXg)