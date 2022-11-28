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

### Exclude排除

__内置__

T不继承自U就返回T

一般用于联合类型,去除T中U包含的部分(T和U的差集)
```ts
type Exclude<T, U> = T extends U ? never : T;
```

### Extract提取

__内置__

T继承自U就返回T

一般用于联合类型,提取T中U包含的部分(T和U的交集)
```ts
type Extract<T, U> = T extends U ? T : never;
```

### Omit

type中移除K属性
```ts
type Omit<T, K extends keyof any> = Pick<T, Exclude<keyof T, K>>;
```

## 自定义条件类型-------

### 类型是否相同,并返回指定类型
```ts
type isEqual<T, U, Success, Fail> = [T] extends [U] ? [U] extends [T] ? Success : Fail : Fail;
```

### 除去T中的string类型以外的属性

拿到T中,string类型的key的联合类型
```ts
type Person = {
    name: string;
    age: number;
    address: string;
}
type ExtractKeysByValueType0<T, U> = {
    [K in keyof T]: isEqual< T[K], U, K, never >; // equal就要这个key,不equal就设定为never
}
// 建立映射 { name: "name"; age: never; address: "address"; }

type ExtractKeysByValueType1<T, U> = {
    [K in keyof T]: isEqual< T[K], U, K, never>
}[keyof T] // {}拿到了新的类,然后{}[]通过key拿到了值,type取属性.同时具有去掉never的作用
// "name" | "address"
```

除去T中的string类型以外的属性
```ts
type ExtractKeysByValueType<T, U> = Pick<T, ExtractKeysByValueType1<T, U>>
// { name: string;address: string; }
```

除去T中的string类型的属性
```ts
type OmitKeysByValueType1<T, U> = {
    [K in keyof T]: isEqual< T[K], U, never, K> // 反一下
}[keyof T] 
type OmitKeysByValueType<T, U> = Pick<T, OmitKeysByValueType1<T, U>>
// { age: number; }
```

除去T中的string类型以外的属性
```ts
type PickKeysByValue<T extends object, U> = {
  // as 语法 映射成一个新的变量
  [K in keyof T as T[K] extends U ? K : never]: T[K];
};
```

### 查看复杂类型的属性
```ts
type Compute<T extends object> = {
    [key in keyof T]: T[key];
};
```

### T中指定K改为可选类型
```ts
type PartialPropsOptional<T, K extends keyof T> = Partial<Pick<T, K>> & Omit<T, K>
```

### T和U类的交集
```ts
type ObjectInter<T extends object, U extends object> = Pick<
  U,
  Extract<keyof T, keyof U> // name,address
>;
```

### T和U类的差集
```ts
// 求对象的差集  B - A . Omit+Extract == Pick + Exclude
type ObjectDiff<T extends object, U extends object> = Pick<
  U,
  Exclude<keyof T, keyof U> // name,address
>;
```

删除U中与T的交集(T的补集:T+属性成为U)
```ts
type ObjectComp<T extends object, U extends T> = Omit<
  U,
  Extract<keyof T, keyof U>
>;
```


## 业务碰见的需求类型----


### type中改指定属性为可选

