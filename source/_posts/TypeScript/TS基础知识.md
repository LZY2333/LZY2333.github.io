---
title: TS基础知识
date: 2021-04-05 19:07:25
tags: 
    - TypeScript
---

# TS基础知识

又开始啃官方文档了，学完这部分，开始研究 antd-zorro

## 基础类型

简单的
```ts
let isDone: boolean = false; // 布尔值

let decLiteral: number = 6; // 数字

let name: string = "bob"; // 字符串

let list: number[] = [1, 2, 3]; // 数组
let list: Array<number> = [1, 2, 3]; // 数组
```

TS扩展的类型
```ts

// [string, number]
let x: [string, number]; // 元组
x = ['hello', 10]; // OK，表示一个已知元素数量和类型的数组
x = [10, 'hello']; // Error

// enum x {a，b}
enum Color {Red = 1, Green, Blue} // 枚举
let c: Color = Color.Green; // 默认0开始编号，上面改为1开始
let colorName: string = Color[2]; // 可以通过数值，便利的获得名字
console.log(colorName) // Green

// any
let notSure: any = 4; // Any
// 相当于移除了类型检查，可以从此变量获取任意值或方法而不报错

// void
function warnUser(): void { // void类型像是与any类型相反，表示没有任何类型
    console.log("Void");
}
let unusable: void = undefined; // void变量只能是 undefined和null

// Null 和 Undefined
let u: undefined = undefined;
let n: null = null;
// 默认null和undefined是所有类型的子类型，可以赋值给number类型的变量
// 除非指定了--strictNullChecks，只能赋值给void和它们各自。
// 建议开启此选项，因为想传入null给number可以使用联合类型string | null | undefined。

// Never
// Never是任何类型的子类，可以赋值给任何类型，任何类型不可被赋值给Never类型
function error(message: string): never {
    throw new Error(message);
}// 返回never的函数必须存在无法达到的终点，就像上下这两个函数
function infiniteLoop(): never {
    while (true) { }
}

// Object
// object表示非原始类型，也就是除number，string，boolean，symbol，null或undefined之外的类型。

// 类型断言
// 相当于类型转换，表示告诉编译器，我确定这里必然是这个类型，由抽象变具体
let someValue: any = "this is a string";
let strLength: number = (<string>someValue).length;
let strLength2: number = (someValue as string).length;
```

## 变量声明

讲let 和 const，数组解构语法，对象解构语法
```ts
let [, second, , fourth] = [1, 2, 3, 4];

let o = { a: "foo", b: 12, c: "bar" };
let { a, ...passthrough } = o;
let { a, d = 1000 } = o; // 缺省值默认值,函数形参也可使用
let { a: newName1, b: newName2 } = o; //解构并重命名,不是指定类型
let {a, b}: {a: string, b: number} = o; //结构并指定类型

// 函数声明中使用解构加指定类型会很复杂
type C = { a: string, b?: number }
function f({ a, b }: C): void { }

function f({ a, b = 0 } = { a: "" }): void { } //默认传入一个{ a: "" }并解构
f({ a: "yes" }); // ok, default b = 0
f(); // ok, default to {a: ""}, which then defaults b = 0
f({}); // error, 'a' is required if you supply an argument

// ...展开操作符,可展开对象,但只包括可枚举属性,比如展开后,对象上的方法会丢失.
```

## 接口

__简单示例__
```ts
interface LabelledValue {
  label: string;
}

function printLabel(labelledObj: LabelledValue) {
  console.log(labelledObj.label);
}

let myObj = {size: 10, label: "Size 10 Object"};
printLabel(myObj);
```
LabelledValue 代表 必须是一个具有string类型的label属性的对象
TS中的接口不代表着 '实现了该接口',而只关注是否符合接口定义的规范,满足条件就行

```ts
interface Test {
  color?: string; // 可选属性
  // 优点,对可能存在的属性进行预定义,捕获引用了不存在的属性时的错误
  readonly x: number; // 只读属性
  // 被赋值后就不能再修改,相当于属性中的const,const用于变量
}
```

__额外属性的检查__
```ts
interface SquareConfig {
    color?: string;
    width?: number;
}
function createSquare(config: SquareConfig): { color: string; area: number } { }
let mySquare = createSquare({ colour: "red", width: 100 });
```
上面写错了colour,会报错,error: 'colour' not expected in type 'SquareConfig'
而如果就是想加额外属性,绕过额外属性检查,该怎么做
```ts
// 1. 使用类型断言
let mySquare = createSquare({ width: 100, opacity: 0.5 } as SquareConfig);
// 2. 给接口添加一个字符串索引签名,前提是知道这个接口可能具有特殊用途的额外属性(推荐)
interface SquareConfig {
    color?: string;
    width?: number;
    [propName: string]: any;
}
// 3. 将这个对象赋值给一个另一个变量,因为变量不会经过额外属性检查,就像上面简单示例中一样
let squareOptions = { colour: "red", width: 100 };
let mySquare = createSquare(squareOptions);
```

__函数类型__
接口可以表述 对象类型, 也可以描述 函数类型
```ts
interface SearchFunc {
  (source: string, subString: string): boolean;
}
let mySearch: SearchFunc;

mySearch = function(source: string, subString: string) {
  let result = source.search(subString);
  return result > -1;
}
// 函数参数名 可以不与接口定义的参数名一致,只检查 对应位置类型(形状)一致
mySearch = function(src: string, sub: string): boolean {
  let result = src.search(sub);
  return result > -1;
}
```

__可索引的类型__
没看完,以后再复习
```ts
interface StringArray {
  [index: number]: string;
}

let myArray: StringArray;
myArray = ["Bob", "Fred"];

let myStr: string = myArray[0];
```

__类类型__

与C#或Java里接口的基本作用一样，TypeScript也能够用它来明确的强制一个类去符合某种契约。
```ts
interface ClockInterface {
    currentTime: Date;
    setTime(d: Date);
}

class Clock implements ClockInterface {
    currentTime: Date;
    setTime(d: Date) {
        this.currentTime = d;
    }
    constructor(h: number, m: number) { }
}
```