---
title: React移除URL中的searchParams
date: 2024-10-30 10:11:45
categories: 经验帖
tags: 
    - React
---

## 解决方案

ReactRouter V6

```ts
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const YourComponent = () => {
    const location = useLocation();
    const navigate = useNavigate();

    // 删除指定searchParams
    const removeSearchParam = (param) => {
        const searchParams = new URLSearchParams(location.search);
        searchParams.delete(param);
        navigate({ search: searchParams.toString() }, { replace: true });
    };

    // 删除所有searchParams
    const clearSearchParams = () => {
        const searchParams = new URLSearchParams(location.search);
        searchParams.forEach((_, name) => searchParams.delete(name));
        navigate({ search: searchParams.toString() }, { replace: true });
    };

    return (
        <div>
            <button onClick={() => removeSearchParam('yourParam')}>
                Remove Search Param
            </button>
        </div>
    );
};

export default YourComponent;
```

ReactRouter V5 需要将 navigate 换成 history

```ts
// const navigate = useNavigate();
const history = useHistory();

// navigate({ search: searchParams.toString() }, { replace: true });
history.replace({ search: searchParams.toString() });
```

## URLSearchParams

常用属性

```ts
const params = new URLSearchParams('foo=1&bar=2&foo=3');

// 插入一个指定的键/值对作为新的查询参数。
params.append('baz', '4'); // foo=1&bar=2&foo=3&baz=4

// 删除参数
params.delete('bar'); // foo=1&foo=3&baz=4

// 获取参数的第一个值。
const fooValue = params.get('foo'); // '1'，获取第一个 'foo' 的值

// 获取参数的所有值
const allFooValues = params.getAll('foo'); // ['1', '3']

// 检查参数是否存在
const hasBaz = params.has('baz'); // true

// 设置参数
params.set('foo', '10'); // foo=10&baz=4

// 返回查询参数组成的字符串，可直接使用在 URL 上
const queryString = params.toString(); // 'foo=10&foo=3&baz=4'

// 遍历参数，和Array中的forEach不是同一个
params.forEach((value, name) => {
    console.log(`${name}: ${value}`);
});
```

## navigate

navigate 函数，useNavigate 返回的函数

主要包含以下入参:

to：字符串或对象，要导航到的目标URL

```ts
navigate('/home'); // 导航到主页
navigate({ pathname: '/profile', search: '?id=123' }); // 导航到带查询参数的个人资料页
```

options(可选)：对象
options.replace：指示是否替换当前的历史记录条目，而不是添加新条目。默认值为 false
options.state：传递的状态对象，可以在目标路由中通过 useLocation 访问

```ts
// 跳转并发送state数据
const MyComponent = () => {
    
    const navigate = useNavigate();

    const goToProfile = () => {
        navigate('/component2', { state: { from: 'component1' } });
    };

    return (
        <button onClick={goToProfile}>Go to MyComponent2</button>
    );
};
```

```ts
// 获取history内存中的state数据
const MyComponent2 = () => {
    const location = useLocation();

    useEffect(() => {
        console.log('state', location.state);
    }, [])

    return <div>MyComponent2</div>;
};

```

## location

location 对象，useLocation 返回的对象

包含以下主要属性:

pathname：字符串，表示当前的路径名。例如，/about。

search：字符串，表示查询字符串，包括问号（?）。例如，?foo=1&bar=2。

hash：字符串，表示 URL 的 hash 部分，包括井号（#）。例如，#section1。

state：包含通过 Link 或 navigate 函数传递的状态。如果没有传递状态，则为 undefined。
