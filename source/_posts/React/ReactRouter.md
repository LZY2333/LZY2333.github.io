---
title: ReactRouter
date: 2022-03-04 11:11:13
categories: 技术栈
tags: 
    - React
---

# ReactRouter

## 路由基本原理

第一种,通过监听 __哈希切换__

通过window事件hashchange监听哈希变化 `window.addEventListener('hashchange',()=>{})`

通过`window.location.hash`获取哈希路由
```js
<body>
    <div id="root"></div>
    <ul>
        <li><a href="#/a">/a</a></li>
        <li><a href="#/b">/b</a></li>
    </ul>
    <script>
        window.addEventListener('hashchange',()=>{
            console.log(window.location.hash);
            let pathname = window.location.hash.slice(1);//把最前面的那个#删除 
            root.innerHTML = pathname;
        });

    </script>
</body>
```

第二种,通过HTML5提供的 __`window.history`对象__,包含五个方法修改操作路由`pushState` `replaceState` `forward` `back` `go`

`history.pushState(state, title, url)` (url对应的状态对象,标题,设定的url)

向浏览器历史栈压入一个 路由,并将历史栈指针指向 栈顶路由,`state`会在`onpopstate`事件中传给回调函数使用

`history.replaceState()` 替换历史栈中当前指针指向的位置,不修改指针

`window.onpopstate`监听函数,给这个参数赋值函数,在这五种情况下触发,浏览器前进 浏览器后退 `history.forward(N)` `history.back()` `history.go()`


注意,`pushState()`方法 不会被 `onpopstate()`监听到,所以得自定义监听函数来监听,原理如下
```js
(function (history) {
    let oldPushState = history.pushState;
    history.pushState = function (state, title, pathname) {
        let result = oldPushState.apply(history, arguments); // 本质上是调用原本的 pushState方法,只不过多加了下面一条
         // 手动触发 window.onpushstate 方法,相当于自定义了`pushstate`事件 和 `onpushstate`监听函数
        if (typeof window.onpushstate === 'function') { 
            window.onpushstate(new CustomEvent('pushstate', { detail: { pathname, state } }));
        }
    }
})(history);
```

## 6.0以前版本的 react-router原理

从使用开始讲起

```js

ReactDOM.render(
    <Router>
        <div>
          <Route path="/" component={Home} exact/> 
          <Route path="/user" component={User} />
          <Route path="/profile" component={Profile}/>
        </div>
    </Router>
,document.getElementById('root'));
// 注意6.0 可以传标签了,标签可以方便传参 <Route path="/" element={<Home />} />
```

`<Router/>` 本质上就是一个`provider`,作为 类组件 向下传递了一个`context`.

`<Route/>` 作为 类组件 接收到`context`,根据其内的`history`对象,与自己的path进行匹配,匹配上了就是渲染对应组件.

`<Router/>` 同时会监听路由,每次路由变动 `this.setState({location})`,读取路由并修改向下传递的`context`

```js
import React from 'react'
import RouterContext from './RouterContext';
class Router extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            location:props.history.location
        }
        //当路径发生的变化的时候执行回调
        this.unlisten = props.history.listen((location)=>{
            this.setState({location});
        });
    }
    componentWillUnmount(){
        this.unlisten&&this.unlisten();
    }
    render(){
        let value = {//通过value向下层传递数据
            location:this.state.location,
            history:this.props.history
        }
        return (
            <RouterContext.Provider value={value}>
                {this.props.children}
            </RouterContext.Provider>
        )
    }
}
export default Router;
```

```js
import React from 'react'
import RouterContext from './RouterContext';
class Route extends React.Component{
    static contextType = RouterContext
    render(){
        const {history,location} = this.context;
        const {path,component:RouteComponent} = this.props;
        const match = location.pathname === path;
        let routeProps = {history,location};
        let element=null;
        if(match){
            element= <RouteComponent {...routeProps}/>
        }
        return element;
    }
}
export default Route;
```

6.0 版本全部用 函数组件 + hooks来实现了,用法也有一定差异

## 6.0版本 react-router

用法
```js
ReactDOM.render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Home name="lzy" />} />
      <Route path="/user" element={<User />} />
      <Route path="/profile" element={<Profile />} />
    </Routes>
  </BrowserRouter>,
  document.getElementById('root')
);
```

__原理__

从外到内 分别是:
`BrowserRouter` => `Router` => `NavigationContext` => `LocationContext` => `Routes` => `Route`

`BrowserRouter` 负责给Router传递路由信息,监控路由并更新路由信息
    `navigator`      (`history`对象) 子组件可通过`NavigationContext`,拿到该对象调用函数进行路由跳转
    `navigationType` 当前触发的 路由事件类型 'POP' 'PUSH' 
    `location`       当前的 路由 `{ pathname: '', state: '' }`
    `children`       孩子节点原样传递

`Router` 负责向`Routes`传递两个context,`NavigationContext` 和 `LocationContext`,并渲染`children`(也就是`Routes`)

`Routes` 负责 拿到`LocationContext`里的 路由,拿到`Route`数组 遍历`path`正则匹配, 渲染`element`

`BrowserRouter`简单实现如下 
```js
import { createBrowserHistory, createHashHistory } from '../history';
function BrowserRouter({ children }) { //
    let historyRef = React.useRef(null);
    if (historyRef.current === null) {
        historyRef.current = createBrowserHistory();
    }
    let history = historyRef.current; // history对象,包含 location action 及 路由控制函数
    let [state, setState] = React.useState({
        location: history.location
        action: history.action,//POP PUSH 
    });

    // history.listen,内部是 history的跳转方法被调用时,就会notify 这些listener,并传入 { location:{pathname,state}, action }
    // 然后这里调用 setState, 触发更新渲染,然后 history更新, useState 从history拿到新state,创建新setState,等待调用
    React.useLayoutEffect(() => history.listen(({ location, action }) => {
        setState({ location, action });
    }), [history]); // 潜比较history没变化,就一直复用`() =>`这个函数,不会每次都创建新的`() =>`.放入微任务,执行,挂载listener
    return (
        <Router
            navigator={history}
            location={state.location}
            navigationType={state.action}
            children={children}
        />
    )
}
```

`Router`简简单单,如下
```js
/**
 * 路由容器
 * @param {*} children 儿子 
 * @param {*} navigator 历史对象，其实就是history
 * @param {*} location 地址对象 {pathname:"当前路径"}
 * @returns 
 */
function Router({ children, navigator, location }) {
    return (
        <NavigationContext.Provider value={{ navigator }}>
            <LocationContext.Provider value={{ location }}>
                {children}
            </LocationContext.Provider>
        </NavigationContext.Provider>
    )
}
```

`Routes` 就是 拿到`LocationContext`里的路由,拿到`Route`里的`element`和`path`数组, 正则选择渲染哪个`element`

## 继承window.history对象,监听操作路由

`<BrowserRouter/>` 里面 `history` 提供了路由的信息, 由`createBrowserHistory()`函数创建

原理 就是是拿到`window.history` 再进行个性化的修改,提供给子组件使用.

`<HashRouter/>`同理, 与`<BrowserRouter/>`内部函数属性一模一样,这样做抹平了差异,想用哪个随时替换,子组件调用的方法都是那几个.

`<HashRouter/>` 没有栈,内部模拟了 浏览器的history栈.

__自定义的history对象__
`state`就是更新页面要传递的参数
`push(pathname,state)`时 要更新页面 要用到传入的新state, onpopstate时 更新页面也要用到 以前push传入的 state
```js
const history = {
    action: 'POP',
    go,
    goBack,
    goForward,
    push, // 只有这个方法action是`PUSH`
    listen,
    location: { pathname: window.location.pathname, state: window.location.state }
}
```

__createBrowserHistory()__
采用了 发布/订阅 模式
```js
function createBrowserHistory() {
    let globalHistory = window.;
    let state;
    const history = {
        action: 'POP',
        go,
        goBack,
        goForward,
        push, // 只有这个方法action是`PUSH`
        listen,
        location: { pathname: window.location.pathname, state: window.location.state }
    }
    let listeners = [];//存放所有的监听函数

    function go(N) {
        globalHistory.go(N);
    }
    function goBack() {
        globalHistory.back();
    }
    function goForward() {
        globalHistory.forward();
    }
    function push(pathname, nextState) { // pathname 路径名，可能是字符串，也可能是{pathname,state}
        const action = 'PUSH';
        if (typeof pathname === 'object') {
            state = pathname.state;
            pathname = pathname.pathname;
        } else {
            state = nextState;
        }
        globalHistory.pushState(state, null, pathname);
        notify({ location: { pathname, state }, action }); // pushState 和 onpopstate 都调用notify,解决了pushState 没有被监听的问题.
    }
    window.onpopstate = () => { // 这个事件的state 历史路由栈中,以前push进去的
        let location = { pathname: window.location.pathname, state: globalHistory.state }
        notify({ location, action: 'POP' });
    }

    function notify(newState) {
        //把newState上的属性都拷贝到history上
        Object.assign(history, newState);//newState {location,action}
        history.length = globalHistory.length;
        listeners.forEach(listener => listener({ location: history.location, action: history.action }));
    }

    function listen(listener) {
        listeners.push(listener);
        return () => {
            listeners = listeners.filter(item => item !== listener);
        }
    }
    return history;
}
export default createBrowserHistory;
```

## 路径参数的原理

`<Route path="/post/:id" element={<Post />} />`

在 `Routes` 内遍历children时,会拿到 `Route`内的`path`,根据`path`拼好正则. 正则中使用了分组

然后拿正则去匹配当前 loaction下的 pathname,查看路由是否匹配 并 拼好路径参数

匹配的结果 match对象会 作为props的一部分 传给 `Post(props)`
```js
function Post(props) {
    console.log(props)
    props = {
        match: {
            params: {id:'100'},
            path: "/post/:id",
            pathname: "/post/100"
        }
    }
}
```

## Link NavLink Navigate的原理

`Link` 实际上就是一个组件,从historyContext 拿到了history,调用了push方法

`useNavigate()`返回的`navigate()`,就是`history.push()`
```js
// 使用方式 <Link to="/">首页</Link>
export function Link({ to, ...rest }) {
    let navigate = useNavigate();// navigate  history
    function handleClick(event) {
        event.preventDefault();
        navigate(to);
    }
    return (
        <a {...rest} href={to} onClick={handleClick} />
    )
}

export function useNavigate() {
    let { navigator } = React.useContext(NavigationContext);
    let navigate = React.useCallback((to) => { // 用hooks缓存起来,防止每次都创建一个新的
        navigator.push(to);
    }, [navigator]);
    return navigate; // 实际上就是 拿到context,返回history对象
}
```

`NavLink` 内部就是用了`Link`组件,会给使用者的`className``style`,传一个`isActive`变量代表 当前标签的路由是否激活
```js
<NavLink
    to="/"
    end
    style={({ isActive }) => isActive ? activeStyle : {}}
    className={({ isActive }) => isActive ? 'active' : ''}
>首页</NavLink>
```

`Navigate` 是一个组件,但是不渲染任何DOM,直接拿到history,调用push. 这里是跳转在 __宏任务__ 内
```js
// 效果:放最后一个Route,没匹配到路由就跳回/
<Route path="/home" element={<Navigate to="/" />} />

export function Navigate({ to }) {
    let navigate = useNavigate();
    React.useEffect(() => {
        navigate(to);
    });
    return null;
}
```