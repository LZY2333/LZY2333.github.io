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

#### 最大安全整数 2^53-1

JS没有整数类型，所有数字均以 __双精度64位浮点格式__ 表示. 由 8Byte，64bit 组成。

bit63 符号位, bits62-52 指数位(移码), bits51-0 尾数位.

11位指数位, 52位尾数位, 最大尾数位拉满1, 再加上省略的默认整数位1, 可表示 53位1 即 2^53-1。

大于52位尾数的数, 无法储存的位会被忽略，出现和小数一样的精度丢失情况，不同的数被储存后存在数与其完全相等。

安全，代表精度没有损失，代表双精度展示 和 整数是一对一对应的的。

`Number.MAX_SAFE_INTEGER` `Number.POSITIVE_INFINITY` `Number.MAX_VALUE` `Infinity`

> 计算机采用科学计数法储存数，科学计数法 与 原码 反码 补码 移码 计算机原理，大学学过。
> 二进制1 = 2^1-1，二进制 11 = 2^2-1,二进制 111 = 2^3-1, 二进制 53位1 = 2^53-1
> 2^53 - 1 双精度64位浮点格式 默认整数位1, 加上52位尾数位全为 1，共 53位1, 为最大安全整数
> 2^53     指数位储存53, 尾数位需要储存53个0, 但最后1位0被忽略, 能被JS正常储存
> 2^53 + 1 指数位储存53，尾数位需要储存52个0, 和最后1位1被忽略, 因此与 2^53 相等。

### 为什么 0.1 + 0.2 不等于 0.3

0.1和0.2转换成二进制后会无限循环

尾数位数限制52位，再加上省略的一位，这53位是JS精度范围，需要将后面多余的位截掉

https://juejin.cn/post/6844903680362151950

https://xiaolincoding.com/os/1_hardware/float.html#_2-7-%E4%B8%BA%E4%BB%80%E4%B9%88-0-1-0-2-%E4%B8%8D%E7%AD%89%E4%BA%8E-0-3



### 为什么 1Byte 是 8bit

一是因为ASCII规范，二是因为物理上 内存的最小管理单位就是8bit, 1元素 管理8个小电容。

1B = 8b, Byte(字节) 是硬件能访问的最小单位, bit(位) 是 储存数据的最小单位

计算机只认识01, 人类认识数字字母, 建立规范将数字字母与01对应, 将字母编码为01给计算机执行。

ASCII编码（全称American Standard Code for information Interchange 美国信息交换标准码）

包含数字 字母 标点符号, 共计 128个, 2^7, 并扩容为 2^8, 8 bit, 1 Byte。

#### null 和 undefined区别

null 表示值就是空，如原型链的终点

undefined 表示尚未被赋值，却尝试读取，如变量声明，函数无返回值



### 如何判断数据类型

typeof instanceof toString

#### typeof 能判断8种基本类型 function

`typeof` 能判断8种基本类型，及`function`类型，`Object`的衍生类型都只能返回`object`(全部小写字符串)

#### instanceof 能判断 实例 的 对象类型

`instanceof` 能判断实例的对象类型，不能判断8种基本数据类型，原理是顺着原型链找，也就是prototype

`console.log(people1 instanceof People); // true`

#### Object.prototype.toString.call() 能判断所有内置类型

```js
Object.prototype.toString.call([]); // [object Array](类型首字母大写)

const Xxx = {}
Object.defineProperty(Xxx, Symbol.toStringTag, { value: 'Xxx' })
Object.prototype.toString.call(Xxx); // [object Xxx]
Xxx.toString() // [object Xxx]
```

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

可枚举属性 指 `enumerable` 标志设置为 true 的属性

Object.defineProperty定义的属性，`enumerable` 标志默认为 false

__js的内置方法和属性几乎都不可枚举__

#### 如何判断两个对象是否相等

__=== 与 == 的区别__ : `==` 类型不同时会发生类型的自动转换，转换为相同的类型后再做比较

#### Object.assign()/.create()

`Object.assign()` 将所有可枚举属性的值从一个或多个源对象复制到目标对象，并返回目标对象

`Object.create()` 创建一个新对象，将第一个参数作为其原型链的原型，第二个参数为其属性配置。



### 垃圾回收机制

JS垃圾回收机制就是 定期找出 不再用到的变量 释放其内存。

不再用到的变量，即 对没有被其他对象引用到 的对象

被引用， 即内被另一个对象访问到， 或称处于另一个对象的必备内， 包括 原型链 this链 作用域。

缺点: 内存碎片化 分配速度慢，需要标记整理法

#### 内存泄漏

内存泄漏: 系统执行没用到的内存，却一直没释放。

全局变量、定时器、回调函数、事件监听器、递归、console

减少全局变量，使用完数据及时解除引用，理清代码逻辑减少逻辑嵌套



### 事件委托

利用事件冒泡机制，将DOM事件在其父节点处注册的机制。

多个事件只绑定一次，减少事件绑定，减少DOM交互次数

抹平平台差异，浏览器兼容，ReactNative也可使用

切片编程，统一进行事件处理，

批量更新，交互触发多个事件状态变化，可进行一次更新。



### 跨域

https://juejin.cn/post/7184720010563027001#heading-57


### Cookie、LocalStorage、SessionStorage和IndexedDB

https://juejin.cn/post/7247504715725586490?searchId=2024041514290633254FE3BE4D4C948C03
```js
document.cookie = "username=xxx; expires=Thu, 15 Dec 2023 16:00:00 UTC; path=/";
sessionStorage.setItem("key", "value"); // getItem removeItem clear()
localStorage.setItem("key", "value"); // getItem removeItem clear()
```
储存容量
cookie：4KB； LocalStorage和SessionStorage：5MB到10MB； indexedDB：无上限

生命周期
cookie：持久保存，可以设置过期时间。
LocalStorage：持久保存，除非被显式清除。
indexedDB：持久保存，除非被显式清除。
SessionStorage：关闭浏览器标签或窗口后清除。

安全性
cookie最不安全，可以设置路径、域名和安全标志来限制访问。

### CommonJS AMD CMD UMD ES6Module

CommonJS(NodeJS): exports/require 模块作用域，同步加载，值的拷贝
AMD(RequireJS):   define/require  异步加载，加载完立即执行解析依
CMD(SeaJS):       define/use      异步加载，需要的时候才执行依赖
UMD:              判断用的是哪种规范，再执行返回输出
ES6Module:        export/import   异步加载，值的引用

### 事件循环/宏任务和微任务

异步的一些 API，比如 setTimeout，setInterval，requestIdleCallback 和 requestAnimationFrame 还有 Promise，这几个有什么区别？

浏览器和node的




### 闭包

理解闭包的产生比理解闭包的概念更重要，

__闭包的产生__

根据词法作用域规则，函数的作用域链由函数声明位置决定，声明位置在内部的函数总是可以访问外部函数的变量，

即使内部函数的调用位置，不在其声明的外层函数内，甚至外部函数已经执行结束，

但内部函数 引用的外部函数变量依旧保存在内存中，这些变量的集合称为闭包.

__闭包__

函数与其引用的外部函数词法环境的集合.（函数，自己内部的变量，外部词法环境，可访问的外部变量）

闭包存在两种情况，一种是 内部函数正常在内部执行时，外部词法环境变量均存在，__只要函数执行就存在闭包__

一种是 内部函数执行时外部函数执行上下文已被销毁，

当外部函数已被销毁，内部函数 引用了的外部变量依旧会被保存，

而 未被引用的外部变量 会通过 tree-shaking的方式 被销毁。


### 关于重绘和重排

重绘：某些元素的外观被改变

重排：局部或者整体布局发生改变，需要重新生成布局，重新排列元素。

导致重排的场景：

添加或删除可见的DOM元素

元素的位置发生变化

元素的尺寸发生变化（包括外边距、内边框、边框大小、高度和宽度等）

内容发生变化，比如文本变化或图片被另一个不同尺寸的图片所替代

页面一开始渲染的时候（这避免不了）

浏览器的窗口尺寸变化（因为回流是根据视口的大小来计算元素的位置和大小的）

如何减少重排：

避免频繁操作样式

减少重排范围，尽可能将样式加在具体元素上，而不是它的父级

对于那些复杂的动画，对其设置 position: fixed/absolute，尽可能地使元素脱离文档流，从而减少对其他元素的影响

动画样式启用GPU加速，transform、opacity、filters这些动画不会引起回流重绘


### history路由模式需后端配合

history模式下，url发生改变并刷新页面，浏览器会认为是请求了一个新的页面，发起http 请求，而新的页面是不存在的（后端没配置的话），所以就会导致404。

nginx 配置静态资源代理，告诉服务器返回什么静态文件。

server{
     listen 8080;
     server_name localhost;
     root /usr/share/nginx/lhtml/dist;
     try_files $uri /index.html;  // 添加这一条
     index index.html;
     charset utf-8;
}

使用webpack解决本地运行

devServer:{  
    historyApiFallback:true
}


### WeakMap弱引用 与 {}强引用

Map 和Weakmap 的区别

WeakMap是ES6中新增的一种集合类型，叫做弱映射。它和Map是兄弟关系，与Map的区别在于这个弱字，API还是Map那套API。

Map的键可以是任意类型，WeakMap只接受对象作为键，不接受其它类型的值作为键

Map的键实际上是跟内存地址绑定的，只要内存地址不一样，就视为两个键；WeakMap的键是弱引用，如果创建了一个弱引用对象，不会被垃圾回收关注，如果不再需要，weakmap中的键名对象和所对应的键值对会自动消失，不再手动删除引用。

Map可以被遍历，WeakMap不能被遍历

### 导致js里this指向混乱的原因是什么?

### 0.1 + 0.2 !== 0.3，如何解决

### 写一个发布订阅模型

### 如何定位哪行js代码导致了页面刷新？

### 0.1 + 0.2 是否等于 0.3，如何解决？

### 数组的 sort 默认是按什么排序的？使用的什么算法？

### 如何终止JS程序的执行

JS由于其特殊的 JS运行机制 事件循环机制 ，没有设置exit函数，

但是存在中断函数运行的方法，

可以将整个脚本包裹为自执行函数，再 throw 或 return，

上述两个方法都不能阻止异步任务的继续执行


### 如何优化一个网站的性能
### 如何在前一个页面对下一个页面进行优化


### JS常见手写
### 原型-作用域-this
### Promise题
### call-apply-bind-new