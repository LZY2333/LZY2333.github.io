---
title: ReactHooks
date: 2022-02-24 21:28:09
categories: 技术栈
tags: 
    - React
---

# Hooks

__什么是hooks__

Hooks直译为钩子，通常指，系统运行到某一时期时，会调用被注册到该时机的回调函数

如: `window.onload` 或 `addEventListener`注册的回调函数

react中的hooks 以'use' 开头,让函数式组件拥有了 生命周期、状态管理、逻辑复用等

所有作为组件需要具备的能力，避开了class式的写法。

__hooks规范__

`use` + 大写字母的单词就是hooks,只能在react函数组件中调用hook,

只能在最顶层调用hooks,不能在 条件语句 / 嵌套函数 调用

__为什么需要hooks__


[大佬的reactHooks源码解析，存一下回头看](https://mp.weixin.qq.com/s/4-JYjizitK-VbRk5CQqlKA)
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

__简单实现__(实际上是用了fiber，本质上是链表，非数组储存，且更复杂)

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
注意,`dependencies` 是潜比较
```js
export  function useMemo(factory,dependencies){
    if(hookStates[hookIndex]){ // 如果以前有,就进行比较
        let [lastMemo,lastDeps] = hookStates[hookIndex];
        let same = dependencies.every((item,index)=>item === lastDeps[index]);
        if(same){ // 数组中设定的依赖值每个都没变,就返回以前的对象
            hookIndex++;
            return lastMemo;
        }else{ // 有依赖项变了,就返回新的
            let newMemo = factory();
            hookStates[hookIndex++]=[newMemo,dependencies];
            return newMemo;
        }
    } else { // 如果没有,就保存,并返回初始值
      let newMemo = factory();
      hookStates[hookIndex++]=[newMemo,dependencies];
      return newMemo;
    }
}
```

## useReducer

`useState`继承自`useReducer`,

接收一个 `reducer:(state, action) => newState`,返回`[state, dispatch]`

在调用`dispatch(action)`传入`action`,会传给 `reducer`,`reducer` 根据`action` 处理 `oldState`

与`useState`不同,非直接覆盖`oldState`,

可通过`reducer`事先设定处理方式,可获取到`oldState`,并根据`action`处理更多种更复杂的情况,
```js
function reducer(state={number:0}, action) {
  switch (action.type) {
    case 'ADD':
      return {number: state.number + 1};
    case 'MINUS':
      return {number: state.number - 1};
    default:
      return state;
  }
}

function Counter(){
    const [state, dispatch] = React.useReducer(reducer,{number:0});
    return (
        <div>
          Count: {state.number}
          <button onClick={() => dispatch({type: 'ADD'})}>+</button>
          <button onClick={() => dispatch({type: 'MINUS'})}>-</button>
        </div>
    )
}
```

__简单实现原理__
```js
export function useReducer(reducer, initialState) {
    hookStates[hookIndex] = hookStates[hookIndex] || initialState;
    let currentIndex = hookIndex;
    function dispatch(action) {
        //1.获取老状态
        let oldState = hookStates[currentIndex];
        //如果有reducer就使用reducer计算新状态
        if (reducer) {
            let newState = reducer(oldState, action); // 给reducer传入action
            hookStates[currentIndex] = newState;
        } else {
            //判断action是不是函数，如果是传入老状态，计算新状态
            let newState = typeof action === 'function' ? action(oldState) : action;
            hookStates[currentIndex] = newState;
        }
        scheduleUpdate();
    }
    return [hookStates[hookIndex++], dispatch];
}
```

## useContext

`useContext(MyContext)` 相当于 class 组件中的 `static contextType = MyContext` 或者 `<MyContext.Consumer>`

接收一个`context`对象,读取订阅 `context`,需要在上层组件树中使用 `<MyContext.Provider value={}>` 来为下层组件提供 context

```js
const CounterContext = React.createContext();

function reducer(state, action) {
  switch (action.type) {
    case 'add':
      return {number: state.number + 1};
    case 'minus':
      return {number: state.number - 1};
    default:
      return state;
  }
}
function Counter(){
  let {state,dispatch} = React.useContext(CounterContext);
  return (
      <div>
        <p>{state.number}</p>
        <button onClick={() => dispatch({type: 'add'})}>+</button>
        <button onClick={() => dispatch({type: 'minus'})}>-</button>
      </div>
  )
}
function App(){
    const [state, dispatch] = React.useReducer(reducer, {number:0});
    return (
        <CounterContext.Provider value={{state,dispatch}}>
          <Counter/>
        </CounterContext.Provider>
    )
}
```

__简单实现__
```js
function useContext(context){
    return context._currentValue;
}
```

## useEffect
`useEffect` 操作副作用,其接收的函数会在组件渲染完成后执行.

在函数组件主体内（这里指在 React 渲染阶段）改变 DOM、添加订阅、设置定时器、记录日志

以及执行其他包含副作用的操作都是不被允许的，因为这可能会产生莫名其妙的 bug 并破坏 UI 的一致性.

```js
function Counter() {
    const [number, setNumber] = React.useState(0);
    React.useEffect(() => {
        console.log('开启一个新的定时器')
        const $timer = setInterval(() => {
            setNumber(number => number + 1);
        }, 1000);
        return () => {
            console.log('销毁老的定时器');
            clearInterval($timer);
        }
    });
    return (
        <p>{number}</p>
    )
}
```

__简单实现__
注意,`dependencies` 是浅比较
```js
export function useEffect(callback,dependencies){
    let currentIndex = hookIndex;
    if(hookStates[hookIndex]){
        let [destroy,lastDeps] = hookStates[hookIndex];
        let same = dependencies&&dependencies.every((item,index)=>item === lastDeps[index]);
        if(same){
            hookIndex++;
        }else{
            destroy&&destroy();
            setTimeout(()=>{
                hookStates[currentIndex]=[callback(),dependencies];
            });
            hookIndex++;
        }
    }else{
        setTimeout(()=>{
            hookStates[currentIndex]=[callback(),dependencies];
        });
        hookIndex++;
    }
}
```

## useLayoutEffect + useRef

`useEffect` 函数会放入宏任务队列,

`useLayoutEffect` 函数会放入微任务队列,

浏览器绘制属于宏任务,`useLayoutEffect`会在能拿到DOM,但浏览器未开始绘制时执行

使用
```js
const Animate = ()=>{
    const ref = React.useRef();
    React.useLayoutEffect(() => {
      ref.current.style.transform = `translate(500px)`;//TODO
      ref.current.style.transition = `all 500ms`;
    });
    let style = {
      width: '100px',
      height: '100px',
      borderRadius: '50%',
      backgroundColor: 'red'
    }
    return (
      <div style={style} ref={ref}></div>
    )
}
```

`useRef`只是创建了一个对象,然后将该对象保存在了链表里以后能拿到而已

reactDOM 在执行渲染时会给这个对象绑定上该组件对应的真实DOM.

```js
export function useLayoutEffect(callback,dependencies){
    let currentIndex = hookIndex;
    if(hookStates[hookIndex]){ 
        let [destroy,lastDeps] = hookStates[hookIndex];
        let same = dependencies&&dependencies.every((item,index)=>item === lastDeps[index]);
        if(same){
            hookIndex++;
        }else{
            destroy&&destroy();
            queueMicrotask(()=>{
                hookStates[currentIndex]=[callback(),dependencies];
            });
            hookIndex++
        }
    }else{ // 如果原本没有,就存起来
        queueMicrotask(()=>{ // 存的时候,按微任务的顺序存,拿的时候也按微任务的顺序拿.
            hookStates[currentIndex]=[callback(),dependencies];
        });
        hookIndex++;
    }
}
export function useRef(initialState) {
    hookStates[hookIndex] =  hookStates[hookIndex] || { current: initialState };
    return hookStates[hookIndex++];
}
```

## forwardRef + useImperativeHandle

`useRef`: 获取原生DOM,或组件
`forwardRef`: 转发父组件的ref,子组件须接受props和ref作为参数,子组件可将ref挂在到自身某个dom元素上
`useImperativeHandle`:在函数式组件中，用于定义暴露给父组件的ref方法。

```js
function Child(props, ref) {
    const inputRef = React.useRef();
    React.useImperativeHandle(ref, () => (
        {
            focus() {
                inputRef.current.focus();
            }
        }
    ));
    return (
        <input type="text" ref={inputRef} />
    )
}
const ForwardChild = React.forwardRef(Child);
function Parent() {
    let [number, setNumber] = React.useState(0);
    const inputRef = React.useRef();
    function getFocus() {
        console.log(inputRef.current);
        inputRef.current.value = 'focus'; // 代表输入框DOM
        inputRef.current.focus();
    }
    return (
        <div>
            <ForwardChild ref={inputRef} />
            <button onClick={getFocus}>获得焦点</button>
            <p>{number}</p>
            <button onClick={() => {
                debugger
                setNumber( number + 1)
            }}>+</button>
        </div>
    )
}
```

## 延迟场景产生的闭包问题

函数在`useEffect`内定义,且用到了组件内的变量,然后延迟被调用,

此种情况下,产生了闭包,变量在当前宏任务中的修改,不会再函数执行时体现。

回头补例子。