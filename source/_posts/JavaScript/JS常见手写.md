---
title: JS常见手写
date: 2023-03-4 20:48:50
categories: 经验帖
tags:
    - JS基础
summary: 实现，类的继承，LRU淘汰算法，Ajax，节流函数，数组去重
---

### 浅比较
```js
/**
 * 浅比较(如果是对象，只比较第一层属性，与深比较/深拷贝相比性能更好，平常够用)
 * @param obj1 任意基本类型或引用类型
 * @param obj2 任意基本类型或引用类型
 * @returns 是否同一对象
 */
function shallowEqual(obj1: any, obj2: any): boolean {
    // 同基本类型，或同引用地址，返回true
    if (obj1 === obj2) return true;

    // 非对象类型 或 为null 返回 false
    if (typeof obj1 !== 'object' || obj1 === null || typeof obj2 !== 'object' || obj2 == null) return false

    const keys1 = Object.keys(obj1)
    const keys2 = Object.keys(obj2)
    if (keys1.length !== keys2.length) return false

    // 如果obj2中没有obj1中的某个属性，或该属性值不相等返回false
    for (let key of keys1) {
        if (!obj2.hasOwnProperty(key) || obj1[key] !== obj2[key]) {
            return false
        }
    }

    return true
}

const obj11 = { a: 1 }
const obj12 = { a: 1 }
console.log(shallowEqual(obj11, obj12)); // true
```

### 手写深拷贝
__浅拷贝__，如果复制的对象是基本数据类型，拷贝的就是值，如果是引用类型，拷贝的就是内存地址，一个对象改变会影响另一个对象

#### JSON.parse(JSON.stringify()) 基本能用版
1. `JSON.parse(JSON.stringify())`，写法简单，但无法拷贝函数，循环引用，或特殊引用类型.

#### forIn遍历，递归自身，丐版
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

#### cloneTarget=[]兼容数组，map解决循环引用，够用了版
```js
/**
 * 深拷贝
 * @param {Object} target 要拷贝的对象
 * @param {WeakMap} map 用于存储循环引用对象的地址
 */
function deepClone(target, map = new WeakMap()) {
    if (typeof target !== 'object') return target

    if (map.get(target)) {
        return map.get(target)
    }

    const cloneTarget = Array.isArray(target) ? [] : {}
    map.set(target, cloneTarget)

    for (const key in target) {
        if (Object.hasOwnProperty.call(target, key)) {
            cloneTarget[key] = deepClone(target[key], map);
        }
    }
    return cloneTarget
}
```
#### WeakMap弱引用 与 {}强引用

Map 和Weakmap 的区别

WeakMap是ES6中新增的一种集合类型，叫做弱映射。它和Map是兄弟关系，与Map的区别在于这个弱字，API还是Map那套API。

Map的键可以是任意类型，WeakMap只接受对象作为键，不接受其它类型的值作为键

Map的键实际上是跟内存地址绑定的，只要内存地址不一样，就视为两个键；WeakMap的键是弱引用，如果创建了一个弱引用对象，不会被垃圾回收关注，如果不再需要，weakmap中的键名对象和所对应的键值对会自动消失，不再手动删除引用。

Map可以被遍历，WeakMap不能被遍历


#### forIn循环效率低，while循环效率高，性能优化版
#### 函数类型及特殊引用类型得专门判断
`Map`， `Set` 等类型得专门判断


### 手写防抖节流
防抖和节流都是防止某一事件频繁触发

#### 防抖(debounce)
施法前摇，在读条期间再次触发会打断施法，重新读条，直到正常读条结束，触发函数。

```js
function debounce(fn, wait) {
    let timer;
    return function () {
        clearTimeout(timer);
        timer = setTimeout(() => {
            fn.apply(this, arguments);
        }, wait);
    };
}
```

场景: 浏览器窗口resize,文本编辑器自动保存,输入框智能提示
防抖重在清零 `clearTimeout(timer)`

#### 节流
节流重在加锁 `timer=timeout`,控制事件发生频率,限流,单位时间内只发生一次
防抖是在等用户给出最终答案 再触发，节流就是防止频繁触发 限流 锁。
```js
function throttle(fn, wait) {
    let timer;
    return function () {
        if (timer) return
        timer = setTimeout(() => {
            fn.apply(this, arguments);
            timer = null;
        }, wait);
    };
}
```
### 如果防抖在首次触发怎么写？

实现一个节流函数? 如果想要最后一次必须执行的话怎么实现?

### 加上对上下文的处理


### 手写排序

冒泡排序 插入排序 选择排序

快速排序 归并排序

### 类的继承

### 手写扁平数组转tree