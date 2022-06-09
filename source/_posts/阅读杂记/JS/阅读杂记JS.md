---
title: 阅读杂记JS
date: 2022-05-10 05:51:23
categories: 经验帖
tags:
    - JS基础
    - 杂记
summary: jS杂记，阅读杂记系列为 【对日常看过的一些有趣帖子的笔记】/【对某一细节进行搜索深入了解后的分析】/【对某一技术原理架构分析后的脑图】，总贴记录 待研究的知识点 及 小知识点，分贴记录大知识点
---

# 阅读杂记JS

## 一共有哪些数据类型

8种: `null`,`undefined`,`boolean`,`number`,`string`,`Object`,`Symbol`,`BigInt`

### `Symbol` 表示独一无二的值

1. `Symbol` 接收一个参数表示对`Symbol`值的一种描述,`const s1 = Symbol('foo')`,

2. 传入相同的参数,生成的`Symbol`也不同

3. `const s2 = Symbol.for('foo')`方法会检测上文中是否已存在相同参数创建的`Symbol`，存在则返回该`Symbol`，不存在则新建

最常见是在开源库内作为常量,比如用来自定义一个类型 比如 react源码内的 `const REACT_ELEMENT = Symbol.for('react.element')`

或者是作为开源库内的 对象属性, `Object.keys` 和`Object.getOwnPropertyNames` 均不会返回`Symbol`,

`Object.getOwnPropertySymbols`可以返回对象所有`Symbol`属性

### `BigInt` 用来表示大于 2^53-1 的整数

`BigInt` 真没怎么用过,只知道是用来表示 大于 2^53-1 的数的,末尾加n就行

JS所有数字均以 __双精度64位浮点格式__ 表示.



## 如何判断数据类型

### `typeof` 能判断8种基本类型`function`

`typeof` 能判断8种基本类型,及`function`类型,`Object`的衍生类型都只能返回`object`(全部小写)

### `instanceof` 能判断 实例 的 对象类型

`instanceof` 能判断实例的对象类型,不能判断8种基本数据类型,原理是顺着原型链找,也就是prototype

`console.log(people1 instanceof People); // true`

### `Object.prototype.toString.call()` 能判断所有内置类型

`Object.prototype.toString.call([]); // "[object Array]"`(类型首字母大写)

### 如何判断变量为数组

```js
Array.isArray(arr); // true
arr.__proto__ === Array.prototype; // true
arr instanceof Array; // true
Object.prototype.toString.call(arr); // "[object Array]"
```

## 原型和原型链(对象属性的查找)

__原型__: 每个JS对象创建的时候其`prototype`都会指向另一个对象,这个对象就是原型.

__原型链__: 每个实例都有自己的原型,原型也是对象,也具有自己的原型,这样的链式结构就是原型链.

查找对象的属性时,会沿着原型链依次向上查找该属性.

## 作用域和作用域链(变量的查找)

__作用域__: 当前执行代码对变量的查找范围.

__作用域链__:查找变量时,会从当前作用域开始一层层向上查找变量(块级,函数,全局作用域)

__函数的作用域在函数定义的时候就确定了,而不是函数执行时__

## 执行上下文

### 什么是执行上下文栈,调用栈

__JS执行机制__: 以代码块为单位 先编译后执行,分为 __编译阶段__ 和 __执行阶段__.

("代码块"有三种:全局代码、函数代码、eval代码。)

__编译阶段__: 会生成两部分 __执行上下文__ 和 __可执行代码__

__执行上下文__: 包含了当前代码在执行期间要用到的 this、变量、对象以及函数等.
(所谓的变量提升就在这里发生)

__执行上下文栈__: 用来管理这些执行上下文,是一个 先进后出的 栈结构.

JS执行时首先会遇到全局代码,栈内压入全局上下文.
然后执行到一个函数时,会 从全局执行上下文中取出这段函数的代码进行编译
创建该函数的执行上下文,又压入栈内.函数执行完毕,又弹出该执行上下文.

__执行上下文栈__ 其实就是 JavaScript 引擎追踪函数执行的一个机制，
当一次有多个函数被调用时，通过调用栈就能够追踪到哪个函数正在被执行以及各函数之间的调用关系。

__栈溢出__ 函数递归没有终止条件,不停压入 执行上下文,导致栈溢出

### 什么是变量提升

JS的执行机制是 以代码块为单位，先编译后执行，分为编译阶段和执行阶段

编译阶段会生成两部分 执行上下文 和 可执行代码

在执行代码之前，其实已经将所有的变量 在 执行上下文 准备好了

变量提升是JS的一个重要设计缺陷, 在ES6中 用 块级作用域 配合 const let 避免这种缺陷。

__作用域__: 函数与变量的可访问范围 全局作用域 函数作用域 块级作用域

JS的设计者一开始也没想到JS会这么火,没有设计的那么复杂。
没想到简单恰恰导致了JS火起来，而火起来后又需要更多的规范

### 什么是变量对象

__变量对象(Variable object)__
__作用域链(Scope chain)__
__this__

## 闭包
闭包的实现

## 事件循环/宏任务和微任务

## Promise 和 async/await 有什么联系

## 手写Promise

## 手写call/apply/bind

## 手写new

## 手写深拷贝

__浅拷贝__,如果复制的对象是基本数据类型,拷贝的就是值,如果是引用类型,拷贝的就是内存地址,一个对象改变会影响另一个对象

### `JSON.parse(JSON.stringify())` 基本能用版

1. `JSON.parse(JSON.stringify())`,写法简单,但无法拷贝函数,循环引用,或特殊引用类型.

### forIn遍历,递归自身,丐版

```js
function clone(target) {
    if (typeof target !== 'object') return target;

    let cloneTarget = {};
    for (const key in target) {
        cloneTarget[key] = clone(target[key]);
    }
    return cloneTarget
};
```

### `cloneTarget=[]`兼容数组,`map`解决循环引用,够用了版

我没事的时候看架构组源码,看到一个大佬写的很好,就背下来了
```js
/**
 * 深拷贝
 * @param {Object} target 要拷贝的对象
 * @param {WeakMap} map 用于存储循环引用对象的地址
 */
function deepClone(target, map = new WeakMap()) {
    if (typeof target !== 'object') return target;

    if (map.get(target)) { // `map`解决循环引用
        return map.get(target);
    }

    let cloneTarget = Array.isArray(target) ? [] : {}; // 兼容数组
    
    map.set(target, cloneTarget);

    for (const key in target) {
        if (obj.hasOwnProperty(key)) { // forIn会循环原型链上的可枚举属性,这里去掉
            cloneTarget[key] = deepClone(target[key], map);
        }
    }
    return cloneTarget
};
```

### WeakMap弱引用 与 `{}`强引用

### forIn循环效率低,while循环效率高,性能优化版

### 函数类型及特殊引用类型得专门判断
`Map`, `Set` 等类型得专门判断

## 0.1 + 0.2 !== 0.3,如何解决

## 写一个发布订阅模型
