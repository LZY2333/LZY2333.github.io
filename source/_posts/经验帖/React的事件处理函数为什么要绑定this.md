
---
title: React的事件函数为什么要绑定this
date: 2021-12-22 14:46:04
categories: 经验帖
tags: 
    - React
---


# React的事件函数为什么要绑定this


## react类组件中,事件处理函数需要 bind(this)

react类组件中,我们需要将 事件处理函数 绑定在组件实例上

```js
class Toggle extends React.Component {
  constructor(props) {
    super(props);
    this.state = {isToggleOn: true};

    // This binding is necessary to make `this` work in the callback
    this.handleClick = this.handleClick.bind(this);
  }

  handleClick() { // 如果没有bind(this),则调用时此处拿不到类的this.setState
    this.setState(state => ({
      isToggleOn: !state.isToggleOn
    }));
  }

  render() {
    return (
      <button onClick={this.handleClick}>
        {this.state.isToggleOn ? 'ON' : 'OFF'}
      </button>
    );
  }
}
```

## 为什么需要bind(this)

不绑定的话会出现this 丢失的问题.

这是由 JavaScript 中 this 绑定的方式决定的, 与React的工作方式无关。

```js
class Foo {
  constructor(name){
    this.name = name
  }

  display(){
    console.log(this.name);
  }
}

// 情理之中的示范,输出了this.name lzy
var foo = new Foo('lzy');
foo.display(); // lzy

// 将 函数赋值给新变量, 造成上下文的丢失.. .this,只认调用时的前缀.
// 实际在 React Component 中将处理程序,与为 callback 参数传递相似。
var display = foo.display;
display(); // TypeError: this is undefined
```
实际上这里就是把堆中的函数地址,传递给了变量,调用变量display时,和foo对象已经毫无关联

调用display时,在display作用域中查找 this.name,相当于在global中查找

示例二
```js
var obj = {
    name: 'lzy',
    display: function () {
        console.log(this); // 'this' 指向 obj
    }
};

var name = "global lzy";
var outerDisplay = obj.display;
outerDisplay(); // 浏览器下运行,输出 global lzy
```

事件处理函数被传递给新变量后,作用域发生了改变,丢掉了原先的this。

也就是说,react中肯定发生了 函数传递给新的变量 的事件,导致了作用域发生改变.

__那么,react中什么时候把事件处理函数,传递给了新的变量呢???__

这就要从react对事件绑定 与 触发 的特殊处理说起

## React中怎么实现的事件绑定

在 `React createDOM`函数中会进行进行真实DOM的创建,随后当前dom上的属性(props)进行处理

如 `<div style="width:100px;" onClick={this.handleClick} xxx='123'>`,

其中的 style,onClick,xxx 均在编译阶段被处理为 props下的属性。

处理props,会调用`updateProps()`,当检测满足`/^on[A-Z].*/.test(key)`时,此属性被认为是 事件绑定

__事件绑定__,由`addEvent()`函数进行处理

1. 给当前 真实DOM 创建一个 store属性,储存各类事件,键为事件类型(如'click'),值为处理函数.

注意,此时发生了`handleClick`函数的赋值给新变量`store.click`,如未`bind(this)`,则原本的this丢失.

2. 将事件的监听(如'click')放在 `document`上,17以后的版本,放在 `div#root`上.

最顶层的DOM元素自然可以监听其内部的所有事件,

监听到事件后从`target`向外冒泡,依次触发`target`及父节点的对应事件`handler`


换言之,由`document`监听所有DOM上的事件,而后触发放在 对应DOM 上的`store`上的对应`handler`


```js
/**
 * 
 * @param {*} dom 要绑定事件的DOM元素  button
 * @param {*} eventType 事件类型 onclick
 * @param {*} handler 事件处理函数 handleClick
 */
export function addEvent(dom, eventType, handler) {
  let store = dom.store || (dom.store = {})
  //dom.store['onclick']=handleClick
  store[eventType] = handler;//虽然没有给每个子DOM绑定事件，但是事件处理函数还是保存在子DOM上的
  //从17开始，我们不再把事件委托给document.而是委托给容器了 div#root
  if (!document[eventType]) {
    document[eventType] = dispatchEvent; // 如,document.onclick = clickHandler
  }
}
//合成事件的统一代理处理函数
function dispatchEvent(event) {
  let { target, type } = event;//target=button type =click
  let eventType = `on${type}`;//onclick
  let syntheticEvent = createSyntheticEvent(event);
  updateQueue.isBatchingUpdate = true;//事件函数执行前先设置批量更新模式为true
  //在此我们要模拟React事件的冒泡
  while (target) {
    let { store } = target;
    let handler = store && store[eventType]
    handler && handler(syntheticEvent);
    //在执行handler的过程中有可能会阻止冒泡
    if (syntheticEvent.isPropagationStopped) {
      break;
    }
    target = target.parentNode;
  }
  updateQueue.isBatchingUpdate = false;
  updateQueue.batchUpdate();
}
```

## bind 的最佳实践

__在定义函数阶段使用箭头函数__

```js
class App extends React.Component {
    constructor(props) {
        super(props);
    }
    handleClick = () => {
        console.log('this > ', this);
    }
    render() {
        return (
        <div onClick={this.handleClick}>test</div>
        )
    }
}
```

此外,可以在 构造函数中使用bind,在render中使用箭头函数,在render中使用bind

组件每次执行render将会重新分配函数这将会影响性能。特别是在你做了一些性能优化之后，它会破坏PureComponent性能。不推荐使用。


## 为什么vue 和angular中不需要bind

vue源码中methods下的所有函数，都被 显式的调用bind() 绑定在了当前组件对象上.

猜测angular也有类似处理
```js
for (const key in methods) {
    // ...
    vm[key] = typeof methods[key] !== 'function' ? noop : bind(methods[key], vm) // 内部有.bind(this)
}
```