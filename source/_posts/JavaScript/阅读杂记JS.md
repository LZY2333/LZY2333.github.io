---
title: 阅读杂记JS
date: 2022-05-10 05:51:23
categories: 经验帖
tags:
    - JS基础
    - 杂记
summary: jS杂记，阅读杂记系列为 【对日常看过的一些有趣帖子的笔记】/【对某一细节进行搜索深入了解后的分析】/【对某一技术原理架构分析后的脑图】，总贴记录 待研究的知识点 及 小知识点，分贴记录大知识点
---


### 一共有哪些数据类型

8种: `null`，`undefined`，`boolean`，`number`，`string`，`Object`，`Symbol`，`BigInt`

#### Symbol 表示独一无二的值

1. `Symbol` 接收一个参数表示对`Symbol`值的一种描述，`const s1 = Symbol('foo')`，

2. 传入相同的参数，生成的`Symbol`也不同

3. `const s2 = Symbol.for('foo')`方法会检测上文中是否已存在相同参数创建的`Symbol`，存在则返回该`Symbol`，不存在则新建

最常见是在开源库内作为常量，比如用来自定义一个类型 比如 react源码内的 `const REACT_ELEMENT = Symbol.for('react.element')`

或者是作为开源库内的 对象属性， `Object.keys` 和`Object.getOwnPropertyNames` 均不会返回`Symbol`，

`Object.getOwnPropertySymbols`可以返回对象所有`Symbol`属性

#### BigInt 用来表示大于 2^53-1 的整数

`BigInt` 真没怎么用过，只知道是用来表示 大于 2^53-1 的数的，末尾加n就行

JS所有数字均以 __双精度64位浮点格式__ 表示.

#### null 和 undefined区别

null 表示值就是空，如原型链的终点

undefined 表示尚未被赋值，却尝试读取，如变量声明，函数无返回值



### 如何判断数据类型

#### typeof 能判断8种基本类型 function

`typeof` 能判断8种基本类型，及`function`类型，`Object`的衍生类型都只能返回`object`(全部小写字符串)

#### instanceof 能判断 实例 的 对象类型

`instanceof` 能判断实例的对象类型，不能判断8种基本数据类型，原理是顺着原型链找，也就是prototype

`console.log(people1 instanceof People); // true`

#### Object.prototype.toString.call() 能判断所有内置类型

`Object.prototype.toString.call([]); // "[object Array]"`(类型首字母大写)

#### 如何判断变量为数组
```js
const arr = []
Array.isArray(arr); // true
arr.__proto__ === Array.prototype; // true
arr instanceof Array; // true
Object.prototype.toString.call([]).slice(8,-1) === 'Array' // true
```

#### 如何遍历对象属性
仅`for/in`返回 原型链属性，仅 `Reflect.ownKeys()`返回 Symbol
`Object.keys()`                 非继承，可枚举
`Object.getOwnPropertyNames()`  非继承，可枚举，不可枚举
`Reflect.ownKeys()`             非继承，可枚举，不可枚举，Symbol
`for ... in ...`                  继承，可枚举

__不可枚举__: 在Object.defineProperty()方法中 `enumerable` 键值默认为 false

__js的内置方法和属性几乎都不可枚举__

#### 如何判断两个对象是否相等

__=== 与 == 的区别__ : `==` 类型不同时会发生类型的自动转换，转换为相同的类型后再做比较



### 事件循环/宏任务和微任务

异步的一些 API，比如 setTimeout，setInterval，requestIdleCallback 和 requestAnimationFrame 还有 Promise，这几个有什么区别？

### 原型-作用域-this
### Promise题
### call-apply-bind-new
### JS常见手写


### 0.1 + 0.2 !== 0.3，如何解决

### 写一个发布订阅模型


### 如何定位哪行js代码导致了页面刷新？



