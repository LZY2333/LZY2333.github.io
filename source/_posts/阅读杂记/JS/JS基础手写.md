---
title: JS基础手写
date: 2022-06-22 20:48:50
categories: 经验帖
tags:
    - JS基础
---

# JS基础手写

## 手写call/apply/bind

三个函数均可以改变函数的this指向

__call(context,arg1,arg2...)__ ,改变函数的this指向 并立即执行

__apply(context,[arg1,arg2...])__ ,改变函数的this指向 并立即指向,与call接收的参数不同

__bind(context,arg1,arg2...)__ ,改变函数的shit指向

### call(context,arg1,arg2...)

ES3
```js
Function.prototype.call2 = function (context) { // 不能写箭头函数,不然this出问题
    context = context || window;
    context.fn = this;

    var args = [];
    for(var i = 1, len = arguments.length; i < len; i++) {
        args.push('arguments[' + i + ']');
    }

    var result = eval('context.fn(' + args +')');

    delete context.fn
    return result;
}
```

ES5
```js
Function.prototype.call2 = function (context = window,...args) { // 不能写箭头函数,不然this出问题
    context.fn = this; // 可以防止变量覆盖 const key = Symbol();context[key] = this
    let result = context.fn(...args)
    delete context.fn
    return result;
}
```

### apply(context,[arg1,arg2...])

ES3
```js
Function.prototype.apply2 = function (context, arr) {
    var context = Object(context) || window;
    context.fn = this;

    var args = [];  // arguments => arr,1 => 0
    for (var i = 0, len = arr ? arr.length : 0; i < len; i++) {
        args.push('arr[' + i + ']');
    }
    var result = eval('context.fn(' + args + ')')

    delete context.fn
    return result;
}
```

ES6
```js
Function.prototype.apply2 = function (context = window, arr = []) { // 多了一个默认空数组
    context.fn = this;
    let result = context.fn(...arr)
    delete context.fn
    return result;
}
```

### bind(context,arg1,arg2...)

ES6
```js
Function.prototype.bind2 = function (context, ...args) {
    const fn = this
    args = args ? args : []
    return function newFn(...newFnArgs) {
        if (this instanceof newFn) {
            return new fn(...args, ...newFnArgs)
        }
        return fn.apply(context, [...args,...newFnArgs])
    }
}
```

```js
Function.prototype.bind2 = function (context) {

    if (typeof this !== "function") {
      throw new Error("Function.prototype.bind - what is trying to be bound is not callable");
    }

    var self = this;
    var args = Array.prototype.slice.call(arguments, 1);

    var fNOP = function () {};

    var fBound = function () {
        var bindArgs = Array.prototype.slice.call(arguments);
        return self.apply(this instanceof fNOP ? this : context, args.concat(bindArgs));
    }

    fNOP.prototype = this.prototype;
    fBound.prototype = new fNOP();
    return fBound;
}
```


1.返回一个 this绑定context 新函数

2.同时可以传入部分参数

3.可以 new新函数 创建对象,此时 构造函数是 旧函数, 绑定的新this失效,但传入的参数有效

```js
var value = 2;

var foo = {
    value: 1
};

function bar(name, age) {
    this.habit = 'shopping';
    console.log(this.value);
    console.log(name);
    console.log(age);
}

bar.prototype.friend = 'kevin';

var bindFoo = bar.bind(foo, 'daisy');

var obj = new bindFoo('18');
// undefined
// daisy
// 18
console.log(obj.habit);
console.log(obj.friend);
// shopping
// kevin
```

[JavaScript深入之bind的模拟实现](https://github.com/mqyqingfeng/Blog/issues/12)

## 手写new

## 手写深拷贝

__浅拷贝__，如果复制的对象是基本数据类型，拷贝的就是值，如果是引用类型，拷贝的就是内存地址，一个对象改变会影响另一个对象

### JSON.parse(JSON.stringify()) 基本能用版

1. `JSON.parse(JSON.stringify())`，写法简单，但无法拷贝函数，循环引用，或特殊引用类型.

### forIn遍历，递归自身，丐版

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

### cloneTarget=[]兼容数组，map解决循环引用，够用了版

```js
/**
 * 深拷贝
 * @param {Object} target 要拷贝的对象
 * @param {WeakMap} map 用于存储循环引用对象的地址
 */
function deepClone(target， map = new WeakMap()) {
    if (typeof target !== 'object') return target;

    if (map.get(target)) { // `map`解决循环引用
        return map.get(target);
    }

    let cloneTarget = Array.isArray(target) ? [] : {}; // 兼容数组
    
    map.set(target， cloneTarget);

    for (const key in target) {
        if (obj.hasOwnProperty(key)) { // forIn会循环原型链上的可枚举属性，这里去掉
            cloneTarget[key] = deepClone(target[key]， map);
        }
    }
    return cloneTarget
};
```

### WeakMap弱引用 与 {}强引用

### forIn循环效率低，while循环效率高，性能优化版

### 函数类型及特殊引用类型得专门判断
`Map`， `Set` 等类型得专门判断


## 手写Promise