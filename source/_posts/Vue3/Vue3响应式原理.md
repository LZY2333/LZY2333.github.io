---
title: Vue3响应式原理
date: 2022-12-05 17:12:41
categories: 技术栈
tags: 
    - Vue3
---

## 1. Vue3响应式原理

Vue 借鉴了 angular 的模板和数据绑定技术，又借鉴了 react 的组件化和虚拟 DOM 技术。

### Vue三要素

__响应式__: 例如如何监听数据变化,其中的实现方法就是我们提到的双向绑定

__模板引擎__: 如何解析模板

__渲染__: Vue如何将监听到的数据变化和解析后的HTML进行渲染

### Vue3变化

__模块拆分__ 可单独使用Vue的某个模块，如Reactive响应式模块，而不引入整个Vue

__组合式API__ 通过TreeShaking实现按需引入，使用简洁，减少打包体积，抽取公共逻辑方便，无this指向疑惑

__自定义渲染器__ 针对不同平台基于Vue进行对接，更方便

### Proxy

#### 1. Proxy 解决了defineProperty 多个痛点

Vue2 通过 `Object.defineProperty` 进行数据劫持

1. 需要重写对象的每个属性的get set方法

2. 无法监控 新增和删除的属性(需使用`$set`、`$delete`)

3. 无法监控 数组的索引读取(浪费性能)

Proxy直接代理整个对象, 后续须使用Proxy返回的ProxyObj进行操作.
```js
const mutableHandlers = {
  get(target, key, receiver) {
    if (key === ReactiveFlags.IS_REACTIVE) return true; // 标记解决Proxy多重代理
    const res = Reflect.get(target, key, receiver); // Reflect解决this绑定
    return res;
  },
  set(target, key, value, receiver) {
    let oldValue = target[key];
    const r = Reflect.set(target, key, value, receiver);
    return r;
  },
};


const reactiveMap = new WeakMap(); // 缓存解决Proxy多次代理

function reactive(target) {
  if (!isObject(target)) return target;

  let existingProxy = reactiveMap.get(target); // 缓存解决Proxy多次代理
  if (existingProxy) return existingProxy; // 代理过直接返回之前的代理结果

  if (target[ReactiveFlags.IS_REACTIVE]) return target; // 标记解决Proxy多重代理，已经是proxy无需代理
  const proxy = new Proxy(target, mutableHandlers);

  reactiveMap.set(target, proxy); 
  return proxy;
}

```

#### 2. Proxy 需要 receiver 和 reflect

`new Proxy(target, mutableHandlers)`,第二个参数为重写的get/set方法为属性的对象

get/set方法 的最后一个参数为 receiver

receiver 代表 Proxy 创建 Proxy对象本身,用于通过 Reflect绑定this

保证this指向 Proxy对象,这样保证target存在this获取数据时,也能从proxy中进行一遍代理

从而收集到正确的属性依赖
```js
const a = {
    i: 1,
    get j() {
        return this.i
    }
}
const ProxyObj = new Proxy(a, {
    get(target, key, receiver) {
        return target.key;
    },
    set(target, key, value, receiver) {
        target.key = value
        return value;
    }
})
ProxyObj.j // j的get调用的是a.i,i未经过proxyObj,未被记录依赖，。
```

> Reflect 用于属性绑定this，call用于函数绑定this

#### 3. WeakMap 与 多次代理 与 多层代理

多次代理: 对 同一对象 进行 多次proxy代理

多层代理: 对 对象代理返回的proxy对象，进行代理

这两种情况都需要提前判断，直接返回第一次代理的结果

处理 __多次代理__

使用`WeakMap` 缓存代理过的对象，建立target 与 proxyObj的映射

发现 `WeakMap` 中存在该target的代理时，代表已经代理过，直接返回

处理 __多层代理__

在 Proxy 的 get 上增加了一个Proxy标记,

进行代理前先检查 target 是否存在该标记 表示target是个 Proxy 直接返回target

> WeakMap 的 key 只能是对象
> 解决多层代理，Vue3.0的方案是, 创建一个反向映射表,Proxy => 原对象,浪费性能

## effect

#### 依赖收集
顾名思义副作用