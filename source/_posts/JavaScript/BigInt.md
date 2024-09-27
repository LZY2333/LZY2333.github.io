---
title: BigInt
date: 2024-06-04 18:54:01
categories: 技术栈
tags:
    - JS基础
summary: JS 第七大原始数据类型，用于表示大于`2^53 - 1`的整数,这也是JS中Number类型可以表示的最大数字。
---

### BigInt

JS 第七大原始数据类型，用于表示大于`2^53 - 1`的整数,这也是JS中Number类型可以表示的最大数字。

#### 描述

1. 在整数数字后加一个n
2. 调用函数 `BigInt(整数|字符串)`
```js
const theBiggestInt = 9007199254740991n;
const alsoHuge = BigInt(9007199254740991);
const hugeString = BigInt('9007199254740991');
const hugeHex = BigInt("0x1fffffffffffff");
```

#### typeof
typeof 可以检测返回 七大原始数据类型:

`'null'` `'undefined'` `'boolean'` `'number'` `'string'` `'symbol'` `'bigint'`

以及 `'object'` `'function'`
```js
typeof 1n === "bigint"; // true
typeof BigInt("1") === "bigint"; // true
```

#### 运算
支持 `+`、`*`、`-`、`**`、`%`

不能使用`Math`中的方法，不能与任何`Number`混合运算，转换成`Number`会丢失精度
```js
const previousMaxSafe = BigInt(Number.MAX_SAFE_INTEGER);
// ↪ 9007199254740991n
const maxPlusOne = previousMaxSafe + 1n;
// ↪ 9007199254740992n
const multi = previousMaxSafe * 2n;
// ↪ 18014398509481982n
const subtr = multi – 10n;
// ↪ 18014398509481972n
const mod = multi % 10n;
// ↪ 2n
const bigN = 2n ** 54n;
// ↪ 18014398509481984n
bigN * -1n
// ↪ –18014398509481984n
```

#### 比较
与`Number`比较会进行隐式转换
```js
0n === 0; // false
0n == 0; // true
1n < 2; // true
2n > 1; // true
```

### 最大安全整数

JS没有整数类型，所有数字(`Number`)均以 __双精度64位浮点格式__ 表示，遵循 IEEE 754 标准。

由 8Byte，64bit 组成。

bit63 符号位, bits62-52 指数位(移码), bits51-0 尾数位.

11位指数位, 52位尾数位, 最大尾数位拉满1, 再加上省略的默认整数位1, 可表示 53位1 即 2^53-1。

大于52位尾数的数, 无法储存的位会被忽略，出现和小数一样的精度丢失情况，不同的数被储存后存在数与其完全相等。

安全，代表精度没有损失，代表双精度展示 和 整数是一对一对应的的。

`Number.MAX_SAFE_INTEGER` `Number.POSITIVE_INFINITY` `Number.MAX_VALUE` `Infinity`

> 计算机采用科学计数法储存数，科学计数法 与 原码 反码 补码 移码 计算机原理。
> 二进制1 = 2^1-1，二进制 11 = 2^2-1,二进制 111 = 2^3-1, 二进制 53位1 = 2^53-1
> 2^53 - 1 双精度64位浮点格式 默认整数位1, 加上52位尾数位全为 1，共 53位1, 为最大安全整数
> 2^53     指数位储存53, 尾数位需要储存53个0, 但最后1位0被忽略, 能被JS正常储存
> 2^53 + 1 指数位储存53，尾数位需要储存52个0, 和最后1位1被忽略, 因此与 2^53 相等。

### 为什么 0.1 + 0.2 与 0.3

```js
const result = 0.1 + 0.2; // 0.30000000000000004
0.1 + 0.2 === 0.3; // false
0.3 + 0.4 === 0.7; // true
```

1. 

```js
// 0.1和0.2转换成二进制后为无限循环数
0.1 -> 0.0001100110011001...(无限循环)
0.2 -> 0.0011001100110011...(无限循环)
```

尾数位数限制52位，再加上省略的一位，这53位是JS精度范围，需要将后面多余的位截掉

于是出现了精度损失

0.1 的二进制浮点数转换成十进制的结果是 0.100000001490116119384765625

0.2 的二进制浮点数转换成十进制的结果是 0.20000000298023223876953125

相加后 0.30000000000000004470348358154296875

即 0.30000000000000004

### 为什么 1Byte 是 8bit

一是因为ASCII规范，二是因为物理上 内存的最小管理单位就是8bit, 1元素 管理8个小电容。

1B = 8b, Byte(字节) 是硬件能访问的最小单位, bit(位) 是 储存数据的最小单位

计算机只认识01, 人类认识数字字母, 建立规范将数字字母与01对应, 将字母编码为01给计算机执行。

ASCII编码（全称American Standard Code for information Interchange 美国信息交换标准码）

包含数字 字母 标点符号, 共计 128个, 2^7, 并扩容为 2^8, 8 bit, 1 Byte。

### 宽带和下载速度

为什么我的 1000m宽带，下载速度只有 100MB/s ？

bit  位   存储数据的最小单位,也是物理意义上的数据储存的最小单位
Bite 字节 存储数据的基本单位,由人为定义并作为标准推广

500m宽带，讲的是带宽，也就是实实在在的 储存位 bit，其单位为 Mb/s

下载速度，讲的是 由人定义的数据的最小数据储存单位 Byte，其单位为 MB/s

b 代表 bit， B代表 Byte， 所以 宽带速度 / 8 进行单位转换 才是 下载速度
