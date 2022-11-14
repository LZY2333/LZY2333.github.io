---
title: Exist
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


## typeof keyof 函数this类型约束

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