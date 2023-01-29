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

__组合式API__ Vue3核心特点

Vue3采用组合式API，抽取公共逻辑非常方便。

解决了组件逻辑共享问题，Vue2采用了mixin，存在数据来源不明确，命名冲突等问题，

通过TreeShaking实现按需引入，使用简洁，减少打包体积，抽取公共逻辑方便，无this指向疑惑

__自定义渲染器__ 针对不同平台基于Vue进行对接，更方便

### Reactive

Vue3最大的提升就是使用了Proxy进行数据劫持

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
    if (isObject(target[key])) { // 属性调用时才递归代理
        return reactive(target[key])
    } 
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
ProxyObj.j // j的get调用的是a.i,i未经过proxyObj,未被记录依赖。
// 使用reflect 和 receiver解决。从proxyObj中拿值，而不是a中。这样就能收集到j 和 i 两个依赖。
```

> Reflect 用于属性绑定this，call用于函数绑定this

#### 3. WeakMap 与 多次代理 与 多层代理

多次代理: 对 同一对象 进行 多次proxy代理

多层代理: 对 对象代理返回的proxy对象，进行代理

这两种情况都需要提前判断，直接返回第一次代理的结果

处理 __多次代理__

使用 `WeakMap` 缓存代理过的对象，建立target 与 proxyObj的映射

发现 `WeakMap` 中存在该target的代理时，代表已经代理过，直接返回

处理 __多层代理__

在 Proxy 的 get 上增加了一个Proxy标记,

`reactive()`进行代理前先检查 target 是否存在该标记 表示target是个 Proxy 直接返回target

> WeakMap 的 key 只能是对象，不会有this泄露问题
> 解决多层代理，Vue3.0的方案是, 创建一个反向映射表,Proxy => 原对象,浪费性能

#### 4. 属性调用时才递归代理

在取值的时候发现取的值是对象，就再次进行代理并返回(依旧对内部对象进行了依赖收集)。
```js
get(target, key, receiver) {
    if (key === ReactiveFlags.IS_REACTIVE) return true; // 标记解决Proxy多重代理
+   if (isObject(target[key])) {
+       return reactive(target[key])
+   } 
    const res = Reflect.get(target, key, receiver); // Reflect解决this绑定
    return res;
}
```

### Effect

`Effect(fn)`顾名思义副作用，接收并执行一个产生副作用的函数

`Effect(fn)`原理，在一个effect执行时，

某属性被调用过，触发了get方法，那说明该effect是依赖于该属性，进行记录。

当该属性被修改时，触发了set方法，依赖于该属性的effect也需要重新执行，以便更新数据或视图。

#### 双向依赖收集

Effect执行时,当前Effect 和 fn内部的对象属性, 会进行 双向收集依赖

__1. 第一向，属性收集依赖于其的effect,在proxy的get set中完成__

存在一个全局WeakMap对象，储存了 一个个对象及其属性属性 影响的 effexts

通过 对象 属性 能拿到该值影响的所有effects

proxy对象 当属性的get被调用时,会储存当前 对象 属性 和 当前执行的 activeEffect,

proxy对象 当属性的set被调用时,拿到该属性记录的所有effect触发其重新执行.

```js
// 属性被调用时记录当前effect
get(target, key, receiver) {
    if (key === ReactiveFlags.IS_REACTIVE) {
        return true;
    }
    const res = Reflect.get(target, key, receiver);
    track(target, 'get', key);  // 依赖收集
    return res;
}

// 记录 对象 => 属性 => effects 的依赖关系
const targetMap = new WeakMap();
export function track(target, type, key) {
    if (activeEffect) {
        let depsMap = targetMap.get(target); // {对象：map}
        if (!depsMap) {
            targetMap.set(target, (depsMap = new Map()))
        }
        let dep = depsMap.get(key);
        if (!dep) {
            depsMap.set(key, (dep = new Set())) // {对象：{ 属性 :[ dep, dep ]}}
        }
        let shouldTrack = !dep.has(activeEffect)
        if (shouldTrack) {
            dep.add(activeEffect);
            // 这里就是双向依赖收集的另一向 2.effect记住dep (3.用于后续清理)
            activeEffect.deps.push(dep);
        }
    }
}
```

```js
// 属性被修改时，重新执行被记录的effect(依赖于此属性的effect)
set(target, key, value, receiver) {
    let oldValue = target[key]
    const result = Reflect.set(target, key, value, receiver);
    if (oldValue !== value) {
        trigger(target, 'set', key, value, oldValue)
    }
    return result;
}

// 找到 对象 => 属性 => effects，让effects重新执行 
export function trigger(target, type, key?, newValue?, oldValue?) {
    const depsMap = targetMap.get(target); // 获取 对象 => 属性 => effects
    if (!depsMap) {
        return
    }
    const effects = depsMap.get(key);
    effects && effects.forEach(effect => {
        if (effect !== activeEffect) effect.run(); // 防止循环
    })
}
```

__2. 第二向，effect收集其依赖的属性影响的effects集合deps__

```js
// proxy的get的track的最后一行，dep是当前属性影响的effects数组集合。
activeEffect.deps.push(dep);
```

__3. effect收集其依赖的属性影响的effects集合deps，是为了后续从中删除自己__

需求:

effect依赖的属性不是一直不变的,当effect不再依赖某个属性时,应从该属性影响的effects集合中删去该effect。

方案:

effect每次执行时会先删除,所有属性记录的该effect的依赖，然后调用fn,

在这时会重新进行依赖收集,fn中的属性的get方法又被调用,又将该effect加入到新属性的依赖中.

```js
function cleanupEffect(effect) {
    const { deps } = effect; // 清理effect
    for (let i = 0; i < deps.length; i++) {
        deps[i].delete(effect);
    }
    effect.deps.length = 0;
}
class ReactiveEffect {
    active = true;
    deps = []; // 收集effect中使用到的属性
    parent = undefined;
    constructor(public fn) { }
    run() {
        try {
            this.parent = activeEffect; // 当前的effect就是他的父亲
            activeEffect = this; // 设置成正在激活的是当前effect
+           cleanupEffect(this);
            return this.fn(); // 先清理在运行
        }
    }
}
```

__4. 确保让属性正确对应其activeEffect__

effect接收一个fn，effect执行，其实就是执行该fn，

fn执行前会将当前effect挂载在全局对象activeEffect中，以便属性收集依赖他的effect

同时注意，存在多个effect先后执行，effect嵌套执行等操作，应当保证activeEffect与属性的正确对应。

```js
export class ReactiveEffect {

}
export function effect(fn) {

    const _effect = new ReactiveEffect(fn)
    _effect.run()
}
```

#### effect.stop失活run执行
effect返回一个强制更新方法。

需求: 失活以后所有属性修改不再触发此effect。
方案:
注意，后续强制调用runner依旧根据最新数据执行，但不能再依赖收集，否则stop会失效了。

// 用于watch：数据变了，调用回调函数，而不是直接触发effect

## Watch
## Computed



## Ref