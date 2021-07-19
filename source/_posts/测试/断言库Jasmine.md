---
title: 断言库Jasmine
date: 2021-07-15 19:27:36
tags: 
    - 测试
---

# 断言库Jasmine


## 三个基础API

### describe函数(全局API)
`describe('',()=>{})`,函数参数内部被称为suit

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

### it函数(全局API)
`it('',()=>{})`,函数参数内部被称为spec

创建 规范(spec)

一个 规范(spec) 可包含多个 期望(expectation)

期望(expectation) 就是 只返回 boolean 的断言(assertion)

只有所有内部 期望(expectation) 都为true 的 规范(spec) 才为成功态

同一个describe中,it函数的执行是 似乎是并行的

### expect函数(全局API)
`expect(actual)`,返回值称为expectation

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

## beforeEach系列函数(全局API)

`beforeAll(() => {})`
在当前describe中的 所有 specs 执行前 执行一次
`afterAll(() => {})`
在一个describe中的 所有 specs 执行后 执行一次

`beforeEach(()=>{})`
在一个describe中的 每一 spec 执行前 执行一次
`afterEach(()=>{})`
在一个describe中的 每一 spec 执行后 执行一次

以上函数在一个describe中可定义多个,执行时
```js
describe("A suite", function() {
  let count = 0
  beforeAll(() => {
    count = 0
  })
  afterAll(() => {
    count = 0
  })

  beforeEach(() => {
    count ++
  });
  afterEach(() => {
    count ++
  })

  it("and can have a negative case", function() {
    expect(count).toBe(1)
    expect(false).not.toBe(true);
  });
});
```

> 如果在调用 beforeEach 以及 it 时使用的不是 箭头函数,
> 则 beforeEach 与对应 it函数共享this,即在beforeEach中给this赋值,可在it中的this拿到,共享变量.
> 注意,此法不同 it 间的 this 不共享(不是同一个this),afterEach同理.

## fail函数(全局API)
`fail('')`,手动使spec(it函数)失败
```js
describe("A spec using the fail function", function() {
  var foo = function(x, callBack) {
    if (x) {
      callBack();
    }
  };

  it("should not call the callBack", function() {
    foo(false, function() {
      fail("Callback has been called");
    });
  });
});
```

## 嵌套调用describe
describe('',()=>{})的函数内 可以嵌套调用describe,

在嵌套调用时 每一个it被调用,会遍历beforeEach树,按顺序从外层至内层,从上往下调用beforeEach函数

```js
describe("describe1", function() {
  let count = ''
  beforeEach(() => {
    count += 'beforeEach1_'
  });

  describe("describe1", function() {
    beforeEach(() => {
      count += 'beforeEach2'
    });
    it('beforeEach in order',() => {
      expect(count).toEqual('beforeEach1_beforeEach2')
    })
  });
});
```

## 禁用describe 和spec (全局API)
使用xdescribe,当前suites(describe函数) 及 里面的specs 在测试时会被跳过,并展示状态为pending(待处理)
```js
xdescribe('pending describe',()=>{
  it('pending spec', () => {
    expect(true).toBeTruthy();
  });
})
```
使用xit,使当前spec 在测试时被跳过,并将状态置为pending
使用it,并不传入function参数,也会直接被置为pending
使用it,并在function参数内调用 pending(''),当前it也会置为pending
```js
describe('describe',()=>{
  xit('pending spec', () => {
    expect(true).toBeTruthy();
  });
  it("can be declared with 'it' but without a function");
  it("can be declared by calling 'pending' in the spec body", () => {
    expect(true).toBe(false);
    pending('this is why it is pending');
  });
})
```

## spies
spy 用于函数监控,可以捕获到 受监控函数的调用 及 调用时传入的参数 的对象

spy的作用域仅限于其定义的describe代码块 或 it代码块,生命周期跟随spec

spy拥有其专用的特殊matcher.

```js
describe("A spy", () => {
  var foo, bar = null;
  beforeEach(() => {
    foo = {
      setBar: (value) => {
        bar = value;
      }
    }
    spyOn(foo, 'setBar');

    foo.setBar(123);
    foo.setBar(456, 'another param');
    
  });

  it("tracks that the spy was called", () => {
    expect(foo.setBar).toHaveBeenCalled();
  });

  it("tracks that the spy was called x times", () => {
    expect(foo.setBar).toHaveBeenCalledTimes(2);
  });

  it("tracks all the arguments of its calls", () => {
    expect(foo.setBar).toHaveBeenCalledWith(123);
    expect(foo.setBar).toHaveBeenCalledWith(456, 'another param');
  });
  it("stops all execution on a function",() => {
    expect(bar).toBeNull();
    // 不知道为何是null
  });
  it("tracks if it was called at all", function() {
    foo.setBar();
    expect(foo.setBar.calls.any()).toEqual(true);
  });
});
```

spy的创建方式有以下三种
`spyOn`: 监控一个对象下的function.(该对象该function得确实存在)
`jasmine.createSpyObj`: 监控一个对象下的多个function.(函数可以不存在)
`jasmine.createSpy`: 监控一个function.(函数可以不存在)
```js
describe("A spy", () => {
  var foo, bar = null;
  beforeEach(() => {
    foo = jasmine.createSpyObj('foo',['setBar','setBar2']);
    foo.setBar(123);
    foo.setBar(456, 'another param');
  });

  it("tracks that the spy was called", () => {
    expect(foo.setBar).toHaveBeenCalled();
  });
});

describe("A spy", () => {
  var foo, bar = null;
  beforeEach(() => {
    foo = jasmine.createSpy('foo');
    foo(123);
    foo(456, 'another param');
  });

  it("tracks that the spy was called", () => {
    expect(foo).toHaveBeenCalled();
  });
});
```
## 模糊期望值
非对称等值测试器
### jasmine.any(Type)
### jasmine.anything()
jasmine.any(Type) 代表具有特定type的任意期望值
jasmine.anything() 代表不为null/undefined的任意期望值
```js
describe("jasmine.any", () => {
  it("matches any value", () => {
    expect({}).toEqual(jasmine.any(Object));
    expect(12).toEqual(jasmine.any(Number));
    expect(1).toEqual(jasmine.anything());
  });

  describe("when used with a spy", () => {
    it("is useful for comparing arguments", () => {
      var foo = jasmine.createSpy('foo');
      foo(12, () => {
        return true;
      });

      expect(foo).toHaveBeenCalledWith(jasmine.any(Number), jasmine.any(Function));
      expect(foo).toHaveBeenCalledWith(12, jasmine.anything());
    });
  });
});
```

### jasmine.objectContaining()
### jasmine.arrayContaining()
### jasmine.stringMatching()

`jasmine.objectContaining(object)`,代表包含该object的键值对的任意期望值
`jasmine.arrayContaining(array)`,代表包含该array的所有元素的任意期望值
`jasmine.stringMatching(regex)`,代表符合该regex正则的任意期望值
```js
describe("jasmine.arrayContaining", function() {
  var foo1 = {a:1,b:2,c:'string'}
  var foo2 = [1, 2, 'string'];
  var foo3 = '12string'

  it("matches arrays with some of the values", function() {
    expect(foo1).toEqual(jasmine.objectContaining({a:1}));
    expect(foo2).toEqual(jasmine.arrayContaining([2,1]));
    expect(foo3).toEqual(jasmine.stringMatching(/string$/));
  });

  it("is useful when comparing arguments", function() {
    var callback1 = jasmine.createSpy('callback1');
    var callback2 = jasmine.createSpy('callback2');
    var callback3 = jasmine.createSpy('callback3');

    callback1(foo1);
    callback2(foo2);
    callback3(foo3);

    expect(callback1).toHaveBeenCalledWith(jasmine.objectContaining({a:1}));
    expect(callback2).toHaveBeenCalledWith(jasmine.arrayContaining(
    [2,1]));
    expect(callback2).toHaveBeenCalledWith(jasmine.arrayContaining(/string$/));
  });
});
```
### asymmetricMatch
用于 自定义非对称等值测试器
```js
describe("custom asymmetry", function() {
    var tester = {
      asymmetricMatch: function(actual) {
        var secondValue = actual.split(',')[1];
        return secondValue === 'bar';
      }
    };

    it("dives in deep", function() {
      expect("foo,bar,baz,quux").toEqual(tester);
    });

    describe("when used with a spy", function() {
      it("is useful for comparing arguments", function() {
        var callback = jasmine.createSpy('callback');

        callback('foo,bar,baz');

        expect(callback).toHaveBeenCalledWith(tester);
      });
    });
  });
});
```

## Clock
用于测试时间相关的代码 的对象
测试时调用`jasmine.clock().install`方法,
`jasmine.clock().tick(number)`阻塞it number秒
测试结束一定要`jasmine.clock().uninstall()`,
```js
describe("Manually ticking the Jasmine Clock", function() {
  var timerCallback;
  beforeEach(function() {
    timerCallback = jasmine.createSpy("timerCallback");
    jasmine.clock().install();
  });
   afterEach(function() {
    jasmine.clock().uninstall();
  });
  it("causes a timeout to be called synchronously", function() {
    setTimeout(function() {
      timerCallback();
    }, 100);

    expect(timerCallback).not.toHaveBeenCalled();

    jasmine.clock().tick(101);

    expect(timerCallback).toHaveBeenCalled();
  });

  it("causes an interval to be called synchronously", function() {
    setInterval(function() {
      timerCallback();
    }, 100);

    expect(timerCallback).not.toHaveBeenCalled();

    jasmine.clock().tick(101);
    expect(timerCallback.calls.count()).toEqual(1);

    jasmine.clock().tick(50);
    expect(timerCallback.calls.count()).toEqual(1);

    jasmine.clock().tick(50);
    expect(timerCallback.calls.count()).toEqual(2);
  });
```

`jasmine.clock().mockDate(Date?)` 构造一个具体时间,不传参则返回当前日期
```js
describe("Mocking the Date object", function(){
    it("mocks the Date object and sets it to a given time", function() {
      var baseTime = new Date(2013, 9, 23);
      jasmine.clock().mockDate(baseTime);

      jasmine.clock().tick(50);
      expect(new Date().getTime()).toEqual(baseTime.getTime() + 50);
    });
  });
});
```

## 异步
传递给 beforeEach,afterEach,beforeAll,afterAll 的函数可以是异步函数,

有三种方式来表明传入的函数是异步的:
1.通过一个可选的回调参数
2.通过返回一个promise
3.通过使用async关键字(需要环境支持)

### using callback

it函数在beforeEach执行done()之前不会执行,

it函数 被传入done()参数后 不会结束 直到done()被执行 或超时报错

所有异步任务默认超时时间为5秒,可通过给it传第三个参数设定超时毫秒数

或在scribe函数中设置`jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000`设定当前describe的全局超时时间

done()被调用代表spec成功 done().fail('')被调用代表spec失败
```js
describe("Using callbacks", () => {
  let value
  beforeEach((done) => {
    setTimeout(() => {
      value = 0;
      done();
    }, 1);
  });

  it("should support async execution of test preparation and expectations", (done) => {
    value++;
    expect(value).toBeGreaterThan(0);
    done();
  });

  describe("A spec using done.fail", () => {
    var foo = (x, callBack1, callBack2) => {
      if (x) {
        setTimeout(callBack1, 0);
      } else {
        setTimeout(callBack2, 0);
      }
    };

    it("should not call the second callBack", (done) => {
      foo(true,
        done,
        () => {
          done.fail("Second callback has been called");
        }
      );
    });
  });
});
```

### using promise
需要浏览器支持promise(chrome肯定支持)

it不会被执行,除非之前的beforeEach已经执行并改变状态

如果beforeEach中被调用了reject 则当前subscribe的所有specs都会fail
```js
describe("Using promises", function() {
  if(typeof Promise === undefined){
    return
  }
  let value = 0
  function soon() {
    return new Promise((resolve,reject) => {
      setTimeout(() => {
        resolve(1)
      }, 1000);
    })
  }
  beforeEach(() => {
    return soon().then(() => {
      value = 0;
    });
  });

  it("should support async execution of test preparation and expectations", () => {
    return soon().then(() => {
      value++;
      expect(value).toBeGreaterThan(0);
    });
  });
});
```

### using async/await
需要浏览器支持async/await(chrome肯定支持)
```js
describe("Using async/await", function () {
  function getAsyncCtor() {
    let func
    try { eval("func = async function(){};"); }
    catch (e) { return null; }
    return Object.getPrototypeOf(func).constructor;
  }
  function browserHasAsyncAwaitSupport() {
    return getAsyncCtor() !== null;
  }
  if (!browserHasAsyncAwaitSupport()) {
    return
  }
  function soon() {
    return new Promise((resolve, reject) => {
      setTimeout(() => resolve(1), 1000);
    })
  }
  let value = 0


  beforeEach(async () => {
    await soon();
    value = 0;
  });
  it("should support async execution of test preparation and expectations", async () => {
    await soon();
    value++;
    expect(value).toBeGreaterThan(0);
  });

  describe("long asynchronous specs", () => {
    beforeEach((done) => done(), 1000);

    it("takes a long time", (done) => {
      setTimeout(() => done(), 9000);
    }, 10000);

    afterEach((done) => done(), 1000);
  });
});
```