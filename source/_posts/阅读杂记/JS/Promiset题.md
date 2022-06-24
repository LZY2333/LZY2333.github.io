---
title: Promise题
date: 2022-06-23 22:17:31
categories: 经验帖
tags:
    - JS基础
summary: Promise各种题，Promise各种题，Promise各种题，Promise各种题，Promise各种题，Promise各种题，Promise各种题，Promise各种题
---

# Promise题

题目基本来自大佬的文章，算是个错题集吧

[LinDaiDai_霖呆呆：【建议星星】要就来45道Promise面试题一次爽到底(1.1w字用心整理)](https://juejin.cn/post/6844904077537574919)


## 第一题
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

## 第二题

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

## 第三题

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

## 第四题

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

## 第五题

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


## 第六题

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

## 第七题

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

