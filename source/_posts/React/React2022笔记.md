---
title: React2022笔记
date: 2022-11-1 15:54:54
categories: 技术栈
tags:
    - React
---
本篇讲述 __React15原理__,从 __初始化__ 以及 __更新__ 两条线路进行.

同时我认为,要学习前端框架的原理,沿着这两条线进行学习,有事半功倍的效果.

React几个重要版本更新, 16 fiber, 16.8 hooks, 18 优先级调度 并发执行.

其中fiber,是 React 核心算法的重新实现,也就是说其核心思想依旧不变.

从React15开始,理解React原理,再加入fiber等后续更新,也更能理解fiber的存在价值.

最后要说的是,React15真的很简单,是我看过所有框架原理中最容易理解的一个.

相信读完本文,你也会感叹,原来是这样!

### 1. 代码中所有JSX其实都是函数

总所周知，JSX是一种语法糖，就像`async`函数是`Promise`语法糖一样。

那么，JSX的原型又是什么呢？

__React17以前__

```js
const babel = require('@babel/core');
// 这里先写一段JSX
const sourceCode = `
<h1>
  hello<span style={{ color: 'red' }}>world</span>
</h1>
`;
const result = babel.transform(sourceCode, {
  plugins: [
    ["@babel/plugin-transform-react-jsx", { runtime: 'classic' }]
  ]
});
console.log(result.code);

// React.createElement("h1", null, "hello", React.createElement("span", {
//   style: {
//     color: 'red'
//   }
// }, "world"));
```

编译后的函数组件，其实就是返回一个`React.createElement()`

babel对JSX语法进行正则匹配，通过AST语法树，将JSX代码替换为了`React.createElement()`


__React17开始__

```js
const babel = require('@babel/core');
const sourceCode = `
<h1>
  hello<span style={{ color: 'red' }}>world</span>
</h1>
`;
const result = babel.transform(sourceCode, {
  plugins: [
    ["@babel/plugin-transform-react-jsx", { runtime: 'automatic' }]
  ]
});
console.log(result.code);

// import { jsx } from "react/jsx-runtime";
// jsx("h1", {
//   children: ["hello", jsx("span", {
//     style: {
//       color: 'red'
//     },
//     children: "world"
//   })]
// });
```

和替换成 `React.createElement()` 异曲同工

React17开始将JSX库单独提出，以便其他库使用JSX语法，而可以不引入React。

> 其实Vue 组件的 HTML模板部分 也是如此 被编译为 一个函数，当组件被调用时，返回虚拟DOM

### 2. 函数组件的调用原理

下面是一个非常简单的React项目
```js
// 定义一个函数组件,叫XXXXX
function XXXXX(props) {
    return <h1 className='title' style={{ color: props.color }}>{props.name}:{props.children}</h1>
}
let element = <XXXXX color="orange" name="luoziyu" age={25} >我是函数组件的儿子</XXXXX>
console.log(element);
ReactDOM.render(element, document.getElementById('root'));
```

经过babel编译JSX 打包后 代码为(打包后的代码配上React已可在浏览器中运行)
```js
function XXXXX(props) {
    return React.createElement("h1", {
        className: "title",
        style: {
            color: props.color
        }
    }, props.name, ":", props.children)
}

let element = React.createElement(XXXXX, {
  color: "orange",
  name: "luoziyu",
  age: 25
}, "\u6211\u662F\u51FD\u6570\u7EC4\u4EF6\u7684\u513F\u5B50")

console.log(element)
// {
//     $$typeof: Symbol(react.element),
//     key: undefined,
//     props: {
//         color: "orange",
//         name: "luoziyu",
//         age: 25,
//         children: {
//             props: "我是函数组件的儿子"
//         }
//     },
//     ref: undefined,
//     type: XXXXX
// }
ReactDOM.render(element, document.getElementById('root'));
```

函数组件调用也是JSX语法，在打包后，同样将被编译为`createElement`函数的形式。

不同的是:

原生节点直接将DOM标签('h1')作为 type 传入，函数组件节点则传入 函数本身('XXXXX') 作为 type

(供后续调用,后面会讲到,注意这个type 就是 函数XXXXX,后续可随时拿出来调用)

这也是为什么函数需要先引入后使用，因为 需要当前执行上下文中存在此函数，才能执行。

组件源码(JSX) --> 打包后的组件代码(createElement()) --> 浏览器运行后的组件返回值(vdom)


那么很明显,要理解react, createElement 和 render 这两个函数就是突破口.
### 3. React.createElement 和 ReactDOM.render 原理

`React.createElement` 很简单,就是根据传入属性返回 虚拟DOM对象，以下称vdom，其中最重要的属性为Type

```js
{
    $$typeof: REACT_ELEMENT,// react元素标识
    type,//虚拟DOM元素的类型 'div' 'h1' 或 之前定义的XXXXX函数组件
    ref,
    key,
    props// 这是属性对象 id className style ....
}
```

`ReactDOM.render` 代表渲染，使用`createDOM`将 虚拟节点 转换为真实节点，并通过`appendChild`挂载在容器中,完成渲染。

其中的`createDOM`,会判断传入的 vdom 的 type 属性,进行不同的操作,

例如 type 为`h1`等原生标签时, 直接通过 `document.createElement(type)` 创建真实DOM并返回,此时`createDOM`任务完成.

而当 type 为 函数组件时, 则会通过 调用该函数(也就是type)`type(props)`,得到函数组件返回的 第二层vdom.

(注意,函数组件本身是vdom,调用函数组件,会返回一个第二层vdom)

然后对第二层vdom 再次调用 `createDOM`,形成递归,(如果是函数组件返回函数组件,会产生多层递归,多层vdom)

直到获取到 原生标签产生的真实dom,这层的`createDOM`递归才算结束, 创建真实DOM并返回.

```js
function render(vdom, container) {
  mount(vdom, container);
}
// 把虚拟DOM转换成真实DOM并且插入容器中
function mount(vdom, container) {
  let newDOM = createDOM(vdom);
  container.appendChild(newDOM);
}
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
    //vdom.老的要渲染的虚拟DOM=renderVdom,方便后面的DOM-Diff
    vdom.oldRenderVdom = renderVdom;
    return createDOM(renderVdom);
}
```
额外注意, 组件的 vdom虽然没挂载真实DOM,但是挂载了 `oldRenderVdom`,也就是第二层vdom.

其代表意义是 __该函数组件上一次渲染的vdom__, 

而第二层vdom 如果是原生标签 则没有此属性,`oldRenderVdom`为组件专属属性,用于DOM-Diff.

原生标签也有自己的属性 `dom` 指向其渲染的 真实DOM.

> 并非每个vdom都有自己对应的真实dom,或者说可能多层vdom对应一个真实dom,因为组件的存在.

当前真实DOM完成,__children属性上的子vdom开始渲染真实dom并挂载__

```js
function createDOM(vdom) {
  let { type, props } = vdom;
  let dom;
  // 创建当前层真实DOM
  if (type === REACT_TEXT) {
    dom = document.createTextNode(props);
  } else if (typeof type === 'function') {
    if (type.isReactComponent) {
      return mountClassComponent(vdom);
    } else {
      return mountFunctionComponent(vdom);
    }
  } else {
    dom = document.createElement(type);
  }
  if (props) {
    //更新真实dom的属性,如style
    updateProps(dom, props);
    
    //子vdom开始mount
    if (typeof props.children === 'object' && props.children.type) {
      mount(props.children, dom)
    } else if (Array.isArray(props.children)) {
      reconcileChildren(props.children, dom);
    }
  }
  //在创建真实DOM的，把虚拟DOM和真实DOM进行关联
  vdom.dom = dom;
  return dom;
}
function reconcileChildren(children, parentDOM) {
  for (let i = 0; i < children.length; i++) {
    mount(children[i], parentDOM)
  }
}
```

注意代码: 父真实dom先产生,却晚于子节点完成自己的mount(也就是appendChild)过程,

子真实dom后产生,却先于父节点完成自己的mount过程,把自己挂在父节点上.

自上而下,又自下而上的感觉.

最后一步,根真实dom 挂载在 root容器上,浏览器开始渲染dom,展示出视图,React初始化完成.



### 4. 批量更新(类组件为例)

1. setState 为异步更新，在下一行打印
```js
// 假设 this.state.number 初始为0
this.setState({number:this.state.number+1});
console.log(this.state); // 打印 0，而不是期望的1，但页面展示为1
```
因为 `setState` 是异步执行的，console的执行 先于 state的修改

在下一个事件循环 才执行了 `this.state.number+1` 并渲染页面


2. 想基于当前同步任务中上一次state修改,来做这次的state修改
```js
this.setState({number:this.state.number+1});
console.log(this.state);
this.setState({number:this.state.number+1});
console.log(this.state);
// 期望state为2,实际展示结果为1,也就是说虽然我调用了两次number+1,但两次都是基于0加了1
```

正确的写法,`this.setState(state=>{number:state.number+1})`(使用函数,而非对象)

函数被传入的是 最新state(已经过同次同步任务之前setState的修改后 并与oldState 合并了的state),

> 注意,即使用函数的方法,此次两次console也均为0,因为无论如何,本质上state的修改都异步,console都先于state的修改执行.


3. setState可能异步可能同步
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
  // 注意:React18,输出为: 0 0 1 1
```
发现了两个问题: 

1. 第一次 第二次 两次 只加了1 (原因看上一问)(如果第一第二次改成函数执行,则此处输出0034)

2. setTimeout 内的 setState是同步更新,调用一次马上更新state数据,console拿到的是最新state.

__何时同步,何时异步__

react能管到的更新,都异步了,因为异步性能更好,不用每次修改都更新,而是一次同步统一更新

react管不到的更新,都同步了,每次都更新state,因为这样更保险,不容易出错.

什么是管不到的更新? 就是setTimeout这种宏任务,非本次同步执行的.


__批量更新的单位是,当前同步任务内 同一个事件处理函数 内的 setState__

#### 批量更新实现原理

更新队列中存在一个标识,是否批量更新.

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

> 当前同步任务内,一个事件多个handler为一个批次合并更新。
> React18以后setTimeout中的setState也是批量的了,新版本里是用的更新优先级来合并.



### 5. React的事件都绑定在容器上代理,而Handler在当前真实dom的store属性上

#### React的事件处理原理

1. React事件绑定时,并没有将事件绑定在 当前DOM,而是绑定在 容器div#root

2. 事件绑定在 容器上,事件处理函数 还是保存在 当前DOM.store中
 
3. click 当前DOM,必然事件冒泡,触发 容器div#root 绑定的click事件,

4. 容器调用其 统一事件处理函数 拿到event.target/type,调用 真正的相应 事件处理函数
   
   (并传入react 修改后加了点属性的的event,如果要用的话)

5. target就是 当前DOM,挂载了 事件处理函数,type 就是事件类型,据此调用 当前DOM 上的 事件处理函数

> 这种做法叫切片编程，react可以在事件处理时做一些统一的事情，比如 处理浏览器兼容性
> 15的事件都是代理到document,17之后都代理给了容器 div#root
> 因为React希望一个页面可以运行多个react版本 

#### 当前同步任务内,一个事件多个handler为一个批次合并更新。
__容器统一事件处理函数会让当前 事件处理 结束后组件的状态 异步批量更新__

1. 容器统一事件处理函数的步骤如下,

2. 首先,updateQueue.isBatchingUpdate=true;// 事件函数执行前先设置批量更新模式为true

3. 这样当前如果有同步任务的setState 就会作为 异步批量更新的一部分,放入 updateQueue 的待更新队列,

   isBatchingUpdate === false,setState会直接同步触发 组件的state更新

4. 此时调用 当前DOM 上的 事件处理函数,如果里面有 setState 就按上面的逻辑来

6. 最后 isBatchingUpdate = false, updateQueue.batchUpdate()启动批量更新

```js
export function addEvent(dom, eventType, handler) {
  let store = dom.store || (dom.store = {});//保证DOM节点有一个自定义的属性对象
  store[eventType] = handler;//store.onclick=handler 把处理函数保存到真实DOM节点上 
  if (!document[eventType])
    document[eventType] = dispatchEvent;//document.onclick  = dispatchEvent
}

function dispatchEvent(event) {
  updateQueue.isBathingUpdate = true;//在事件函数执行前，让批量更新标志设置为true
  let { target, type } = event;//target=button真实DOM,type事件类型click
  let eventType = `on${type}`;//onclick
  const { store } = target;
  let handler = store && store[eventType];
  // 调用绑定在store上的事件处理函数,内部的setState会将状态放入批量更新队列
  handler && handler(event);
  // 执行完,则当前 handler函数内的饿setState数据更新都已放入队列,调用批量更新
  updateQueue.batchUpdate();
}

// 全局变量,批量更新队列,react中有大量全局变量
export let updateQueue = {
  isBathingUpdate: false,//是否是批量更新,如果为true就批量的异步的，如果是false非批量的，同步的
  updaters: new Set(),
  batchUpdate() {
    updateQueue.isBathingUpdate = false;
    for (let updater of updateQueue.updaters) {
      updater.updateComponent();
    }
    updateQueue.updaters.clear();
  }
}
```

__其实并没有异步,还在当次同步任务内,只不过数据更新在handler执行完之后__

__为什么react要给事件处理函数接收的event加点属性__

1. 兼容多种浏览器,用到时候不用考虑游览器差异

__其他__

1. 你不能通过返回 false 的方式阻止事件默认行为.你必须显式的使用preventDefault

2. 从17以前,事件都是 绑定在document上,委托给document.

3. 同一类型事件,容器只需绑定一次,因为就是注册事件,之后触发target上的 事件处理函数就行.

### 7. react与Vue的不同

#### 更新原理不同

__react不是MVVM__

react是setState 主动触发更新，

非Vue那样 事件触发 model改变，model改变 触发监听。等待一次同步任务全部执行完，下一个微任务更新视图.

__vue以一次 宏任务 为更新单位__

__react以一次 事件 为更新单位__

__在效果上是一样的,一次事件 其实就是一个宏任务,本质上是 视图更新的触发机制,以及 视图更新的发动时间不同__

__vue是监听数据,数据改变触发视图更新 react是监听事件,事件触发更新__

> react中事件处理中， 在事件函数中 state的变化是异步的，但还是在同一次同步任务中
> 只不过实在当次 事件处理 的最后进行state批量更新

#### 更新粒度不同(待更新)

### 6. ref

```js
let usernameRef = React.createRef();
<input ref={usernameRef} />
```

ref的本质就是创建一个 `{current:null}` 对象，并将ref对象传递给子组件

子组件在 初始化过程中， 真实dom 创建完成后，更新 属性时，对ref对象进行专门处理，

将真实dom 赋值给 ref.current

如此，初始化完成后，外部即可通过ref.current获取到，真实dom

```js
function createDOM(vdom) {
  let { type, props, ref } = vdom;
  let dom;//真实DOM元素
  // 根据不同type 渲染真实DOM
  // if (type === xxx) {
  // } else if (type === xxx) {
  // } else {}
  if (props) {
    //更新属性 DOM 老属性对象 新属性对象
  }
  vdom.dom = dom;
  // 将真实dom挂载在ref上
  if (ref) ref.current = dom;
  return dom;
}
```

### 7. DOM-Diff

在批处理完成，拿到最新state之后，调用函数获得 newVdom

新旧vdom进行对比，更新节点，这个对比过程就是 DOM-Diff，

先对父vdom进行对比，再处理其子节点，处理子节点时将用到 DOM-Diff。

__DOM-Diff的根本目的是复用老真实dom,减少渲染消耗__

`compareTwoVdom`, `updateChildren`

#### 当前节点对比

父vdom或者说当前vdom的比较非常简单

__当前新旧vdom type不同时会直接销毁并重新整个子孙分支__
```js
// 当前节点对比,不同的直接删除,或新增整个分支,不保留其子节点
export function compareTwoVdom(parentDOM, oldVdom, newVdom, nextDOM) {
  if (!oldVdom && !newVdom) { // 新旧vdom都没有
    return null;
  } else if (oldVdom && !newVdom) { // 有老vdom，无新vdom
    unmountVdom(oldVdom);
  } else if (!oldVdom && newVdom) { // 有新vdom，无老vdom
    let newDOM = createDOM(newVdom);
    if (nextDOM) {
      parentDOM.insertBefore(newDOM, nextDOM);
    } else {
      parentDOM.appendChild(newDOM);
    }
    //老的虚拟DOM存在，并且新的虚拟DOM也存在，并且类型相同，是一个函数组件或者是同一个类组件
  } else if (oldVdom && newVdom && oldVdom.type !== newVdom.type) {
    unmountVdom(oldVdom);
    let newDOM = createDOM(newVdom);//此处会有一个问题我们后面解决
    if (nextDOM) {
      parentDOM.insertBefore(newDOM, nextDOM);
    } else {
      parentDOM.appendChild(newDOM);
    }
  } else { // 老节点存在，新节点也存在，类似也一样，我们进行深度的DOM-DIFF过程
    updateElement(oldVdom, newVdom);
  }
}
function updateElement(oldVdom, newVdom) {
  if (oldVdom.type.$$typeof === REACT_MEMO) {
    updateMemoComponent(oldVdom, newVdom);
  } else if (oldVdom.type.$$typeof === REACT_CONTEXT) {
    updateContextComponent(oldVdom, newVdom);
  } else if (oldVdom.type.$$typeof === REACT_PROVIDER) {
    updateProviderComponent(oldVdom, newVdom);
  } else if (oldVdom.type === REACT_FRAGMENT) {
    let currentDOM = newVdom.dom = findDOM(oldVdom);
    updateChildren(currentDOM, oldVdom.props.children, newVdom.props.children);
  } else if (oldVdom.type === REACT_TEXT) {//如果新老节点都是文本节点的话
    let currentDOM = newVdom.dom = findDOM(oldVdom);
    if (oldVdom.props !== newVdom.props) {
      currentDOM.textContent = newVdom.props;
    }
  } else if (typeof oldVdom.type === 'string') {//就是原生节点
    let currentDOM = newVdom.dom = findDOM(oldVdom);
    updateProps(currentDOM, oldVdom.props, newVdom.props);
    updateChildren(currentDOM, oldVdom.props.children, newVdom.props.children);
  } else if (typeof oldVdom.type === 'function') {
    if (oldVdom.type.isReactComponent) {
      updateClassComponent(oldVdom, newVdom);
    } else {
      updateFunctionComponent(oldVdom, newVdom);
    }
  }
}
```

#### 子节点对比

__Key属性__,每个子节点通过key属性是否相同,判断是否为同一节点,同一节点保留并复用旧真实dom.

__为什么子节点对比这么复杂__

因为孩子节点是数组类型,可能存在位置的变换,直接按位对比会有较大误差.

例如 第一个子节点被删除时,后面依次补位.

此时新旧节点对比,如果直接按位对比,本可复用的节点,被判定为无法复用,造成性能损耗.

__子节点对比__

1. 用map储存好oldVChildren, 然后依次一个个检查 newVChildren 数组中的元素, 

2. 如果 map 中存在该

```js
// 更新孩子节点
function updateChildren(parentDOM, oldVChildren, newVChildren) {
    oldVChildren = (Array.isArray(oldVChildren) ? oldVChildren : [oldVChildren]).filter(item => item);
    newVChildren = (Array.isArray(newVChildren) ? newVChildren : [newVChildren]).filter(item => item);
    //把老节点存放到一个以key为属性，以节点为值的数组里
    let keyedOldMap = {};
    let lastPlacedIndex = 0; // 这个标记之前的点都是要删除的
    oldVChildren.forEach((oldVChild, index) => {
        keyedOldMap[oldVChild.key || index] = oldVChild;
    });
    //存放操作的补丁包
    let patch = [];
    newVChildren.forEach((newVChild, index) => {
        let newKey = newVChild.key || index;
        let oldVChild = keyedOldMap[newKey];
        if (oldVChild) {
            //更新老节点,递归在这里
            updateElement(oldVChild, newVChild); // * 有老的节点,无需移动的,直接更新属性就行,不放入patch
            if (oldVChild.mountIndex < lastPlacedIndex) { // 有老节点,且其 old真实DOM 在当前已排好的 队列之后,需要移动插入
                patch.push({
                    type: MOVE,
                    oldVChild,
                    newVChild,
                    mountIndex: index
                });
            }
            //如果你复用了一个老节点，那就要从map中删除
            delete keyedOldMap[newKey];
            lastPlacedIndex = Math.max(lastPlacedIndex, oldVChild.mountIndex);
        } else {
            patch.push({ // 需要新建的 放入patch
                type: PLACEMENT,
                newVChild,
                mountIndex: index
            });
        }
    });
    //获取所有的要移动的老节点
    let moveChild = patch.filter(action => action.type === MOVE).map(action => action.oldVChild);
    //把剩下的没有复用到的老节点和要移动的节点全部从DOM树中删除
    let deleteVChildren = Object.values(keyedOldMap)
    deleteVChildren.concat(moveChild).forEach(oldVChild => {
        let currentDOM = findDOM(oldVChild);
        parentDOM.removeChild(currentDOM);
    });
    if (patch) { // 真实节点插入,到 没动的节点内,前几位就是没动的节点
        patch.forEach(action => { // 循环遍历  newVdom
            let { type, oldVChild, newVChild, mountIndex } = action
            let childNodes = parentDOM.childNodes;//[0 A,1:C:2 E]
            let currentDOM;
            if (type === PLACEMENT) {
                currentDOM = createDOM(newVChild);
                newVChild.mountIndex = mountIndex;
            } else if (type === MOVE) {
                currentDOM = findDOM(oldVChild);
                oldVChild.mountIndex = mountIndex;
            }
            let childNode = childNodes[mountIndex] // 获取当前节点要插入的位置,是不是已经有节点了
            if (childNode) {
                parentDOM.insertBefore(currentDOM, childNode);
            } else {
                parentDOM.appendChild(currentDOM);
            }
        });
    }
}
```


### 8. context穿透传值原理


#### context使用方式

```js
// * 1.这里必须这样创建context
let ThemeContext = React.createContext();
const { Provider, Consumer } = ThemeContext;

let style = { margin: '5px', padding: '5px' };
function Header() {
    return (
        // * 必须写 <Consumer>{ (接受context)=>{} }</Consumer>
        <Consumer>
            {
                // 额外提一点,注意这里是括号,不是大括号,用大括号得写return,括号可以省略return
                (contextValue) => (
                    <div style={{ ...style, border: `5px solid ${contextValue.color}` }}> Header </div>
                )
            }
        </Consumer>
    )
}
class Main extends React.Component {
    // * 2. 类组件这里必须写 static contextType = 创建的那个context对象
    static contextType = ThemeContext 
    render() {
        return (
            // 类组件这里必须 从 this.context 读provider传递的值
            <div style={{ ...style, border: `5px solid ${this.context.color}` }}> Main </div>
        )
    }
}

class Page extends React.Component {
    constructor(props) {
        super(props);
        this.state = { color: 'black' };
    }
    changeColor = (color) => { this.setState({ color }); }
    render() {
        let contextValue = { color: this.state.color, changeColor: this.changeColor };
        return (
            // * 3. 这里必须传值写value
            <Provider value={contextValue}> 
                <div style={{ ...style, width: '250px', border: `5px solid ${this.state.color}` }}>
                    Page <Header /> <Main />
                </div>
            </Provider >
        )
    }
}
```


#### 原理理解

__就是provider和consumer指向同一个对象,从这个对象上拿值__

__渲染 context provider consumer 就是渲染其 子vdom，就像函数组件，类组件一样。__

`react.createContext()`,返回一个对象context,内含provider,consumer,这两个对象,又循环引用context

__渲染__
当`createDom()` 创建DOM节点时发现类型为provider,就把provider接受的props,绑在`provider._contexts._currentValue`身上

当`createDom()` 发现当前节点类型为consumer,因为两者的`_contexts`指向一个对象,就从其`consumer._contexts._currentValue`身上读value

函数组件,将读到的值传给 子函数组件 执行返回新vdom,再递归`createDom()`

类组件,在创建 实例的时候,拿到类上的static属性赋给实例,`classInstance.context = ClassComponent.contextType._currentValue;`

__更新__

新旧vdom 同type 进入`updateElement`,判断vdom类型为`provider`和`consumer`时,

`provider` 用新props的value,更新context对象,并继续`compareTwoVdom`其子组件

`consumer` 从`_context._currentValue`,拿到属性,调用子函数,返回新vdom,并递归`compareTwoVdom`

类组件,`forceUpdate()`内`this.context = this.constructor.contextType._currentValue;`

```js
// react.createContext()
function createContext() {
    let context = { $$typeof: REACT_CONTEXT };
    context.Provider = {
        $$typeof: REACT_PROVIDER,
        _context: context
    }
    context.Consumer = {
        $$typeof: REACT_CONTEXT,
        _context: context
    }
    return context;
}
// createDom()内对 Provider组件 Consumer组件的处理
function mountProviderComponent(vdom) {
    let { type, props } = vdom;
    let context = type._context;
    context._currentValue = props.value;
    let renderVdom = props.children;
    vdom.oldRenderVdom = renderVdom;
    return createDOM(renderVdom);
}
function mountContextComponent(vdom) {
    let { type, props } = vdom;
    let context = type._context;
    let renderVdom = props.children(context._currentValue);
    vdom.oldRenderVdom = renderVdom;
    return createDOM(renderVdom);
}
function mountClassComponent(vdom) { // 类组件
    if (ClassComponent.contextType) {
        classInstance.context = ClassComponent.contextType._currentValue;
    }
    // ......
}
```

更新的时候遇到Provider Consumer的处理
```js
function updateElement(oldVdom, newVdom) {
    //如果是文本节点的话
    if (oldVdom.type.$$typeof === REACT_CONTEXT) {
        updateContextComponent(oldVdom, newVdom);
    } else if (oldVdom.type.$$typeof === REACT_PROVIDER) {
        updateProviderComponent(oldVdom, newVdom);
    } else if (oldVdom.type === REACT_TEXT) {
    } else if (typeof oldVdom.type === 'string') {
    } else if (typeof oldVdom.type === 'function') {
    }
    //......
}
// provider
function updateProviderComponent(oldVdom, newVdom) {
    let currentDOM = findDOM(oldVdom);
    if (!currentDOM) return;
    let parentDOM = currentDOM.parentNode;
    let { type, props } = newVdom;
    let context = type._context; // 拿到context对象
    context._currentValue = props.value; // 用新vdom上的新props上的新value给context赋值
    let newRenderVdom = props.children; // 继续递归渲染他的孩子
    compareTwoVdom(parentDOM, oldVdom.oldRenderVdom, newRenderVdom);
    newVdom.oldRenderVdom = newRenderVdom;
}
function updateContextComponent(oldVdom, newVdom) {
    let currentDOM = findDOM(oldVdom);
    if (!currentDOM) return;
    let parentDOM = currentDOM.parentNode;
    let { type, props } = newVdom;
    let context = type._context; // 从_context._currentValue,拿到value,调用子函数
    let newRenderVdom = props.children(context._currentValue);
    compareTwoVdom(parentDOM, oldVdom.oldRenderVdom, newRenderVdom);
    newVdom.oldRenderVdom = newRenderVdom;
}
```

### 9. 生命周期

### 10. Hooks

见另一文章

__React每次更新都是从根节点开始更新的,全量更新,全量DOM-Diff__

因为React没有依赖收集,也没有watcher对组件数据进行监控,无法精确定位到组件

__类组件 函数组件的触发更新在scheduleUpdate__

### 11. router原理



### pureComponent原理

如果一个组件仅依赖props 和 states进行更新， 

则只需要判断 props 和 states 是否改变来决定该组件是否需要重新渲染，

如果没变则不进行更新渲染，以减少渲染次数。

```js
// 注意，继承了 PureComponent 的 类组件，重新shouldComponentUpdate方法的话，会覆盖此处。
// 想相当于自定义了更新规则。
class PureComponent extends Component {
  shouldComponentUpdate(newProps, nextState) {
    return !shallowEqual(this.props, newProps) || !shallowEqual(this.state, nextState)
  }
}

export function shallowEqual(obj1, obj2) {
  if (obj1 === obj2) {
    return true;
  }
  if (typeof obj1 !== 'object' || obj1 === null || typeof obj2 !== 'object' || obj2 === null) {
    return false;
  }
  let keys1 = Object.keys(obj1);
  let keys2 = Object.keys(obj2);
  if (keys1.length !== keys2.length) {
    return false;
  }
  for (let key of keys1) {
    if (!obj2.hasOwnProperty(key) || obj1[key] !== obj2[key]) {
      return false;
    }
  }
  return true;
}
//obj1={home:{name:'bj'}} obj2={home:{name:'bj'}}
```

### 12. redux原理