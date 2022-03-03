---
title: ReactHooks
date: 2022-02-24 21:28:09
categories: 技术栈
tags: 
    - React
---

# Hooks

Hooks可以让你在Function组件内使用state及其他react特性,如私有属性 生命周期函数。

class组件已经不推荐使用了

[大佬的reactHooks源码解析](https://mp.weixin.qq.com/s/4-JYjizitK-VbRk5CQqlKA)
## useState

给函数组件添加 重复渲染时可读取的 内部state

参数:   初始state
返回值: 当前状态 和 一个用于更新它的函数。(类似this.setState，但不会合并新旧state)

```js
import React from './react';

function App(){
    // 初始化的时候number就是0,后续更新渲染,useState返回的就是setNumber改变后的值
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

一个 __全局数组__，一个 __全局下标__，初始为0.

每次 useState，数据都放在 __全局下标__ 对应的 全局数组位置中， 最后 __全局下标__ +1.

第一个 useState 的数据放在 0的位置 ,第二个useState 放在 1的位置.

更新渲染的时候,再次将 __全局下标__ 置为0,这样 第一个 useState执行 又会读取到 0位置的数据,并返回.

而 第二个 useState 执行时,又读到了 1位置的数据.

__这也是为什么react 不允许 有条件的调用useState,必须保证每次useState顺序相同__


每次 useState，返回的函数 都会 保存 __当前下标__, 调用该函数的时候,修改当前下标对应的数据,再进行更新.

__useState只会覆盖原值，不会合并原值__

```js
let hookStates = []; // 一个全局对象存放了所有函数组件的 useState
let hookIndex = 0;
let scheduleUpdate;
function render(vdom, container) {
    mount(vdom,container);
    scheduleUpdate = ()=>{
        hookIndex = 0; // 把索引置为0，再次渲染，按照渲染顺序，每个函数组件又会从useState拿到自己的最新state
        compareTwoVdom(container,vdom,vdom); // 同一个vdom进行比较，但是其子节点state已不一样
    }
}
export function useState(initialState){
    // 初次渲染的时候，返回初始值，和 setState。再次渲染函数组件时 还会调用useState，返回的就是 最新state
    hookStates[hookIndex] = hookStates[hookIndex]||initialState;
    let currentIndex = hookIndex;
    function setState(newState){
        let newState = typeof action === 'function' ? action(oldState) : action;
        hookStates[currentIndex] = newState;
        scheduleUpdate();
    }
    return [hookStates[hookIndex++],setState];
    // 每存放完一个state，hookIndex+1，按渲染顺序放好 每个函数组件的state
    // 更新渲染的时候每个函数组件都会 再次依次按顺序调用 useState，hookIndex按老顺序++
    // 每个函数组件都会拿到自己那份 最新的hookStates[hookIndex]值 并返回
}
```

useState返回的函数setState调用更新 compareTwoVdom,然后 updateChildren,会比较每个child的props是否有变更

而 假设你的state是一个对象,修改的又只是对象下的属性的话, 在 updateChildren 内会认为该对象没有变化,而可能不更新UI

__修改对象下的某个属性,是不会被react监控到并更新渲染UI的__

```jsx
// false
const onClick = ()=>{
    user.name='marry';
    setUser(user);
}
```

这里是怕对象没改变导致UI不更新，而下面两个是怕对象改变导致UI更新

## useCallback + useMemo

把内联回调函数及依赖项数组作为参数传入 useCallback，它将返回该回调函数的 memoized 版本，依赖项改变时返回新对象。
把创建函数和依赖项数组作为参数传入 useMemo，它仅会在某个依赖项改变时才重新计算 memoized 值。这种优化有助于避免在每次渲染时都进行高开销的计算

```js
import React from 'react';

let  Child = ({data,handleClick})=>{
  console.log('Child render');
  return (
     <button onClick={handleClick}>{data.number}</button>
  )
}
Child = React.memo(Child);

function App(){
  const[name,setName] = React.useState('lzy');
  const[number,setNumber]=React.useState(0);

  let data = React.useMemo(()=>({number}),[number]); // []数组内的数据变动时,才重新调用函数,返回 新对象
  let handleClick = React.useCallback(()=> setNumber(number+1),[number]);// []数组内的数据变动时,返回 新函数
//   let data = { data }
//   let handleClick = () => setNumber(number + 1)
// 如果按照注释里的写法,输入框的值,修改时,再次渲染函数组件,又会生成新的data,新的handleClick
// react 在 updateChildren 的时候,就判定Child的组件的props发生了修改,这样就会重新渲染Child组件
// 而事实上,name属性的修改,并没有涉及Child组件的props

// 而 用上了 useMemo,useCallback 就可以保证 设定的依赖值没变时,返回的还是 第一次创建的对象.
  return (
    <div>
      <input type="text" value={name} onChange={event=>setName(event.target.value)}/>
      <Child data={data} handleClick={handleClick}/>
    </div>
  )
}
```

__原理__

```js
export  function useMemo(factory,deps){
    if(hookStates[hookIndex]){ // 如果以前有,就进行比较
        let [lastMemo,lastDeps] = hookStates[hookIndex];
        let same = deps.every((item,index)=>item === lastDeps[index]);
        if(same){ // 数组中设定的依赖值每个都没变,就返回以前的对象
            hookIndex++;
            return lastMemo;
        }else{ // 有依赖项变了,就返回新的
            let newMemo = factory();
            hookStates[hookIndex++]=[newMemo,deps];
            return newMemo;
        }
    } else { // 如果没有,就保存,并返回初始值
      let newMemo = factory();
      hookStates[hookIndex++]=[newMemo,deps];
      return newMemo;
    }
}
```

## useReducer

## useContext

## useEffect

## useLayoutEffect+useRef

## forwardRef + useImperativeHandle