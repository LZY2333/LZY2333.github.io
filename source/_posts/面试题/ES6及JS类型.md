---
title: ES6及JS类型
date: 2021-11-17 19:08:14
categories: 知识点
tags: 
    - 面试题
---

# ES6及JS类型

## ES6

## 数组


### 其他

会修改数组自身的七大方法:
`push`/`pop`/`shift`/`unshift`/`sort`/`reverse`/`splice`

`splice(删除与插入的起始位置,删除元素个数,添加的元素)`
修改原数组,返回删除的元素组成的数组

`slice(start,end)` 前闭后开,不修改原数组,返回新数组

`split('')` 根据括号内符号切割字符串

``

```js
// 求和
function sum(arr) {
    return arr.reduce((total,num) => {
        return total + num
    })
}
```

## 字符串