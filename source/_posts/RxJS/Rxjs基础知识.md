---
title: Rxjs基础知识
date: 2021-02-21 02:53:45
tags: 
    - RxJS
---
# Rxjs基础知识

> 这一篇感觉像把官方文档抄了一遍(好歹是自己排的版!),没办法,中文文档写的太好了,每一句都发人深省.

> 这一篇之后出各类相似操作符使用对比篇吧.

## RxJS 是什么

RxJS 是一个库,它通过使用 observable 序列来编写异步和基于事件的程序.
它提供了一个核心类型 Observable,附属类型 (Observer、 Schedulers、 Subjects) 
和受 [Array#extras] 启发的操作符 (map、filter、reduce、every, 等等),
这些数组操作符可以把异步事件作为集合来处理.

ReactiveX 结合了 观察者模式、迭代器模式 和 使用集合的函数式编程,
以满足以一种理想方式来管理事件序列所需要的一切.

## RxJS 几个基本概念

- **Observable(可观察对象)**: 表示一个概念,这个概念是一个可调用的未来值或事件的集合.
- **Observer(观察者)**: 一个回调函数的集合,它知道如何去监听由 Observable 提供的值.
- **Subscription(订阅)**: 表示 Observable 的执行,主要用于取消 Observable 的执行.
- **Operators(操作符)**: 采用函数式编程风格的纯函数 (pure function),使用像 map、filter、concat、 flatMap 等这样的操作符来处理集合.
- **Subject(主体)**: 相当于 EventEmitter,并且是将值或事件多路推送给多个 Observer 的唯一方式.
- **Schedulers(调度器)**: 用来控制并发并且是中央集权的调度员,允许我们在发生计算时进行协调,例如 setTimeout 或 requestAnimationFrame 或其他.

## RxJS的纯净性使得一个应用状态被隔离出来

RxJS 全部采用纯函数,以此产生值,并在内部层层传递,使得应用状态被隔离出来.

RxJS 具有 纯净性(Purity), 流动性 (Flow), 值(Values) 三个特性

流动性 让你能通过内置操作符控制 事件如何流经 observables.

值 让你能对流经 observables 的值, 方便地进行转换

> 流程控制操作符有 filter、delay、debounceTime、take、takeUntil、distinct、distinctUntilChanged 等等.
> 产生值的操作符有 pluck、pairwise、sample 等等.

## Observable 填补了多值主动推送的空白

|    | 单个值 |   多个值   |
|拉取|Function| Interator |
|推送|Promise | Observable|

> Function和Interator 是调用获取值,所以是拉取
> Promise和Observable 是提前注册事件,事件主动调用并传递值 所以是推送

## 拉取(Pull)和推送(Push)

拉取和推送是两种不同的协议,用来描述数据生产者 (Producer)如何与数据消费者 (Consumer)进行通信的.

拉取,由 消费者 决定何时从 生产者 处接收数据,生产者 不知道数据是何时交到 消费者 手中的.

推送,由 生产者 决定何时把数据 发送给消费者, 消费者 不知道数据何时会接收到数据.
   
|   |          生产者           |          消费者          |
|拉取|  被动的:当被请求时产生数据.  | 主动的:决定何时请求数据.   |
|推送| 主动的:按自己的节奏产生数据. | 被动的:对收到的数据做出反应.|

> JS中每个函数 都是拉取体系,调用函数即获得 单个返回值 进行消费
> generator和 iterators 是拉取体系,调用 `iterator.next()`的代码是消费者,会从 iterator(生产者)中取出 多个值
> Promises 是推送体系.Promise(生产者) 将一个解析过的值传递给已注册的回调函数(消费者),由Promise来决定何时将值 推送 给回调函数
> Observable 是推送体系.是多个值的生产者，并将值“推送”给观察者(消费者)。

## Observables 作为函数的泛化

Observables 像是没有参数的函数,订阅 Observable 类似于调用函数。

Observable 可以随着时间的推移“返回”多个值,函数只能return一次.

Observable 可以异步的“返回”值,函数只能同步.

func.call()            同步地给我一个值
observable.subscribe() 给我任意数量的值，无论是同步还是异步

## Observable 生命周期

使用 `Rx.Observable.create` 或 创建操作符 **创建** Observable1,
使用 `observable1.subscribe({})` 添加观察者 **订阅** Observable1,
Observable1订阅后才会**执行** 并发送 next/error/complete 通知给观察者,
执行过程可以被**清理**

**注意**
同一 Observable 的不同观察者 的Observable传入的 subscribe函数 并不共享,是相互独立的.
> 同一 `Observable.create(function subscribe(observer) {...})`的不同订阅,
> 内部都会创建 新的专门的 subscribe函数 为其订阅服务,

在 调用`observer.complete()` 或 `observer.error()` 之后所有调用都会失效.

建议 在 subscribe函数 中用 try/catch 代码块来包裹内部所有代码.

订阅Observable会返回一个Subscription,表示进行中的执行。之后调用 unsubscribe() 取消执行释放资源。

> 正如 observable.subscribe 类似于 Observable.create(function subscribe() {...}),
> 从 subscribe 返回的 unsubscribe 在概念上也等同于 subscription.unsubscribe。
> 为什么要用这些类型对象来封装并调用各种, 创建 执行 清除 的方法 ? 因为,
> 使用像 Observable、Observer 和 Subscription 这样的 Rx 类型对象,
> 是为了 保证代码的安全性(比如 Observable 规约,防止变量污染 等)和操作符的可组合性。

## Observer(观察者) ubscription(订阅) Subject(主体)

Observer (观察者) 是由三个对应三种Observable 通知类型的回调函数构成的对象.

> 可值提供一个回调函数作为`.subscribe()`的参数,内部会创建一个观察者对象,并将其作为next的参数.

Subscription (订阅) 表示可清理资源的对象,通常是Observable 的执行,基本用来`.unsubscribe()`.

> `subscription1.add(subscription2)`后, 调用 `subscription1.unsubscribe()`,
> 会同时取消 1和2 的订阅, `subscription1.remove(subscription2)`,来撤销添加的子订阅.

Subject (主体) 是一个可以多播给多个观察者的Observable,维护着多个监听器的注册表.
Subject (主体) 同时是一个观察者,有着 `next(v)`、`error(e)` 和 `complete()` 方法.

> `var subject = new Rx.Subject();` subject 可以被多次订阅.
> `observable.subscribe(subject)` subject 可作为参数对其他 observable 进行订阅 
> 通过 subject 可以将单播的 Subject 转换为多播. subject也是将Observable执行共享给多个观察者的唯一方式

## BehaviorSubject、ReplaySubject 和 AsyncSubject 

**BehaviorSubjects**, 多了当前值的概念,当有新的观察者订阅时,会立即向其推送当前值.

> BehaviorSubjects 适合用来表示“随时间推移的值”

```js
var subject = new Rx.BehaviorSubject(0); // 0是初始值

subject.subscribe({
  next: (v) => console.log('observerA: ' + v)
});

subject.next(1);
subject.next(2);

subject.subscribe({
  next: (v) => console.log('observerB: ' + v)
});

subject.next(3);
// observerA: 0
// observerA: 1
// observerA: 2
// observerB: 2
// observerA: 3
// observerB: 3
```

**ReplaySubject(x,y)** 可缓存值,当新观察者订阅时会立即一次向其推送所有缓存值.
x 代表缓存个数; y可不赋值,代表记录长时间内的值.

```js
// 缓存100个,500毫秒内的值.
var subject = new Rx.ReplaySubject(100, 500);

subject.subscribe({
  next: (v) => console.log('observerA: ' + v)
});

var i = 1;
setInterval(() => subject.next(i++), 200);

setTimeout(() => { // 1000毫秒后订阅B,此时应该只储存了3,4,5
  subject.subscribe({
    next: (v) => console.log('observerB: ' + v)
  });
}, 1000);
// observerA: 1
// observerA: 2
// observerA: 3
// observerA: 4
// observerA: 5
// observerB: 3
// observerB: 4
// observerB: 5
// observerA: 6
// observerB: 6
```
**AsyncSubject**,只有Observable执行完成时(complete())时执行,并发送最后一个值给观察者.

> 和操作符 `last()` 类似, 也是等待 complete 通知, 并发送最后一个值.
```js
var subject = new Rx.AsyncSubject();

subject.subscribe({
  next: (v) => console.log('observerA: ' + v)
});

subject.next(1);
subject.next(2);
subject.next(3);
subject.next(4);

subject.subscribe({
  next: (v) => console.log('observerB: ' + v)
});

subject.next(5);
subject.complete();
// observerA: 5
//observerB: 5
```

## Operators (操作符)

RxJS 的根基是 Observable,但RxJS 最有用的是 Operators.

操作符 是Observable类上的方法，被调用时 不会改变调用者Observable实例，而是返回一个基于调用者逻辑的 新的Observable.

操作符 本身是一个纯函数,接收一个Observable输入,生成一个新的Observable输出.

操作符像一个个基础代码单元,将复杂的异步代码封装 以声明的方式调用 能轻松组合 解决各种复杂的异步问题. 

## 操作符订阅链

订阅 output 会导致 input Observable 也被订阅。我们称之为“操作符订阅链”。
```js
// 创建一个自定义操作符函数，它将从输入 Observable 接收的每个值都乘以10
function multiplyByTen(input) {
  var output = Rx.Observable.create(function subscribe(observer) {
    input.subscribe({
      next: (v) => observer.next(10 * v),
      error: (err) => observer.error(err),
      complete: () => observer.complete()
    });
  });
  return output;
}

var input = Rx.Observable.from([1, 2, 3, 4]);
var output = multiplyByTen(input); //返回一个Obserable实例
output.subscribe(x => console.log(x));

// 10
// 20
// 30
// 40
```

## 实例操作符 vs. 静态操作符

实例操作符 是 Observable实例 上的方法.

静态操作符 是直接附加到 Observable类 上的方法,内部不使用this进行实现, 而是依赖入参.

实例运算符 特征是 内部实现使用this来指代输入的 Observable,通过`实例.函数()`来调用
因为通过`observable1.multiplyByTen()`来调用,内部this 就指向调用者,而不需要传参。
```js
// 假设 multibplyByTen 是官方提供的实例操作符,则其 内部实现改变 如下
Rx.Observable.prototype.multiplyByTen = function multiplyByTen() {
  var input = this;
  return Rx.Observable.create(function subscribe(observer) {
    input.subscribe({
      next: (v) => observer.next(10 * v),
      error: (err) => observer.error(err),
      complete: () => observer.complete()
    });
  });
}

var observable = Rx.Observable.from([1, 2, 3, 4]).multiplyByTen(); // 此时均未被订阅
observable.subscribe(x => console.log(x)); // 产生订阅链,两个 observable 均被触发.
```

静态操作符 特征是 内部实现依赖传参,不使用this,通过`Rx.Observable.函数(x)`来调用.

静态操作符 通常是用于从头创建实例,大部分是创建操作符,大部分接收非Observable参数,创建一个新Observalbe.

> 部分 组合操作符 也是 静态操作符, 也就是说 挂载 Observable类 上,通过类来调用,但 接收的不是非 Observable 参数.
> 这些作为 静态运算符 挂载在类上使用是有道理的, 因为他们接收多个 Observable 作为输入
```js
// 以下都是 静态运算符
// 1,2 常用,接收非 Observable参数
var observable1 = Rx.Observable.create(function(observer) { observer.next('1000') })
var observable2 = Rx.Observable.interval(1000 /* 毫秒数 */);
// merge 组合操作符,静态操作符, 接收 多个Observable参数
var merged = Rx.Observable.merge(observable1, observable2);
```

## 选择操作符

官网有一个可以根据你当前需求,推荐操作符的小功能很实用.

## 操作符分类

创建、转换、过滤、组合、多播、错误处理、工具、条件和布尔操作、数学和聚合操作 等操作符.

> 以后用到了就来归类

## Scheduler(调度器)

调度器 让使用者可以 自由定义何时启动 subscription 以及 何时向观察者发送通知.

通过下面一个例子能很好领悟调度器的作用:
```js
var observable1 = Rx.Observable.create(function (proxyObserver) {
  proxyObserver.next(1);
  proxyObserver.next(2);
  proxyObserver.next(3);
  proxyObserver.complete();
})
.observeOn(Rx.Scheduler.async);// 使用操作符 observeOn 来指定 async 调度器发送这些值。

var finalObserver = {
  next: x => console.log('got value ' + x),
  error: err => console.error('something wrong occurred: ' + err),
  complete: () => console.log('done'),
};

console.log('just before subscribe');
observable1.subscribe(finalObserver);
console.log('just after subscribe');

// just before subscribe
// just after subscribe
// got value 1
// got value 2
// got value 3
// done

// async调度器 使得消息向观察者的 推送变为了异步
```

调度器 实际上是 `proxyObserver `(代理观察者).

`observable1.observeOn(Rx.Scheduler.async)`也就是订阅调度器后,
再调用`observable1.subscribe(finalObserver)` 开始了订阅链.

实际上 `observable1` 的 是被调度器`async`订阅为被观察者了,然后观察者`finalObserver`,订阅是
`.observeOn()`产生并返回的Observable,`.observeOn()`中的`next(val)`,实现如下
```js
var proxyObserver = {
  next: (val) => {
    Rx.Scheduler.async.schedule(
      (x) => finalObserver.next(x),
      0 /* 延迟时间 */,
      val /* 会作为上面函数所使用的 x */
    );
  },
  // ...
}
```
而 观察者或者说调度者 `async`, 内部使用了 `setTimeout(fn,0)`,导致了消息在下一事件环才被传递...

> 个人理解,调度器订阅可以让某个Observable实例,的所有的订阅 都经过调度器进行消息的推送控制.
> 肯定不准确,光概念都还没有完全理解

## 调度器类型

async 调度器是 RxJS 提供的内置调度器中的一个。
可以通过使用 Scheduler 对象的静态属性创建并返回其中的每种类型的调度器。

等以后理解了再更

## 使用调度器

等以后理解了再更

## 总结

快乐完结,RxJS基础,结束...