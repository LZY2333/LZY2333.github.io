---
title: call-apply-bind-new
date: 2022-06-22 20:48:50
categories: 经验帖
tags:
    - JS基础
summary: call(context,arg1,arg2...)/apply(context,[arg1,arg2...])/bind(context,arg1,arg2...),三个函数均可以改变函数的this指向,手写一波源码
---

# call-apply-bind-new

call/apply/bind

三个函数均可以改变函数的this指向

__call(context,arg1,arg2...)__ ,改变函数的this指向 并立即执行

__apply(context,[arg1,arg2...])__ ,改变函数的this指向 并立即指向,与call接收的参数不同

__bind(context,arg1,arg2...)__ ,改变函数的shit指向

### call(context,arg1,arg2...)

ES6
```js
Function.prototype.call2 = function (context = window,...args) { // 不能写箭头函数,不然this出问题
    context.fn = this; // 可以防止变量覆盖 const key = Symbol();context[key] = this
    let result = context.fn(...args)
    delete context.fn
    return result;
}
```

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

### apply(context,[arg1,arg2...])

ES6
```js
Function.prototype.apply2 = function (context = window, arr = []) { // 多了一个默认空数组
    context.fn = this;
    let result = context.fn(...arr)
    delete context.fn
    return result;
}
```

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

### bind(context,arg1,arg2...)

#### 源码(不考虑new的情况)
ES6
```js
Function.prototype.bind2 = function (context, ...args) {
    if(typeof this !== 'function'){
        throw new TypeError(this + 'must be a function');
    }
    const self = this
    args = args ? args : []
    return function (...newArgs) { // 用闭包保留了context
        return fn.apply(context, [...args,...newArgs])
    }
}
```

ES3
```js
Function.prototype.bind2 = function bind(thisArg){
    if(typeof this !== 'function'){
        throw new TypeError(this + 'must be a function');
    }
    var self = this;
    var args = [].slice.call(arguments, 1);
    return function (){
        var boundArgs = [].slice.call(arguments);
        return self.apply(thisArg, args.concat(boundArgs));
    };
}
```

#### bind的三条特性

第三条尤为麻烦

1.函数.bind(context,arg1,arg2...) 返回 一个 this绑定context 新函数

2.可以在bind时 传入 函数的 部分参数

3.可以 new新函数 创建对象,此时 构造函数是 旧函数, 绑定的新context失效,但bind时 传入的参数有效

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

#### 源码(简单实现带new效果)

ES6
```js
Function.prototype.bind2 = function (context, ...args) {
    if(typeof this !== 'function'){
        throw new TypeError(this + 'must be a function');
    }
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

注意 `if (this instanceof newFn) {}`

new 函数 的时候,会将当前 函数 的this绑定 由其自己为构造函数，创建的新对象，再执行

换句话说，当 this 指向的是 该函数的实例 时，代表正在进行new操作。


#### 源码(完全实现)

感觉略复杂，目前是 完全抄 若川大佬的，回头细品，待续...

```js
// 第三版 实现new调用
Function.prototype.bind2 = function bind(thisArg){
    if(typeof this !== 'function'){
        throw new TypeError(this + ' must be a function');
    }
    // 存储调用bind的函数本身
    var self = this;
    // 去除thisArg的其他参数 转成数组
    var args = [].slice.call(arguments, 1);
    var bound = function(){
        // bind返回的函数 的参数转成数组
        var boundArgs = [].slice.call(arguments);
        var finalArgs = args.concat(boundArgs);
        // new 调用时，其实this instanceof bound判断也不是很准确。es6 new.target就是解决这一问题的。
        if(this instanceof bound){
            // 这里是实现上文描述的 new 的第 1, 2, 4 步
            // 1.创建一个全新的对象
            // 2.并且执行[[Prototype]]链接
            // 4.通过`new`创建的每个对象将最终被`[[Prototype]]`链接到这个函数的`prototype`对象上。
            // self可能是ES6的箭头函数，没有prototype，所以就没必要再指向做prototype操作。
            if(self.prototype){
                // ES5 提供的方案 Object.create()
                // bound.prototype = Object.create(self.prototype);
                // 但 既然是模拟ES5的bind，那浏览器也基本没有实现Object.create()
                // 所以采用 MDN ployfill方案 https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/create
                function Empty(){}
                Empty.prototype = self.prototype;
                bound.prototype = new Empty();
            }
            // 这里是实现上文描述的 new 的第 3 步
            // 3.生成的新对象会绑定到函数调用的`this`。
            var result = self.apply(this, finalArgs);
            // 这里是实现上文描述的 new 的第 5 步
            // 5.如果函数没有返回对象类型`Object`(包含`Functoin`, `Array`, `Date`, `RegExg`, `Error`)，
            // 那么`new`表达式中的函数调用会自动返回这个新的对象。
            var isObject = typeof result === 'object' && result !== null;
            var isFunction = typeof result === 'function';
            if(isObject || isFunction){
                return result;
            }
            return this;
        }
        else{
            // apply修改this指向，把两个函数的参数合并传给self函数，并执行self函数，返回执行结果
            return self.apply(thisArg, finalArgs);
        }
    };
    return bound;
}
```

[JavaScript深入之bind的模拟实现](https://github.com/mqyqingfeng/Blog/issues/12)

[若川 面试官问：能否模拟实现JS的bind方法](https://juejin.cn/post/6844903718089916429)

## 手写new

ES5
```js
function myNew(constructor, ...args) {
    if (typeof constructor !== 'function') {
        throw new Error('constructor must be a function!');
    }

    const obj = Object.create(constructor.prototype); // 以构造函数的prototype为原型创建一个新对象
    const res = constructor.apply(obj, args); // 以新对象为this调用构造函数，取得返回值

    const isObject = typeof res === 'object' && res !== null;
    const isFunction = typeof res === 'function';

    return isObject || isFunction ? res : obj;
}
```

1. 创建一个 以该 构造函数.prototype 为原型 的 新对象

2. 以新对象为this，调用 该构造函数 ，内部可通过this对 新对象 添加赋值属性

3. 如果 构造函数 有返回值且是 对象或函数(也是对象)，则前面白干，以返回值为最终结果


前两条 保证了 new 新对象,

既可以访问 构造函数.prototype(原型对象)中的属性，

又可以访问 构造函数调用时通过 this给 新对象 赋值的属性。


> __proto__ ，绝大部分浏览器都支持这个非标准的方法访问原型，
> 然而它并不存在于 Person.prototype 中，实际上，它是来自于 Object.prototype ，
> 与其说是一个属性，不如说是一个 getter/setter，当使用 obj.__proto__ 时，
> 可以理解成返回了 Object.getPrototypeOf(obj)。

冴羽大佬的评论区是必看的
[JavaScript深入之new的模拟实现](https://github.com/mqyqingfeng/Blog/issues/13)

[面试官问：能否模拟实现JS的new操作符](https://juejin.cn/post/6844903704663949325#heading-7)
## 手写Promise