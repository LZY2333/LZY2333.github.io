---
title: TypeScript杂记
date: 2022-11-14 10:34:47
categories: 生活区
tags: 
    - 歌词
summary: TypeScript是Javascript的超集，遵循最新的ES5/ES6规范。Typescript扩展了Javascript语法。
---

## TypeScript杂记

为什么需要TS？

1. JS的特点是灵活，但是随着项目规模的扩大，灵活反而成为了心智负担，风险负担。

例如，使用JS，不知道一个变量究竟是什么类型，使用TS，可在编写代码时类型检查提醒报错，还有智能提示。

2. 越来越多的项目开始使用了TS，如Vue3.

TS注意:

1. TS在开发的时候检测，并不在运行的时候

2. TS从安全的角度出发，一切为安全考虑


### typeof keyof 函数this类型约束

TS中:

typeof 取变量的类型

keyof 取的是类型的key的集合

this 可在函数的第一个参数处做类型约束

> 注意: 如果 type 关键字后面的 typeof 会被视为 TS语法，具有获取 实例类型的功能，
> 或 getName(this: typeof person, key: PersonKey) 冒号后的typeof，也能被识别为TS
> 返回的是 类型本身
> 而语句中的 typeof 会被视为 js语法， 非获取类型的功能，而是返回类型字符串
```ts
const person = { name: "lzy", age: 25 }
type Person = typeof person;
type PersonKey = keyof Person;

function getName(this: Person, key: PersonKey) {
  return this[key];
}
getName.call(person, "name");

let a = typeof person
// let a: "string" | "number" | "bigint" | "boolean" | "symbol" | "undefined" | "object" | "function"
```

### tsc app.ts 指定编译某文件

Ignoring tsconfig.json, compiles the specified files with default compiler options.

直接 tsc 运行某文件时会忽略目录下的tsconfig.json文件....

使用 tsc --help 看可用命令时发现的....

找了半天为啥一直说我target不是es5，明明是在config里配置好了...


### 类

所有实例上的属性(constructor中this.挂载的属性)都需先声明后使用

正常类中： 原型属性 (get xxx 属性访问器来实现) 、原型方法 Animal.prototype

实例属性 实例方法  声明在实例上的

静态属性 静态方法  类上的

super 在构造函数中、静态方法中super指向的是父类

在原型方法中super指向的是父类的原型

#### static 和 public 和 get/set 的挂载

__static挂载在函数对象上__

__get/set挂载在原型对象上__

__public/private/protected 挂载在实例对象上__

get/set 属性 不可和 public/private/protected 重名，可以和 static 重名

get/set 属性 编译的target 必须是 ES5及以上

为什么 get/set 定义的属性 会被定义在原型上？？？？？？？？？？
```js
class Animal1 {
    static type = "1";
    public type2 = "1"
    private type3 = "1";
    protected type4 = "1";
    get type5() {
        return "1"
    }
}
const a = new Animal1()

var Animal1 = /** @class */ (function () {
    function Animal1() {
        this.type2 = "1";
        this.type3 = "1";
        this.type4 = "1";
    }
    Object.defineProperty(Animal1.prototype, "type5", {
        get: function () {
            return "1";
        },
        enumerable: false,
        configurable: true
    });
    Animal1.type = "1";
    return Animal1;
}());
``` 

### type 和 interface的区别

interface 通常描述 对象、类的结构比较多，

type来描述函数的签名、联合类型、 工具类型、映射条件类型

在描述的时候 尽量用type， 不能用再考虑interface

type 优点：可以用联合类型 type 不能重名 , type中可以用后续的条件类型、映射

interface 能重名、可以被扩展和实现、继承、混合类型

```js
interface ICount {
  count: number;
  (): number;
}

// 注意：这里不能用let
// 因为let声明的变量可以修改，改了后可能属性就不存在了，意味着可能访问不到。 不安全
const counter: ICount = () => {
  return counter.count++;
};
counter.count = 0;
```

### 通过索引访问符来访问接口中的属性类型

```js
interface Person {
  name: string;
  age: string;
  address: {
    num: 316;
  };
  // [key: string]: any;  如果写了任意类型，则去出的val 就是任意类型
}
type PersonName = Person["name"];
type PersonNum = Person["address"]["num"]; // 316
type PropTypeUnion = keyof Person; // 取key name | age | address
type PropTypeValueUnion = Person[keyof Person]; // 取值 string | {num:316}
```

### extends联合类型(待补充)

__extends 联合类型,调用时传入变量的类型,必须小于或等于联合类型(范围更小)__

__普通type,调用时传入变量的类型,属性必须多于或等于type(范围更小)__

```ts
type LengthWise = string|string[]
function logger2<T extends LengthWise>(val: T) {
    console.log(val.length)
}
logger2(['s'])
```

### interface函数写法问题

```ts
// 用于约束类时函数写法
interface A {
  a(): void // 约束类中的原型方法
  a: () => void // 约束类中的实例方法
}
```
// 对于对象来说有什么区别? 逆变和协变的时候会讲

### 交叉类型& 联合类型|

__交叉类型& 是综合了其成员的所有属性的类型,是 其任意 交叉成员的子类__

交叉类型& 属性更多了,约束更多了,所以是子集
```ts
interface Person1 {
    handsome: string;
    address: {
        n: string;
    };
}

interface Person2 {
    high: string;
    address: {
        n: number;
    };
}

type Person = Person1 & Person2;
type Temp = Person["address"]["n"]; // Temp类型是never

let p: Person = {
    high: "",
    handsome: "",
    // address: {} // error:不能将类型“{}”分配给类型“{ n: string; } & { n: number; }”
    address: null // OK, address是never类型
};
let p1: Person1 = p // OK
let p2: Person2 = p // OK
```

```ts
function mixin<T, U>(a: T, b: U): T & U {
    return { ...a, ...b };
}
type Compute<T> = { [P in keyof T]: T[P] }; // 是个循环

let r = mixin({ a: 1, b: 2 }, { c: 3, b: "2" });
// 交叉后的结果 涵盖所有的内容

type x = Compute<typeof r>
//   type x = {
//     a: number;
//     b: never;
//     c: number;
// }
```

__联合类型| 表示一个值可以是其成员类型之一,只能调用其成员类型的共有属性__

必须至少具有成员类型之一全部属性,可额外具有其他成员类型属性,不可增加未知属性(似乎有兼容性原理在里面????)

```ts
interface Bird {
    fly();
    layEggs();
}

interface Fish {
    swim();
    layEggs();
}

function getSmallPet(): Fish | Bird {
    return 
}

let pet = getSmallPet();
pet.layEggs(); // okay
pet.swim();    // errors:类型“Fish | Bird”上不存在属性“swim”
```

__二者区别__

```ts
interface a1 { j: number, k: number }
interface a2 { i: number, k: number }

// 交叉类型: i j k,一个不能多一个不能少
let a: a1 & a2 = {
    j: 1,
    i: 2,
    k: 3,
    // xxx: 4 // error
}
// 联合类型: 必须至少具有成员类型之一全部属性,可额外具有其他成员类型属性,不可增加未知属性
let b: a1 | a2 = {
    j: 1,
    i: 2, // j 和 i 可以没有其中之一
    k: 3,
    // xxx: 4 // error:只能存在已知类型
}
```

### 写一个type具有给定type的所有属性 或 部分属性

```ts
type LengthWise = { a: string, b: number }
// 条件约束
// extends 属性多于等于LengthWise
function logger2<T extends LengthWise>(val: T) {
    console.log(val.a)
}
logger2({ a: '1', b: 2, c: '3' })
// 属性少于等于LengthWise
// 相当于每个属性都有?的LengthWise
type key2 = {
    [key in keyof LengthWise]?: LengthWise[key]
}
function logger3(val: key2) {
    console.log(val.a)
}
logger3({ a: '1' })
```

### 分发机制引发的问题

__联合类型 通过泛型传入 且 未经过任何运算,会触发分发机制__
```ts
interface Fish { name: "鱼"; }
interface Water { type: "水"; }
interface Bird { name: "鸟"; }
interface Sky { type: "太空"; }

type SelectType<T> = T extends Fish ? Water : Sky;

// 两种类型分别传入,并返回结果
// type T7 = Water | Sky
type T7 = SelectType<Bird | Fish>;

// 非泛型使用,未触发分发
 // type T8 =  Sky
type T8 = Bird | Fish extends Fish ? Water : Sky;

// 经过了运算,未触发分发
 // type T9 = Sky
type SelectType2<T> = T[] extends Fish[] ? Water : Sky;
type T9 = SelectType<Bird | Fish>;
```