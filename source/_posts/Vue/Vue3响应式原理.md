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

```js
export let activeEffect = undefined;

function cleanupEffect(effect) {
    const { deps } = effect;
    for (let i = 0; i < deps.length; i++) { // 3.清空属性对自己的记录
        deps[i].delete(effect);
    }
    effect.deps.length = 0; // 3.清空依赖的列表
}

export class ReactiveEffect {
    constructor(private fn, public scheduler?) { }
    parent = undefined; // 4. 外层effect标记
    active = true; // 5.失活标记
    deps = []; // 2.我存在于哪些属性的影响队列内。
    run() {
        if (!this.active) { // 5.失活状态，被强制调用更新，不进行依赖收集，仅根据最新数据进行更新
            return this.fn(); // 5.如果这里做了依赖收集，则失活状态就取消了。
        }
        try {
            this.parent = activeEffect; // 4. 防止effect嵌套调用
            activeEffect = this; // 4. 执行前先放好当前activeEffect
            cleanupEffect(this); // 3. 清理上一次的依赖收集
            return this.fn(); // 3. fn()执行，又自动触发新依赖的收集
        } finally {
            activeEffect = this.parent; // 4. 执行结束，返回上层effect
            this.parent = undefined;
        }
    }
    stop() {
        if (this.active) {
            cleanupEffect(this); // 5.失活就是删除当前的依赖收集，
            this.active = false; // 5.并标记之后的执行也不再依赖收集
        }
    }
}

export function effect(fn, options: any = {}) {
    const _effect = new ReactiveEffect(fn, options.scheduler);
    _effect.run(); // 本质就是创建一个effect，并立即执行。

    const runner = _effect.run.bind(_effect); // run方法内部用到了this,bind一下防止this链改变
    runner.effect = _effect; // 5.将effect挂载并抛出供外部使用(如调用stop方法)
    return runner; // 5.返回强制执行函数
}
```

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
    deps = [];
    constructor(public fn) { }
    run() {
        try {
+           cleanupEffect(this); // 先清理老依赖，再运行，同时顺便收集新依赖
            return this.fn();
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
    constructor(private fn, public scheduler?) { }
    parent = undefined; // 4. 外层effect标记
    run() {
        try {
            this.parent = activeEffect; // 4. 防止effect嵌套调用
            activeEffect = this; // 4. 执行前，先放好当前activeEffect，防止多次调用
            return this.fn();
        } finally {
            activeEffect = this.parent; // 4. 执行后，交回当前activeEffect
            this.parent = undefined;
        }
    }
}
export function effect(fn) {
    const _effect = new ReactiveEffect(fn)
    _effect.run()
}
```

__5. effect.stop失活/.run执行__

需求: 失活以后所有属性修改不再触发此effect。

方案: 清除所有属性对此effect的影响记录，并设定后续调用也不进行依赖收集

注意，后续强制调用runner依旧根据最新数据执行，但不能再依赖收集，否则stop会失效了。

// 用于watch：数据变了，调用回调函数，而不是直接触发effect

```js
export class ReactiveEffect {
    active = true; // 5.失活标记
    run() {
        if (!this.active) {
            return this.fn(); // 5.如果这里做了依赖收集，则失活状态就取消了。
        }
    }
    stop(){
        if(this.active){ 
            cleanupEffect(this);
            this.active = false
        }
    }
}
export function effect(fn, options?) {
    const _effect = new ReactiveEffect(fn); 
    _effect.run();

    const runner = _effect.run.bind(_effect);
    runner.effect = _effect; // 内含stop方法
    return runner; // 返回runner
}
```
## Watch

监控 函数的返回值 响应式对象(Vue3)，数据变化时，触发回调

__使用方式__
```js
const state = reactive({ name: '123' })

watch(state, (newVal, oldVal) => {}); // 这样写性能差，默认监控其下所有属性
watch(() => state.name, () => {}); // 标准写法
watch(state.name, () => {}); // 错误写法,.name非响应式对象 无法记录依赖。

// watch回调为异步触发，加入第三个参数{flush:'sync'} 可以同步
```

__实现代码__
```js
// 遍历属性，从而收集依赖，seen防止死循环，深拷贝也是完全一样的写法
function traverse(value, seen = new Set()) {
    if (!isObject(value) || seen.has(value)) return value;
    seen.add(value);

    for (const key in value) traverse(value[key], seen);
    return value;
}

export function watch(source, cb, options) { // source 更新 重新调用cb
    return doWatch(source, cb, options);
}
export function watchEffect(source, options) { // source内数据 更新 重新调用source
    return doWatch(source, null, options);
}

export function doWatch(source, cb, options) {
    let getter;
    if (isReactive(source)) {
        getter = () => traverse(source);
    } else if (isFunction(source)) {
        getter = source;
    }

    let oldVal;
    const job = () => { // scheduler
        if (!cb) {
            effect.run(); // watchEffect 直接重新执行source，完全等同于effect\
            return
        }
        const newVal = effect.run(); // watch，重新执行source拿到新值，
        cb(newVal, oldVal, onCleanup); // 然后才是重点，执行cb
        oldVal = newVal;
    };
    const effect = new ReactiveEffect(getter, job);
    oldVal = effect.run(); // 调用时立即执行一遍，收集依赖，同时拿到oldVal
}
```

> watch = effect + 包装   watchEffect = effect


## Proxy Handler全部实现代码

贴一下Handler全部代码，方便后续与computed进行对比。

Reactive 响应式对象负责，依赖收集，触发更新

Effect 副作用负责，标记当前运行中的effectReactive 响应式对象
```js
export const mutableHandlers = {
    get(target, key, receiver) {
        if (key === ReactiveFlags.IS_REACTIVE) return true;
        if (isRef(target[key])) return target[key].value; // 拆包，Ref对象调用时省略.value
        if (isObject(target[key])) return reactive(target[key]); // 递归调用(用到了才递归，)

        const res = Reflect.get(target, key, receiver);
        track(target, key); // 依赖收集--------------------！！！
        return res;
    },
    set(target, key, value, receiver) {
        let oldValue = target[key];
        const r = Reflect.set(target, key, value, receiver);
        // 触发effect--------------------！！！
        if (oldValue !== value) trigger(target, key, value, oldValue);
        return r;
    },
};
```

__track__ 和 __trigger__
```js
// map中找到该属性的影响effects队列deps，给trackEffects去添加当前effect
const targetMap = new WeakMap();
export function track(target, key) {
    if (activeEffect) {
        let depsMap = targetMap.get(target);
        if (!depsMap) targetMap.set(target, (depsMap = new Map()));
        let dep = depsMap.get(key);
        if (!dep) depsMap.set(key, (dep = new Set()));
        trackEffects(dep);
    }
}
export function trackEffects(dep) {
    let shouldTrack = !dep.has(activeEffect);
    if (shouldTrack) {
        dep.add(activeEffect); // 属性记录effect
        activeEffect.deps.push(dep); // effect记住属性的影响effect列表(方便后续从列表里删除自己)
    }
}

// map中找到该属性的影响effects队列deps，给triggerEffects去触发影响的effect
export function trigger(target, key, newValue, oldValue) {
    const depsMap = targetMap.get(target);
    if (!depsMap) return
    const dep = depsMap.get(key);
    triggerEffects(dep);
}
export function triggerEffects(dep) {
    const effects = [...dep];
    effects && effects.forEach((effect) => {
        if (effect === activeEffect) return // 跳过当前正在执行的effect
        if (effect.scheduler) {effect.scheduler();return;}
        effect.run(); // 有用户自定义scheduler，用用户的，没有就默认run
    });
}
```

## Computed

Computed 和 Ref 都是构造一个响应式对象，和 Reactive 类似。

Computed 和 Ref 是在外层包一层响应式对象，并储存更多额外信息，而 Reactive 是将一个对象改造成响应式。

Computed 和 Ref 的 deps 直接存在自己的对象中，直接调用`trackEffects(dep)`添加当前effects

Reactive Handler 的 track 就是从全局map对象中找到 受影响effect数组deps，再调用`trackEffects(dep)`

(因为其封装只是通过proxy，进行代理，本身没有挂载deps)

__computed使用__

根据其他数据生成衍生数据，默认懒执行，依赖不发生变化时使用缓存数据，减少计算。

不能直接修改计算属性自己的值(.value)
```js
const state = reactive({ firstName: 'a', lastName: 'b' })
const fullName = computed({
    get() {
        return state.firstName + state.lastName
    },
    set(val) {
        state.firstName = val
    }
})
effect(() => {
    app.innerHTML = fullName
})
```

__实现代码__

存两处依赖收集， 
1. computed属性 和 其依赖的getter中的属性，
2. computed属性 和 使用了computed属性的effect。

所以依赖发生变化时有两处更新，
1. `this._dirty = true`。下一次get时，computed属性更新
2. `triggerEffects(this.dep)`。依赖于该computed属性的effect渲染更新

```js
class ComputedRefImpl {
    public effect;
    public _value;
    public _dirty = true;
+   public dep = new Set();
    // Handler.get中使用到了，读取如果该对象是ref就读取其value值，这样调用少写一个.value
    public __v_isRef = true;
    constructor(getter, public setter) {
        this.effect = new ReactiveEffect(getter, () => {
            if (!this._dirty) {
                this._dirty = true; // 依赖的值发生变化了 会将dirty变为true
+               triggerEffects(this.dep); // 当依赖的值发生变化了 也应该触发更新
            }
        });
    }
    get value() {
        // 和handler一样，就是依赖收集+然后返回数据
+       trackEffects(this.dep);

        if (this._dirty) {
            this._dirty = false;
            this._value = this.effect.run(); // 缓存数据
        }
        return this._value;
    }
    set value(newVal) {
        this.setter(newVal);
    }
}
export function computed(getterOrOptions) {
    // 拿到getter，setter 返回一个computed对象
    let getter;
    let setter;
    const isGetter = isFunction(getterOrOptions);
    if (isGetter) {
        getter = getterOrOptions;
        setter = () => {
            console.log("warn");
        };
    } else {
        getter = getterOrOptions.get;
        setter = getterOrOptions.set;
    }
    return new ComputedRefImpl(getter, setter);
}
```

## Ref

Ref 处理基本类型，让基本类型变成响应式，而不需要人工包装成对象，再包装成响应式对象。

__实现代码__

在基本类型外包装一层响应式对象，并用.value接取值。

并在读取值时，如果判断如果一个对象是ref对象就读取其value值，自动拆包，减少.value得书写。

```js
export function isRef(value) {
    return !!(value && value.__v_isRef);
}

export function toReactive(value) {
    // 如果是一个普通对象，将其包装为响应式对象(因为对象的属性也需要被监控)
    return isObject(value) ? reactive(value) : value;
}
class RefImpl {
    public _value;
    public dep = new Set();
    public __v_isRef = true;
    constructor(public rawValue) {
        this._value = toReactive(rawValue);
    }
    // 和handler一样，get收集依赖，set更新渲染
    // 不一样在于这里直接监控传入的整个值，不论是object 还是 基本类型，直接收集依赖。
    get value() {
        trackEffects(this.dep);
        return this._value;
    }
    set value(newVal) {
        if (newVal !== this.rawValue) { // 和handler.set一样,新旧值有变更才触发更新
            this.rawValue = newVal;
            this._value = toReactive(newVal);
            triggerEffects(this.dep);
        }
    }
}
export function ref(value) {
    return new RefImpl(value);
}
```
## 总结

React 的 `useRef` 目的是保存数据， 而Vue3 的 `Ref` 目的是监听数据变化
