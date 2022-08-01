---
title: 写了一个通用轮询Hooks
date: 2022-06-07 20:27:21
categories: 经验帖
tags: 
    - React
---

# 写了一个通用轮询Hooks

## 前言

公司技术栈转了react，技术栈也全面看齐了大厂，敲代码的同时也学到了很多

对自己要求也更高了，每天写代码都在想着要 更简洁更优雅

业务上有很多轮询的需求，想要一个通用的轮询hooks，可将任意请求改为轮询

秉着不重复造轮子的理念查了挺久，没有找到非常满意的。

于是自己写了一个，改了几版，感觉挺好用的，记录并分享一下，大佬轻喷

优点:

1.可由 callback函数 返回的Promise状态自动控制轮询，也可由usePolling返回  开始/停止函数控制轮询

2.彻底融入组件生命周期，组件销毁时自动取消轮询，无需调用停止函数

3.使用简单(自卖自夸版)

## 使用方法

```js

import {useState,useEffect} from 'react'

export const Component = () => {

  const mockGetSomething = () => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve({ data: 'something', state: 'OK' })
      }, 1000)
    })
  }

  const preparePolling = () => {
    return mockGetSomething().then((res) => {
      // do some 数据过滤 or 组件状态改变 or 业务操作......
      console.log(res.data)
      return res
    })
      // 多写一个then，根据返回数据判断是否需要继续轮询,true继续轮询,false结束轮询
      .then((res) => {
        return res.state === 'OK' ? true : false
      }).catch((error) => {
        return false
      })
  }

  const [startPolling, endPolling] = usePolling(preparePolling)

  // 适合的时机....
  useEffect(() => {
    startPolling()
  },[])

  return <div> Component test usePolling! </div>
}

```

## 源码

```js
import {useState,useEffect} from 'react'

/**
 * 请求改轮询(组件销毁会自动停止轮询,调用endPolling也可主动停止轮询)
 * @param cb 要进行轮询的请求,cb函数返回true继续轮询,返回false或throw error停止轮询
 * @param time 轮询间隔时间
 * @returns [startPolling, endPolling] 轮询开始函数，轮询停止函数
 */
export function usePolling(cb: () => Promise<boolean>, time = 2000): [startPolling: () => void, endPolling: () => void] {
    // countTime变化引发轮询,startCount(1)开始轮询,startCount(0)终止轮询
    const [countTime, startCount] = useState<number>(0);
    useEffect(() => {
        if (countTime > 0) {
            setTimeout(() => {
                cb()
                    .then((res) => {
                        if (res) startCount(countTime + 1);
                    })
                    .catch(() => {});
            }, time);
        }
    }, [countTime]);
    const startPolling = () => startCount(countTime + 1);
    const endPolling = () => startCount(0);
    return [startPolling, endPolling];
}
```