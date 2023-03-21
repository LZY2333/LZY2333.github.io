---
title: TypeScript笔记汇总
date: 2022-11-14 10:34:47
categories: 技术栈
tags: 
    - TypeScript
summary: TypeScript是Javascript的超集，遵循最新的ES5/ES6规范。Typescript扩展了Javascript语法。
---

为什么需要TS？

1. JS的特点是灵活，但是随着项目规模的扩大，灵活反而成为了心智负担，风险负担。

例如，使用JS，不知道一个变量究竟是什么类型，使用TS，可在编写代码时类型检查提醒报错，还有智能提示。

2. 越来越多的项目开始使用了TS，如Vue3.

TS注意:

1. TS在开发的时候检测，并不在运行的时候

2. TS从安全的角度出发，一切为安全考虑


[type-challenges](https://github.com/type-challenges/type-challenges)

[TypeScript Puzzles](https://bigfrontend.dev/typescript)

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


### 类的使用注意事项

原型属性 (get xxx 属性访问器来实现) 、原型方法 (`类名.prototype`实现)

实例属性:

1.指constructor中this.挂载的属性

2.须先声明后使用,或在constructor()内加public等关键字

3.实例属性将挂载在实例上

静态属性:

1.static修饰

2.静态属性将挂载在类(函数对象)上


super:

1.在构造函数中、静态方法中super指向的是父类

2.在原型方法中super指向的是父类的原型

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

### 如何访问type中的属性类型

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

__根本原理__

&交叉是 属性变多范围变小 联合|是 属性变少范围变大
```ts
interface a1 { j: number, k: number }
interface a2 { i: number, k: number }

type x1 = keyof (a1 & a2) // j i k
type x2 = keyof (a1 | a2) // k

```

`let k:a1 = x1`交叉类型& 是其成员类型的子类

`let k:x2 = a1`联合类型| 是其成员类型的父类


交叉类型& 综合了其成员的所有属性的类型

交叉类型& 属性更多了,约束更多了,范围更小了,所以是子集
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

联合类型| 表示一个值可以是其成员类型之一,未确定具体类型之前,只能调用其成员类型的共有属性

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

### 分发机制引发的问题

__联合类型 通过泛型传入 且 直接作为裸类型使用时,会触发分发机制__
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

__分发机制 会在条件类型内引发 子类判断异常的问题__

由于分发机制，

T7中的1 2 3 分别和 1 | 2 做了比较，得到了 true | false 的type，也就是boolean

而理论上，我们希望的是 type 1 | 2 | 3 与 type 1 | 2，做比较，得到 false
```ts
type UnionAssets1<T, U> = T extends U ? true : false;
type T7 = UnionAssets1<1 | 2 | 3, 1 | 2>; // boolean

// 解决方案
type NoDistribute<T> = T & {}; // 避免分发机制
type UnionAssets<T, U> = NoDistribute<T> extends U ? true : false;
type T8 = UnionAssets<1 | 2, 1 | 2 | 3>; // true
type T9 = UnionAssets<1 | 2 | 3, 1 | 2>; // false

```

__any也会有分发问题__

__never也会有分发问题, 但只在泛型传递的时候会返回never， 不分发就正常__
```ts
type T10 = any extends "123" ? true : false; // boolean

type isNever<T> = T extends never ? true : false;
type T11 = isNever<never>; // never
```

### 操作符 keyof 

keyof 索引类型查询,返回值是一个 联合类型

typeof 类型查询

必须在type关键字后使用,属于TS的领域.

### readonly 创建字面量类型

```ts
type x = readonly ['1',2,'3']
function b(a:x) { }
b(['1',2,'3'])
```

### 约束变量是一个任意类

```ts
type clazz = new (...args:any[]): any
```

### in is 类型保护

in 通过检测实例是否具有某属性，在上下文确定其类型
```ts
interface Fish {
    swimming: string,
}
interface Bird {
    fly: string,
    leg: number
}
function getType(animal: Fish | Bird) {
    // 此次为js语法，但差异是通过ts来实现的
    if ('swimming' in animal) {
        animal // Fish
    } else {
        animal // Bird
    }
}
```

通过js无法在上下文确定变量类型，可以使用TS中的 is 返回其确定类型

```ts
interface Bird {
  fly: string;
  kind: "鸟";
}
interface Fish {
  swim: string;
  kind: "鱼";
}
// 纯JS：如果getAnimal中 使用此函数，TS不能能在上下文确定animal类型，并提供类型提示
function isBird0(animal: Fish | Bird) {
    return animal.kind === '鸟'
}
// JS + TS： 能在上下文确定其类型
// 工具方法中判断类型的方法 全部需要使用 is 语法
function isBird(val: Bird | Fish): val is Bird {
  return val.kind === "鸟"; // 必须是boolean
}

function getAnimal (animal:Fish | Bird){
    if(isBird(animal)){
        animal // 如果用的是 isBird0，此处animal依旧类型为 Fish | Bird
    }else{
        animal
    }
}
```

### infer 推断

infer表示在 extends 条件语句中待推断的类型变量。

内置条件类型`ReturnType`

意为:如果 T 满足 `(...args: any[]) => infer P` 则返回类型`P`,反正返回类型`any`
```ts
type ReturnType<T> = T extends (...args: any[]) => infer P ? P : any;
```

顺便举个离谱的例子, __反转元组类型__.

如果T满足`[infer L, ...infer R]`,将 L 放入 F 数组,

递归,依次将 L 放入 F 数组,当T中再也拿不出L,返回F数组,完成递归反转.
```js
// 第一轮,取到L1放入F.
// 第二轮,[L2, ...F]中的F就是[L1],L1被放在L2后.
// ...
// 最后, T为空,拿不出L,不满足extends,返回已经放满的F.
export type ReverseTuple<T extends any[], F extends any[] = []> = T extends [
    infer L,
    ...infer R
]
    ? ReverseTuple<R, [L, ...F]>
    : F;

type A = ReverseTuple<[string, number, boolean]>; // [boolean, number, string]
type B = ReverseTuple<[1, 2, 3]>; // [3,2,1]
type C = ReverseTuple<[]>; // []
```
Type中的遍历操作，就是递归完成