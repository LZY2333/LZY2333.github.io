---
title: TS碰见的特殊类型收集
date: 2022-11-25 11:11:22
categories: 技术栈
tags: 
    - TypeScript
---

## TS碰见的特殊类型收集

包含 常用内置条件类型，及其实现 供随时查阅

存在大量泛型进行类型转换

[TS内置工具类型](https://www.typescriptlang.org/docs/handbook/utility-types.html)



## 内置条件类型---------
### Pick

__内置__

type中选出指定属性构成新type
```ts
type Pick<T, K extends keyof T> = {
    [P in K]: T[P];
};
```

### Partial

__内置__

type中所有属性转换为可选
```ts
type Partial<T> = {
    [P in keyof T]?: T[P];
};
```

### Exclude

__内置__

type中所有属性转换为可选
```ts
type Exclude<T, U> = T extends U ? never : T;
```

## 自定义条件类型-------


## 业务碰见的需求类型----


### type中改指定属性为可选

