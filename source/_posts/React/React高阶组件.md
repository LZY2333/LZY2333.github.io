---
title: React高阶组件
date: 2022-02-24 16:29:33
categories: 技术栈
tags: 
    - React
---

# React高阶组件

React最重要的设计思想，React高阶组件.

__复用逻辑__,复用原有组件,定制业务专属组件

__强化props__,劫持上层传入的props,混入新props

下面记录几种高阶组件的编码方式

## 正向属性代理

最常见的使用,类似于组件外面包了一层组件,实现时的不同点在于,
把父组件的props 完全透传 给了子组件`<OldComponent {...this.props} {...state} />`,

这样不耽误使用被代理的组件的任何功能

优点:
新组件只需考虑 透传自己的props,传递额外的state
class组件和function组件均适用


缺点:
使用新组件时,无法直接获取老组件的状态,需要ref
使用新组件时,无法直接获取老组件的静态属性,需要手动处理
```js
import React from 'react';
const HigherOrderComponent1 = someMessage => OldComponent => {
    return class extends React.Component {
        render() {
            const state = {
                click: () => {
                    alert('定制化高阶组件,事先写好了点击事件,以及额外属性someMessage,使用的时候无需再传');
                }  
            }
            return (
                <div style={{border:'3px solid black',margin:'10px'}}>
                    <p>HigherOrderComponent1</p>
                    <p>{someMessage}</p>
                    <OldComponent {...this.props} {...state} />
                </div>
            )
        }
    }
}

// InnerComponent 本来是一个按钮组件,父组件传什么点击方法,执行什么
class InnerComponent extends React.Component {
    render() {
        return (
            <div style={{border:'3px solid red',margin:'10px'}}>
                <p>InnerComponent</p>
                <button onClick={this.props.click}>click</button>
            </div>
        )
    }
}

const HigherOrderComponent = HigherOrderComponent1('send some Message')(InnerComponent)
function TestHigherComponent () {
    const click = () => {
        alert('直接使用InnerComponent,需要自定义点击事件,click')
    }
    return (
        <div>
            <InnerComponent click={click}/>
            <HigherOrderComponent />
        </div>
    )
}
export default TestHigherComponent
```

## 反向继承

用 新组件继承老组件, 将老组件的vdom作为属性拆解使用,使用时不会真正实例化老组件.

优点:
1.继承可直接获取组件状态,state，props ,生命周期,绑定的事件函数等
2.无需额外处理静态属性

缺点:
1.需要明确了解组件内部状态,有哪些属性.
2.新组件 状态属性 会覆盖老组件的状态属性,如生命周期函数.

```js
import React from 'react';
class Button extends React.Component{
    state = {name:'张三'}
    componentWillMount(){
        console.log('Button componentWillMount');
    }
    componentDidMount(){
        console.log('Button componentDidMount');
    }
    render(){
        console.log('Button render');
        return <button name={this.state.name} title={this.props.title}/>
    }
}
const wrapper = OldComponent =>{
    return class NewComponent extends OldComponent{
        state = {number:0}
        componentWillMount(){
            console.log('WrapperButton componentWillMount');
             super.componentWillMount();
        }
        componentDidMount(){
            console.log('WrapperButton componentDidMount');
             super.componentDidMount();
        }
        handleClick = ()=>{
            this.setState({number:this.state.number+1});
        }
        render(){
            console.log('WrapperButton render');
            let renderElement = super.render();
            let newProps = {
                ...renderElement.props,
                ...this.state,
                onClick:this.handleClick
            }
            return React.cloneElement(
                renderElement,
                newProps,
                this.state.number
            );
        }
    }
}
let WrappedButton = wrapper(Button);
export default WrappedButton
```

## react.cloneElement原理
```js
function cloneElement(element, newProps, ...newChildren) {
    //处理children,newChildren会覆盖element上的children
    let oldChildren = element.props && element.props.children;
    let children = [...(Array.isArray(oldChildren) ? oldChildren : [oldChildren]), ...newChildren]
        .filter(item => item !== undefined)
        .map(wrapToVdom);
    if (children.length === 1) children = children[0];
    
    let props = { ...element.props, ...newProps, children };
    return { ...element, props };
}
```


## 顺便学一个类似于插槽的写法,renderProps渲染函数

传递给组件 某个属性,或 子节点 可以是一个函数

该函数返回的是一个react元素,子组件内部可调用该函数创建DOM.

```js
import React from 'react';

class MouseTracker extends React.Component {
    constructor(props) {
        super(props);
        this.state = { count: 0 };
    }
    handleMouseMove = (event) => {
        this.setState({ count: this.state.count + 1 });
    }
    render() {
        return (
            <div onMouseMove={this.handleMouseMove} style={{ border: '3px solid black', margin: '10px' }}>
                <div>调用此组件时,子组件整个是个返回react元素的函数</div>
                {this.props.children(this.state)}
            </div>
        );
    }
}

class MouseTracker2 extends React.Component {
    constructor(props) {
        super(props);
        this.state = { count: 0 };
    }

    handleMouseMove = (event) => {
        this.setState({ count: this.state.count + 1 });
    }

    render() {
        return (
            <div onMouseMove={this.handleMouseMove} style={{ border: '3px solid black', margin: '10px' }}>
                <div>调用此组件时,传了一个返回值是react元素的函数给此组件调用</div>
                {this.props.aaa(this.state)}
            </div>
        );
    }
}
const TestRenderProps = function () {
    return (
        <div>
            <MouseTracker >
                {(props) => (
                    <div style={{ border: '3px solid red', height: '200px', margin: '10px' }}>
                        {props.count}
                    </div>
                )}
            </MouseTracker >

            <MouseTracker2 aaa={(props) => (
                <div style={{ border: '3px solid red', height: '200px', margin: '10px' }}>
                    {props.count}
                </div>
            )} />
        </div>
    )
}
export default TestRenderProps
```

这个函数其实就是个函数组件,也算高阶组件的一种写法