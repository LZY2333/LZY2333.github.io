---
title: 微前端中的SystemJS
date: 2022-09-14 23:24:22
categories: 技术栈
tags: 
    - 微前端
---

## 微前端中的SystemJS

### 微前端

#### 第一步，解决了什么痛点:
__大应用拆分__
__渐进式技术栈升级__

附带优势:
__多团队合作，独立部署__
__技术栈无关__

#### 第二步，实现了什么功能:
__沙箱:CSS隔离，JS隔离，路由隔离__
__微应用调度__

#### 第三步，如何实现沙箱和微应用调度....
qiankun:   实现沙箱，实现微应用接入配置简化，无痛接入
singleSpa: 实现基于路由进行微应用调度，定义了微应用生命周期
systemJS:  实现动态加载模块

三者是层层递进的关系，qiankun的实现依赖了singleSpa，singleSpa依赖了systemJS

本文将从从最基础的systemJS展开，systemJS的原理

### 模块规范

前端的工程化中最重要的就是模块化

模块: 实现特定功能的文件，每个文件作用域相互独立，通过暴露接口相互引用

模块化优势: 复用性 可维护性 命名冲突 按需加载

模块化规范: ESM，CJS，UMD，AMD，CMD

> 就像主机间的沟通需要各种协议，模块化也有各类规范，其实都是一种统一约定

### systemJS

systemJS 通用模块加载器，支持多种模块化规范，无window变量污染

使用systemJS可以让使用者，在指定的时机加载模块文件并运行，

### systemJS原理简述

1. 通过JSONP的方式去异步加载指定路径的模块文件。

2. 同时监听到模块文件加载，完成后执行模块代码，并触发用户注册好的回调。

> JSONP是一种跨域请求的方法，通过动态创建script标签实现。Ajax请求普通文件存在跨域问题。

### systemJS在微前端中的职责

systemJS的职责非常纯粹，动态加载模块

此处的目的仅仅是为了展示systemJS的原理，动态加载并调用了react 与 react-dom

看上去似乎普普通通，

但注意这个动态加载时机是可以由使用者控制的，那变成了 __按需动态加载__

有了systemJS的加入，qiankun拥有了 __拆分大应用__, __按需动态加载__ 模块/微应用 的功能。

### systemJS与webpack懒加载

动态加载分为两个部分 __加载模块文件__ 和 __监听加载结果__

二者 __加载模块文件__ 原理相同都是 __JSONP__ 

二者 __监听加载结果__ 原理不同，

systemJS的原理是 __监听window的属性修改__ ，
由此获取模块导出，也因此需要umd格式，模块加载并执行后挂载在window上。

webpack懒加载原理是 __window上挂载回调函数供调用__ ，
打包时被分离出去的模块，最外层会包裹一层对window上该回调函数的调用。

### 跨域(待更新)

说起JSONP，就想起跨域的知识点了，回头总结一下

__看到这里就可以结束了,后面是比较繁琐的内容.仅代表,记一下以防自己以后忘记__

### systemJS使用

这里假设一个React项目，依赖react，react-dom两个包，实现两个包b的动态加载

```js
// src/index.js
import ReactDOM from 'react-dom/client';
const root = ReactDOM.createRoot(document.getElementById('root'));
const App = () => <div><h1>Hello, World!</h1></div>
root.render(<App />); // 注意这里别写成了 App 不带尖括号的
```

```js
// webpack.config.js
const path = require('path');
module.exports = (env) => {
    return {
        // 开发模式，方便看到打包后的代码
        mode: 'development',
        output: {
            filename: 'index.js',
            path: path.resolve(__dirname, 'dist'),
            // 指定entry文件打包为systemJS的格式
            libraryTarget: 'system'
        },
        module: {
            rules: [{
                test: /\.js$/,
                loader: 'babel-loader',
                exclude: /node_modules/,
                options: {
                    presets: [
                        [ "@babel/preset-react", {"runtime": "automatic"} ]
                    ]
                }
            }]
        },
        // 不打包react,react-dom，模拟分包
        externals: ['react', 'react-dom']
    }
}
```

上述文件配置好后，运行webpack，在dist目录下生成index.js

随后再创建一个html文件，如下
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport">
    <title>Document</title>
</head>
<body>
    <div id="root"></div>
    <!-- 1. 写好模块的路径映射,注意须是umd格式 -->
    <script type="systemjs-importmap">
        {
            "imports":{
                "react-dom":"https://cdn.bootcdn.net/ajax/libs/react-dom/18.2.0/umd/react-dom.development.js",
                "react":"https://cdn.bootcdn.net/ajax/libs/react/18.2.0/umd/react.development.js"
            }
        }
    </script>
    <!-- 2. 引入systemJS -->
    <script src="https://cdn.bootcdn.net/ajax/libs/systemjs/6.10.1/system.min.js"></script>
    <!-- 3. 引入打包好的system模块规范的entry文件 -->
    <script>
        System.import('./index.js')
    </script>
</body>
</html>
```
浏览器打开index.html文件,hello world 展示完成

### systemJS原理

打包为system模块规范的 index.js文件如下
```js
System.register(["react-dom","react"], function(__WEBPACK_DYNAMIC_EXPORT__, __system_context__) {
})
```

0. 首先拿到`type="systemjs-importmap"`中的map模块路径进行解析,拿到CDN路径

1. `System.import('./index.js')` 引入 index.js 并执行`System.register(执行包的依赖包,执行包)`

    要执行执行包,首先要加载依赖包

2. 通过JSONP的方式,异步加载依赖`["react-dom","react"]`,监听load事件加载完时触发回调

```js
function load(id) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = map[id] || id; // 支持cdn的查找
        script.async = true;
        document.head.appendChild(script);
        script.addEventListener('load', function () {
        })
    })
}
```

3. 加载完的script都会自动执行,umd格式的模块执行完会在window挂载一个具有自身所有API的对象.

4. systemJS 在load事件后,检查window上是否有新增属性,将其加入 执行包的执行上下文.

5. 两个依赖包都加载完成后,开始执行执行包,执行包内部会调用依赖包的API,hello world!

### systemJS简单实现

```html
<script src="https://cdn.bootcdn.net/ajax/libs/systemjs/6.10.1/system.min.js"></script>
<script>
    System.import('./index.js')
</script>
```

将index.html中 上述几行替换为下面的内容,效果不变

```html
<script>
    //  直接加载子应用, 导入打包后的包 来进行加载， 采用的规范 system规范
    // 这个地方是自己实现systemjs  
    // 1) systemjs 是如何定义的 先看打包后的结果 System.register(依赖列表,后调函数返回值一个setters，execute）
    // 2) react , react-dom  加载后调用setters 将对应的结果赋予给webpack
    // 3) 调用执行逻辑  执行页面渲染
    // 模块规范 用来加载system模块的
    const newMapUrl = {};
    // 解析 importsMap
    function processScripts() {
        Array.from(document.querySelectorAll('script')).forEach(script => {
            if (script.type === "systemjs-importmap") {
                const imports = JSON.parse(script.innerHTML).imports
                Object.entries(imports).forEach(([key, value]) => newMapUrl[key] = value)
            }
        })
    }
    // 加载资源
    function load(id) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = newMapUrl[id] || id; // 支持cdn的查找
            script.async = true;
            document.head.appendChild(script);
            // 此时会执行代码
            script.addEventListener('load', function () {
                let _lastRegister = lastRegister;
                lastRegister = undefined
                resolve(_lastRegister);
            })
        })
    }
    let set = new Set(); // 1）先保存window上的属性
    function saveGlobalProperty() {
        for (let k in window) {
            set.add(k);
        }
    }
    saveGlobalProperty();
    function getLastGlobalProperty() {  // 看下window上新增的属性
        for (let k in window) {
            if (set.has(k)) continue;

            set.add(k);
            return window[k]; // 我通过script新增的变量
        }
    }
    let lastRegister;
    class SystemJs {
        import(id) { // 这个id原则上可以是一个第三方路径cdn
            return Promise.resolve(processScripts()).then(() => {
                // 1）去当前路径查找 对应的资源 index.jsw
                const lastSepIndex = location.href.lastIndexOf('/');
                const baseURL = location.href.slice(0, lastSepIndex + 1);
                if (id.startsWith('./')) {
                    return baseURL + id.slice(2);
                }
                // http  https
            }).then((id) => {
                // 根据文件的路径 来加载资源
                let execute
                return load(id).then((register) => {
                    let { setters, execute:exe } = register[1](() => { })
                    execute = exe
                    // execute 是真正执行的渲染逻辑 
                    // setters 是用来保存加载后的资源，加载资源调用setters
                    //    console.log(setters,execute)
                    return [register[0], setters]
                }).then(([registeration, setters]) => {
                    return Promise.all(registeration.map((dep, i) => {
                        return load(dep).then(() => {
                            const property = getLastGlobalProperty()
                            // 加载完毕后，会在window上增添属性 window.React window.ReactDOM
                            setters[i](property)
                        })
                        // 拿到的是函数，加载资源 将加载后的模块传递给这个setter
                    }))
                }).then(() => {
                    execute();
                })
            })
        }
        register(deps, declare) {
            // 将毁掉的结果保存起来
            lastRegister = [deps, declare]
        }
    }
    const System = new SystemJs()
    System.import('./index.js').then(() => {
        console.log('模块加载完毕')
    })

    // 本质就是先加载依赖列表 再去加载真正的逻辑 
    // (内部通过script脚本加载资源 ， 给window拍照保存先后状态)
    // JSONP
    // single-spa 如何借助了 这个system 来实现了模块的加载
</script>

```
