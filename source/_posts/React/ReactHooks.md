---
title: ReactHooks
date: 2022-02-24 21:28:09
categories: 技术栈
tags: 
    - React
---

# Hooks

Hooks可以让你在Function组件内使用state及其他react特性。

class组件已经不推荐使用了

## useState

给函数组件添加 重复渲染时可读取的 内部state

参数:   初始state
返回值: 当前状态 和 一个用于更新它的函数。(类似this.setState，但不会合并新旧state)

```js
import React from './react';

function App(){

    const [number,setNumber] = React.useState(0); // 重新渲染的时候返回的number不一样了

    let handleClick = () => setNumber(number+1) // setNumber调用之后会重新渲染，重新渲染的时候
    return (
        <div>
            <p>{number}</p>
            <button onClick={handleClick}>+</button>
        </div>
    )
}
```

__原理__
```js
let hookStates = [];
let hookIndex = 0;
let scheduleUpdate;
function render(vdom, container) {
    mount(vdom,container);
    scheduleUpdate = ()=>{
        hookIndex = 0;
        compareTwoVdom(container,vdom,vdom);
    }
}
export function useState(initialState){
    hookStates[hookIndex] = hookStates[hookIndex]||initialState;
    let currentIndex = hookIndex; 
    function setState(newState){
        let newState = typeof action === 'function' ? action(oldState) : action;
        hookStates[currentIndex] = newState;
        scheduleUpdate();
    }
    return [hookStates[hookIndex++],setState];
}
```
## useCallback + useMemo

## useReducer

## useContext

## useEffect

## useLayoutEffect+useRef

## forwardRef + useImperativeHandle