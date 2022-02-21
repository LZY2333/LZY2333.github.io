---
title: React杂记
date: 2021-11-19 05:39:59
categories: 技术栈
tags: 
    - React
---

# React杂记

## 新版本编译后不使用`React.createElement`创建元素

[JSX_runtime实现](http://www.zhufengpeixun.com/strong/html/123.jsx-runtime.html)

新版本React11开始,babel转义后 已经不用`React.createElement`来创建React元素了.

新的方式是`import {jsx as __jsx} from "react/jsx-runtime"`

然后JSX源代码编译为 `__jsx("h1",{id:"title"},"title")`,

老版本是`React.createElement("h1",{id:"title"},"title")`,

这样的好处是 如果 jsx代码里其实全是js,就不需要react的参与,

此时老模式,依旧需要引入`import React from 'react'`,因为编译完后需要`React.`.

`"build": "cross-env DISABLE_NEW_JSX_TRANSFORM=true react-scripts build"` 

禁用新的转换器,用老的方式来编译

## 编译是什么时候发生的

JSX经过 webpack打包,期间经过babel编译,编译成纯粹的JS,就是所谓的打包后的文件.

用户访问时,返回HTML页面,HTML引用打包完的JS文件,JS执行,形成虚拟DOM(React元素),渲染成页面.

webpack编译时,检测到JSX,就用babel,将源代码中的JSX部分进行了替换,

`babel`将 JSX 编译为 编译后的纯粹的JS代码(产生了`React.creatElement`)时,用到了AST语法树.

浏览器执行到赋值语句时,替换后的`React.createElement(type, config, children)`执行,

返回一个对象 也就是 虚拟DOM,

`ReactDOM.render(reactElement,真实dom选择器容器)`渲染成页面.

__render做了什么__

根据createElement创建的vdom内的type属性,

调用document.createElement(type),创建真实DOM,

根据vdom内的 其他属性(如className style),决定 挂载真实DOM上的属性,自定义属性(如react的ref)继续呆在vdom上

同时会将真实DOM挂载到vdom上(方便以后(如diff后)获取真实节点),最后将真实DOM挂载到真实父节点上,

内部会对vdom的,children属性嵌套调用render方法,挂载到当前节点.

children属性在babel本地编译时决定,在createElement调用时 与 config内的大部分属性,共同放在vdom的props下.

__React组件必须首字母大写,React是通过首字母是否大写判断是否是自定义组件,小写就是原生标签了__


## 组件的数据来源有两个

一个是父组件的属性,组件内通过`this.props`获取,属性是父组件的不能修改,

一个是自身的状态, state对象 自己内部初始化的,唯一的修改方法是`setState`


## setState 为异步更新，在下一行打印
```js
// 假设 this.state.number 初始为0
this.setState({number:this.state.number+1});
console.log(this.state); // 打印 0，而不是期望的1，但页面展示为1
```
因为 `setState` 是异步执行的，console的执行 先于 state的修改

在下一个事件循环 才执行了 `this.state.number+1` 并渲染页面


## 想基于当前同步任务中上一次state修改,来做这次的state修改

想基于同一次同步任务内上次state修改后的数据,来完成这次state的修改.
```js
this.setState({number:this.state.number+1});
console.log(this.state);
this.setState({number:this.state.number+1});
console.log(this.state);
// 期望state为2,实际展示结果为1,也就是说虽然我调用了两次number+1,但两次都是基于0加了1
```

正确的写法,`this.setState(state=>{number:this.state.number+1})`(使用函数,而非对象)

内部原理:计算最新state状态时,当检测到 当前这次`setState`调用 的参数为函数,

调用该函数,并传入 最新state(已经过同次同步任务之前setState的修改后 并与oldstate 合并了的state),

返回 当前这次`setState`调用 产生的 state作为 最新state 

> 或者 setState 后强制更新.也是同样效果

> 注意,即使用函数的方法,此次两次console也均为0,因为无论如何,本质上state的修改都异步,console都先于state的修改执行.

## setState可能异步可能同步

所以最好不要依赖 this.state的值来进行下一步更新

```js
  handleClick = (event) => {
    //在handleClick方法中执行是批量的, 是异步的，会在方法执行结束之后再更新 state
    this.setState({ number: this.state.number + 1 });
    console.log(this.state.number);
    this.setState({ number: this.state.number + 1 });
    console.log(this.state.number);
    setTimeout(() => {
      //在setTimeout里的更新是同步的,下一次会基于上一次,就和上一问用函数一样.
      this.setState({ number: this.state.number + 1 });
      console.log(this.state.number);
      this.setState({ number: this.state.number + 1 });
      console.log(this.state.number);
    });
  }
  // 输出 0 0 2 3
```
发现了两个问题: 
1. 第一次 第二次 两次 只加了1 (原因看上一问)(如果第一第二次改成函数执行,则此处输出0034)
2. setTimeout 内的 setState是同步更新,调用一次马上更新state数据,console拿到的是最新state.

特性:
react能管到的更新,都异步了,因为异步性能更好,不用每次修改都更新,而是一次同步统一更新

react管不到的更新,都同步了,每次都更新state,因为这样更保险,不容易出错.

什么是管不到的更新? 就是setTimeout这种宏任务,非本次同步执行的.

__实现原理__

更新队列中存在一个标识,是否批量更新(异步更新).

在当次同步更新的开头,标识置为true,当次同步更新结束,标识置为false.

当标识为true,setState的修改将被push进更新队列,再异步统一修改state,一次性更新.

当标识为false,每次setState都会立刻修改state,并立刻更新视图.

很显然,宏任务在同步更新结束后才执行,此时标识为false.


`setState` 调用 `updater.addState`,每个类组件一个updater管理自己的更新

每个updater有一个数组`pendingStates`储存每次更新的`partialState`,

`addState`把每次的state修改`partialState`放进对象,触发`emitUpdate`,

`emitUpdate`根据`isBatchingUpdate`判断立即触发更新,还是异步批量触发更新

1. 如果立即更新,则调用该updater的`updateComponent`方法,遍历所有`partialState`,
    
  计算最新state,替换实例oldState,调用实例`classInstance.forceUpdate()`,
  
  `render`新虚拟DOM,老虚拟DOM对比,创建真实DOM并替换老真实DOM,更新完成

2. 如果是异步批量更新,则该updater会把自己放入`updateQueue`,后续调用统一处理

## React的更新是可能是 异步 可能是 同步(旧,有时间与上一问合并)

__React会 异步批量更新 组件内的state__

组件内调用`setState`修改某数据后,在下面立即console该属性,发现属性未发生改变

这是因为同一次同步任务内所有的数据修改`setState`,会记录在`pendingState`队列

最后在该同步任务执行完毕时,下一个微任务队列内执行数据的更新.

__React对于非自己的提供的接口产生的更新是 同步立即更新 的__

React 在自己能够管理 的范围内比如 事件函数 生命周期函数 内产生的 更新都是 异步批量更新的,

能够管理的范围外的 更新,例如 setTimeout 原生事件 内的更新 都是同步立即更新的.

原理是: 是否批量更新标记isBatchingUpdate,在同步任务开始时置为true,批量更新结束时置为false.

setState被调用时,发现 isBatchingUpdate 为false 就立即更新数据.

## React类组件更新原理

1. 初次渲染的时候已经在页面上放置了一个DIV

2. 更新的时候用新的state,重新render返回新的虚拟DOM,

3. 虚拟DOM再次生产新的真实DOM

4. 新的真实DOM替换老的DIV

## react中的style 得写成 obj的格式

```js
 <h1 style={{ color: 'red' }}> </h1>
```
因为在处理props的时候读取到props 为 style时，会直接视其为 obj进行覆盖旧属性

```js
/**
 * 更新真实DOM的属性
 * @param {*} dom 
 * @param {*} oldProps 
 * @param {*} newProps 
 */
function updateProps(dom, oldProps = {}, newProps = {}) {
    for (let key in newProps) {
        //属性中的children属性不在此处处理
        if (key === 'children') {
            continue;
        } else if (key === 'style') {
            let styleObj = newProps[key]; // 拿到style对象
            for (let attr in styleObj) { // 循环style对象中的每个属性
                dom.style[attr] = styleObj[attr];
            }
        } else {
            dom[key] = newProps[key];//dom.className = 'title ' dom.id = 'title'
        }
    }
    //如果属性在老的属性里，新的属性没有，需要从真实DOM中删除
    for (let key in oldProps) {
        if (!newProps.hasOwnProperty(key)) {
            dom[key] = null;
        }
    }
}
```

## 函数组件内的jsx在编译阶段也已经被改变

```js
function FunctionComponent(props) {
  return ( // 【编译阶段】 已经变成了 return React.createElement()
    <h1 className="title" style={{ color: 'red' }}>
      <span>{props.name}</span>
      <span>{props.children}</span>
    </h1>
  ) //FunctionComponent  【执行阶段】 执行React.createElement()执行的返回结果 也就是虚拟DOM
} // 相当于虚拟DOM工厂
// 编译阶段已经变成了 React.createElement(FunctionComponent, { name: "hello" }, "world");
let element = <FunctionComponent name="hello">world</FunctionComponent>
```
## react不推荐组件继承组件



## 类组件 的prop只 初始化时用到，后续setState 更新视图与props无关

__props唯一用到的地方,实例化 类组件时__
```js
// 检测到类组件时调用，作用是调用 实例化类，调用其render()获取到虚拟DOM，再createDOM()得到真实DOM
function mountClassComponent(vdom) {
    //获取函数本身
    let { type: ClassComponent, props } = vdom;
    //把属性对象传递给函数执行，返回要渲染的虚拟DOM
    let classInstance = new ClassComponent(props); //************此处用到了props
    let renderVdom = classInstance.render();
    //把上一次render渲染得到的虚拟DOM
    vdom.oldRenderVdom = classInstance.oldRenderVdom = renderVdom;
    return createDOM(renderVdom);
}

// 顺便举例一个类组件
class Counter extends React.Component {
  constructor(props) {
    super(props);
    //构建函数是唯一能直接给state直接赋值的地方
    this.state = { number: 0, age: 13 };
  }
  handleClick = (amount) => {
    this.setState({ number: this.state.number + amount }, () => {
       console.log('callback', this.state);
     });
    console.log(this.state);
  }
  render() {
    return (
      <div>
        <p>number:{this.state.number}</p>
        <button onClick={() => this.handleClick(5)}>+</button>
      </div>
    )
  }
}
```

```js
//setState的最后一步 更新视图
forceUpdate() {
    //获取此组件上一次render渲染出来的虚拟DOM
    let oldRenderVdom = this.oldRenderVdom;
    //获取虚拟DOM对应的真实DOM oldRenderVdom.dom
    let oldDOM = findDOM(oldRenderVdom);
    //重新执行render得到新的虚拟DOM
    let newRenderVdom = this.render();
    //把老的虚拟DOM和新的虚拟DOM进行对比，得对比得到的差异更新到真实DOM
    compareTwoVdom(oldDOM.parentNode, oldRenderVdom, newRenderVdom);
    this.oldRenderVdom = newRenderVdom;
}
```
可以看到 直接this.render()，无props介入。

__换句话说 类组件的 props只实例化时用到，直接给state赋值，后续组件属性修改与props无关__

也仅此一个途径直接给state赋值，后续setState

## React中HTML原生组件才会有真实DOM

React的实现中 vdom.dom 会指向其渲染形成的真实DOM,

如果 存在 函数组件/类组件 实现是直接return一个 函数组件/类组件

则此层级不存在真实DOM,其vdom.DOM 为null.

所以,如果此类 函数组件/类组件 ref属性 实际指向其第一个为真实DOM的子节点.

`findDOM` 通过 `vdom.oldRenderVdom` 获取到 其构造函数执行返回的 虚拟节点

也即 子虚拟节点,查找 子vdom 是否有真实DOM挂载,直到找到为止

__DOM数和组件数并非一一对应,甚至DOM数可能少于组件数__

```js
export function findDOM(vdom){
   if(!vdom)return null;
   if(vdom.dom){//如果它身上有dom属性,那说明这个vdom是一个原生组件的虚拟DOM.它会有dom属生指向真实DOM,直接返回
    return vdom.dom;;
   }else{
      return findDOM(vdom.oldRenderVdom);
   }
}
```

## 函数组件 类组件 的vdom 没有挂载真实dom

一定要区分好,【编译阶段】 和 【执行阶段】

首先要明确，【编译阶段】 jsx变成了下面这样
```js
class ClassComponent extends extends React.Component  {
    constructor() {
        super();
        this.name = 2;
    }
    render() {
        return <h1>hello</h1>; // 相当于下面
        // return React.createElement('h1', null, 'hello');
    }
}

let element = <ClassComponent /> // 编译完相当于下面
//let element = React.createElement(ClassComponent,{},undefined); 
//React.createElement(【变量】ClassComponent，【props】,【children】)

ReactDOM.render(
  element,
  document.getElementById('root')
);
```
【执行阶段】

执行到变量`element`时，`React.createElement`执行返回vdom,`element`被赋值vdom对象

此 第一层vdom 就是 函数组件/类组件vdom,

当执行到`render`,发现`element` 的type为 类组件,

便会拿到 `ClassComponent`,`new ClassComponent(props)`实例化,再调用其render方法,获得第二个vdom

如果发现`element` 的type为 函数组件,则拿到该函数执行,获得第二个vdom

拿到第二个vdom之后,再次调用render方法,渲染真实dom.

__所以 函数组件/类组件vdom本身并没有挂载 真实dom__

__而原生标签产生的vdom是会挂载真实DOM的__

> 注意 ClassComponent作为变量传入了createElement,直接拿到传入的ClassComponent就能new,不需要去哪找.
> 函数组件同理
```js
/**
 * 把虚拟DOM转成真实DOM
 * @param {*} vdom 虚拟DOM
 */
function createDOM(vdom) {
    let { type, props } = vdom;
    let dom;//真实DOM
    if (typeof type === 'function') { // 如果是组件vdom,就调用相应处理
        if (type.isReactComponent) { // 下面两个函数也是返回真实DOM
            return mountClassComponent(vdom);
        } else {
            return mountFunctionComponent(vdom);
        }
    } else { // 如果是原生标签,直接创建真实DOM
        dom = document.createElement(type);
    }
    //让vdom的dom属性指定它创建出来的真实DOM
    vdom.dom = dom;
    return dom; // 返回真实DOM,给mount()函数,mount函数负责把真实DOM进行挂载
}

// *调用render,拿到第二层vdom后,又循环调用了createDOM,给第二层vdom进行转换成真实dom,再返回
function mountClassComponent(vdom) {
    //获取函数本身
    let { type: ClassComponent, props } = vdom;
    //把属性对象传递给函数执行，返回要渲染的虚拟DOM
    let classInstance = new ClassComponent(props);
    let renderVdom = classInstance.render();
    //把上一次render渲染得到的虚拟DOM
    vdom.oldRenderVdom = classInstance.oldRenderVdom = renderVdom;
    return createDOM(renderVdom);
}
function mountFunctionComponent(vdom) {
    //获取函数本身
    let { type, props } = vdom;
    //把属性对象传递给函数执行，返回要渲染的虚拟DOM
    let renderVdom = type(props);
    //vdom.老的要渲染的虚拟DOM=renderVdom,方便后面的DOM
    vdom.oldRenderVdom = renderVdom;
    return createDOM(renderVdom);
}
```
额外注意, 组件的 vdom虽然没挂载真实DOM,但是挂载了 oldRenderVdom,也就是第二层vdom.

而第二层vdom内部挂载了 自己对应的 真实DOM(组件套组件另算)

## React绑定事件写法与原生不同

1. 属性不是小写而是驼峰命名

2. 值不是字符串而是函数的引用,`onClick={this.handleClick}`

## React 的事件都绑定在容器上,而非当前DOM上

__组件的事件处理原理__

1. React事件绑定时,并没有将事件绑定在 当前DOM,而是绑定在 容器div#root

2. 事件绑定在 容器上,事件处理函数 还是保存在 当前DOM.store中
 
3. click 当前DOM,必然事件冒泡,触发 容器div#root 绑定的click事件,

4. 容器调用其 统一事件处理函数 拿到event.target/type,调用 真正的相应 事件处理函数
   
   (并传入react 修改后加了点属性的的event,如果要用的话)

5. target就是 当前DOM,挂载了 事件处理函数,type 就是事件类型,据此调用 当前DOM 上的 事件处理函数

> 这种做法叫切片编程，react可以在事件处理时做一些统一的事情，比如 处理浏览器兼容性

> 15的事件都是代理到document,17之后都代理给了容器 div#root
> 因为React希望一个页面可以运行多个react版本 

__容器统一事件处理函数会让当前 事件处理 结束后组件的状态 异步批量更新__

1. 容器统一事件处理函数的步骤如下,

2. 首先,updateQueue.isBatchingUpdate=true;// 事件函数执行前先设置批量更新模式为true

3. 这样当前如果有同步任务的setState 就会作为 异步批量更新的一部分,放入 updateQueue 的待更新队列,

   isBatchingUpdate === false,setState会直接同步触发 组件的state更新

4. 此时调用 当前DOM 上的 事件处理函数,如果里面有 setState 就按上面的逻辑来

6. 最后 isBatchingUpdate = false, updateQueue.batchUpdate()启动批量更新

__为什么react要给事件处理函数接收的event加点属性__

1. 兼容多种浏览器,用到时候不用考虑游览器差异

__其他__

1. 你不能通过返回 false 的方式阻止事件默认行为.你必须显式的使用preventDefault

2. 从17以前,事件都是 绑定在document上,委托给document.

3. 同一类型事件,容器只需绑定一次,因为就是注册事件,之后触发target上的 事件处理函数就行.

## 类组件 更新功能 源码中各个函数的作用

```js
export let updateQueue = { // ---------------------------------储存多个updater批量更新
    batchUpdate() {
      // 绑定在root上的 事件处理函数dispatchEvent,监听到一次事件
      // 首先,模拟事件冒泡,循环向父级真实DOM 触发事件(click)涉及的处理函数
      //     这些处理函数的setState会emitUpdate,将updater存入这里
      // 最后,调用updateQueue.batchUpdate(),拿出所有updater
      //     调用updater.shouldUpdate()
    }
}
class Updater {
    constructor(classInstance) {
        //类组件的实例
        this.classInstance = classInstance;
        //等待更新的状态
        this.pendingStates = [];
        //更新后的回调
        this.callbacks = [];
    }
    addState(partialState, callback) { // ---------------------储存当前实例state的修改,调用smitUpdate()
        // 储存传进来的setState传进来的state对象,等后续修改
        // 调用smitUpdate()
    }
    emitUpdate() { // -----------------------------------------判断批量触发,还是立即触发updateComponent()
        // 立即触发更新
        // 还是 将此updater存入updateQueue,
    }
    //更新这个updater对应的类组件
    updateComponent() { // ------------------------------------调用shouldUpdate(),触发回调
        // 调用getState()拿到最新state,传给shouldUpdate更新
        // 触发setState传入的所有回调
    }
    getState() { // --------------------------------------------返回最新state
        // 获取所有要修改的state状态,循环修改state,返回最新state
    }
}
function shouldUpdate(classInstance, nextState) { // -----------更新state,判断是否需要更新视图,调用forceUpdate()
    // 生命周期函数 shouldComponentUpdate 再次调用判断是否更新,
    // 生命周期函数 componentWillUpdate 再此调用表示将要更新,
    // 调用 classInstance.forceUpdate() 进行更新
}
export class Component {
    constructor(props) {
        this.updater = new Updater(this); // --------------------updater更新控制器
    }
    setState(partialState, callback) { // -----------------------updater.addState
        // this.updater.addState(partialState, callback);
    }
    forceUpdate() { // -------------------------------------------真正更新组件vdom
        // 根据最新state,获取 新老 renderVdom, domDiff对比
        // 并挂载this.oldRenderVdom = newRenderVdom
        // vdom挂载完, 生命周期函数 componentDidUpdate 在此调用
    }
}
```

## react与Vue最大的不同

__react不是MVVM__

react是setState触发更新，

非Vue那样 事件触发 model改变，model改变 触发监听。等待一次同步任务全部执行完，下一个微任务更新视图.

__vue以一次 宏任务 为更新单位__

__react以一次 事件 为更新单位__

__在效果上是一样的,一次事件 其实就是一个宏任务,本质上是 视图更新的触发机制,以及 视图更新的发动时间不同__

__vue是监听数据,数据改变触发视图更新 react是监听事件,事件触发更新__

当 当次事件引发的 事件冒泡 造成 的所有事件处理函数执行完成后,

得到所有state的变化,按批次处理,一次性更新state,最后调用视图更新函数.

> react中事件处理中， 在事件函数中 state的变化是异步的，但还是在同一次同步任务中
> 只不过实在当次 事件处理 的最后进行state批量更新

## 类组件ref的实现原理

类组件可以直接使用ref

首先,`constructor`内`this.a = React.createRef()`,创建了一个对象赋值给a

然后,`<input ref={this.a} />` 把a对象传递给了ref属性

最后,`render`的时候发现了ref属性,就会把使`ref.current`指向当前真实DOM

```js
class Sum extends React.Component {
  constructor() {
    super();
    this.a = React.createRef();//{current:inputA的真实DOM}
    this.b = React.createRef();//{current:inputB的真实DOM}
    this.result = React.createRef();//{current:inputResult的真实DOM}
  }
  handleClick = (event) => {
    let valueA = this.a.current.value;
    let valueB = this.b.current.value;
    this.result.current.value = valueA + valueB;
  }
  render() {
    return (
      <div>
        <input ref={this.a} />+<input ref={this.b} />
        <button onClick={this.handleClick}>=</button>
        <input ref={this.result} />
      </div>
    )
  }
}
let element = <Sum />;

ReactDOM.render( element, document.getElementById('root') );
```

```js
// 根据虚拟DOM创建真实DOM
function createDOM(vdom) {
    let { type, props, ref } = vdom;
    let dom;//真实DOM
    if (type && type.$$typeof === REACT_FORWARD_REF_TYPE) {
      // ...
    } else if (type === REACT_TEXT) {//文本组件
      // ...
    } else if (typeof type === 'function') {
      // ...
    }
    if (props) {
      // ...
    }
    vdom.dom = dom;
    if (ref) ref.current = dom; // ******
    return dom;
}
```

## 函数组件的ref,forwardRef(function_component)

在React中,不能直接给函数组件使用ref,因为函数组件挂载时,没有新建实例.

```js
function TextInput(props,ref){ // 注意第二个参数ref,得这样写
  return <input ref={ref}/> 
}

const ForwardedTextInput = React.forwardRef(TextInput);

class Form extends React.Component {
  constructor(props) {
    super(props);
    this.input = React.createRef();
  }
  getFocus = () => {
    this.input.current.focus();
  }
  render() {
    return (
      <div>
        <ForwardedTextInput ref={this.input} />
        <button onClick={this.getFocus}>获得焦点</button>
      </div>
    )
  }
}
ReactDOM.render(<Form />, document.getElementById('root'));
```

'Forward'组件`ForwardedTextInput`,类似于函数组件,不渲染真实DOM的vdom

在编译后已经变为`{type:{$$typeof:REACT_FORWARD_REF,render},props,ref}`,为第一层 vdom(后面称为v1),

`createDOM`形成真实DOM是,发现`v1.type.$$typeof==REACT_FORWARD_REF`,

调用`mountForwardComponent`,传入v1,内部调用 `v1.type.render()`,

其实就是执行函数组件`TextInput`,并传入v1上 `ForwardedTextInput` 传来的props 及 ref,

返回 函数组件`TextInput` 的vdom,为第二层vdom(后面称为v1)

再传入 `createDOM(renderVdom)` 创建真实DOM并返回

```js
// 实际上就是把函数组件变成了 另一种函数组件 forwardRef
function forwardRef(render){
    return {
        $$typeof:REACT_FORWARD_REF,
        render
    }
}
// 创建虚拟节点时,还是调用该函数组件,返回虚拟对象
function mountForwardComponent(vdom){
    //vdom = {type:{$$typeof:REACT_FORWARD_REF,render},props:{},ref:this.textInputRef}
    let {type,props,ref} = vdom;
    let renderVdom = type.render(props,ref);
    return createDOM(renderVdom);
}
```

> react.js 里面的方法似乎都是返回不同类型的对象,react-dom.js 根据不同类型的对象进行真实DOM创建

__不支持类组件用`React.forwardRef(TextInput)`,因为从源码里可以看到是直接调用的render,而不是新建实例,在调用实例的render__


## 类组件的 生命周期

```js
class Counter extends React.Component {
  //设置默认属性对象
  static defaultProps = { name: 'zhufeng' }
  constructor(props) {
    super(props);
    //设置默认状态对象
    this.state = { number: 0 };
    console.log(`Counter 1.constructor`); // 1.设置属性和状态
  }
  componentWillMount() {
    console.log(`Counter 2.componentWillMount`); // 2.将要挂载
  }
  componentDidMount() {
    console.log(`Counter 4.componentDidMount`); // 4.挂载完成(挂载:真实DOM append到 父真实DOM上)
  }
  shouldComponentUpdate(nextProps, nextState) {
    console.log(`Counter 5.shouldComponentUpdate`); // 5.是否要更新组件界面,this.state其实都会更新
    //奇数不更新界面，偶数更新界面。不管要不要更新 
    return nextState.number % 2 === 0;
  }
  componentWillUpdate() {
    console.log(`Counter 6.componentWillUpdate`); // 6.组件将要更新
  }
  componentDidUpdate() { // ---------------------// 六和七 之间会有3.render()
    console.log(`Counter 7.componentDidUpdate`); // 7. 组件更新完成
  }
  handleClick = () => {
    this.setState({ number: this.state.number + 1 });
  }
  render() {
    console.log(`Counter 3.render`); // 3.计算虚拟DOM
    return (
      <div>
        <p>{this.state.number}</p>
        <button onClick={this.handleClick}>+</button>
      </div>
    )
  }
}

```

