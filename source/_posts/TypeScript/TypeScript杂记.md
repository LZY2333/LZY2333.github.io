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