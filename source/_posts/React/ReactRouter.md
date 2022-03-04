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

第二种,通过HTML5提供的 __`window.history`对象__

`history.pushState(stateObject, title, url)` (url对应的状态对象,标题,设定的url)

向浏览器的历史堆栈,压入

`history.replaceState()`

`window.onpopstate`