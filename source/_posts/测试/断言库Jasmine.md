---
title: 断言库Jasmine
date: 2021-06-26 13:53:23
tags: 
    - 测试
---

# 断言库Jasmine

## describe('',()=>{})
suit

表示一群 相关的 标准(spec) 集合

通常一个spec测试文件只包含一个顶层describe函数

字符串参数 会与 it函数 的字符串参数 拼接形成 规范(spec)的全名

```js
describe("A suite", function() {
  it("contains spec with an expectation", function() {
      expect(true).toBe(true);
      expect(1).toBe(1);
    });
});
```

## it('',()=>{})
spec

创建 规范(spec)

一个 规范(spec) 可包含多个 期望(expectation)

期望(expectation) 就是 只返回 boolean 的断言(assertion)

只有所有内部 期望(expectation) 都为true 的 规范(spec) 才为成功态

## expect()
expectation

创建 期望(expectation)

接受一个值,称为 实际值(actual)

通常紧跟着 链式调用 一个接收期望值的 匹配器(Matcher)

## 匹配器(Matcher)
Matcher

匹配器负责返回 实际值 与期望值的匹配结果给Jasmine

在任何匹配器返回结果前,可链式调用其他匹配器,重新评估结果

```js
describe("A suite", function() {
  it("and can have a negative case", function() {
    expect(false).not.toBe(true);
  });
});
```
### not
倒置下一个匹配器的结果
`expect(something).not.toBe(true);`

### noting()
匹配 空
`expect().nothing();`

### toBe(expected)
等同于 `===`
`expect(thing).toBe(realThing);`

### toBeCloseTo(expected, precision?)
期望值expected 在 精度precision 范围内
`expect(number).toBeCloseTo(42.2, 3);`

### toBeInstanceOf(expected)
匹配 实际值 是 期望值 的实例
`expect(new Error()).toBeInstanceOf(Error);`

### toContain(expected)
匹配 是否包含特定值
```js
expect([1,2,3]).toContain(3);
expect('123456').toContain('3');
```

### toEqual(expected)
匹配 实际值 与 期望值是否相等(深度遍历)
`expect({a:1}).toEqual({a:1});`



### toHaveBeenCalled()
一个 spy(Jasmine类)实例 是否被调用过
`expect(mySpy).toHaveBeenCalled();`

### toHaveBeenCalledTimes(expected)
一个 spy(Jasmine类)实例 是否 被调用过expected次
`expect(mySpy).toHaveBeenCalledTimes(3);`

### toHaveBeenCalledBefore()
一个 spy 是否在 另一个 otherSpy 前调用过
`expect(mySpy).toHaveBeenCalledBefore(otherSpy);`

### toHaveBeenCalledWith()
(作用不是很确定)
一个 spy 是否曾经被以传入调用过特定参数调用过 至少一次
`expect(mySpy).toHaveBeenCalledWith('foo', 'bar', 2);`

### toHaveBeenCalledOnceWith()
(作用不是很确定)
一个 spy 是否曾经被以传入调用过特定参数调用过 正好一次
`expect(mySpy).toHaveBeenCalledOnceWith('foo', 'bar', 2);`


### toHaveClass(expected)
一个DOM是否含有expected 这个class
```js
var el = document.createElement('div');
el.className = 'foo bar baz';
expect(el).toHaveClass('bar');
```

### toHaveSize(expected)
匹配 实际值 的 object keys 数 或 Array.length 数
`expect([1,2]).toHaveSize(2);`

### toMatch(expected)
匹配 正则
```js
expect("my string").toMatch(/string$/); // 这个正则代表以'string'结尾
expect("other string").toMatch("her");
```

### toThrow(expected?)
匹配 一个函数实际值 的throw抛出值 
```js
expect(function() {throw 'a'}).toThrow('a')
```
### toThrowError()



### toBeUndefined()
匹配 `undefined`
`expect(result).toBeUndefined();`
### toBeDefined()
### toBeFalse()
匹配 `false`, 3.5.0版本以上可用
### toBeTrue()
匹配 `true`, 3.5.0版本以上可用
### toBeFalsy()
匹配 `false`, 2.0.0版本以上可用
### toBeTruthy()
匹配 `true`, 2.0.0版本以上可用
### toBeNaN()
### toBeNull()
### toBeNegativeInfinity()
匹配 `-infinity`
### toBePositiveInfinity()
匹配 `infinity`

### toBeGreaterThan(expected)
匹配 实际值 大于 期望值
`expect(result).toBeGreaterThan(3);`
### toBeGreaterThanOrEqual(expected)
### toBeLessThan(expected)
### toBeLessThanOrEqual(expected)

