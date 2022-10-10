---
title: Webpack模块打包分析
date: 2022-09-19 04:11:42
categories: 技术栈
tags: 
    - Webpack
---

## Webpack5模块化打包分析

模块化是前端工程化中 最为基础的一环,

源码的分块分层,组件的复用,项目模块懒加载等,都依赖于模块化的存在.

__PS:本文章使用的Webpack配置如下:__
```js
const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
module.exports = {
    mode: 'development',
    devtool: false, // 不要sourcemap
    entry: './src/index.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename:'main.js',
    },
    plugins: [
        new HtmlWebpackPlugin({
            template:'./src/index.html'
        })
    ]
}
```
### CommonJS规范

有模块化,就有模块化规范,所谓的规范,便是大家约定好的代码语法,

而Webpack也会按照既定的语法,对整个项目进行打包.本质上是对源码进行正则匹配,然后替换.

前端的模块化规范有多种,这里只介绍最重要的两种: __CommonJS规范__   __ESModule规范__

其代表使用者分别是 __NodeJS__ 和  __ES6语法__.

Webpack对 __CommonJS规范__ 的打包方式代码相对简单,其语法如此次模拟文件所示

__模拟的文件结构__
```js
// index.js 引用index2.js
let index2 = require('./index2.js')
console.log(index2)
```

```js
// index2.js 导出一个字段
module.exports = 'index2'
```

那么这样简单的两个模块组成的项目，Webpack会如何实现打包呢?

多说无益，话都在源码里! __仅仅 35 行__,你上你也行.

__打包后的全部源码带注释__
```js
// 打包结束后的main.js,自执行函数,script标记加载完后立即执行
(() => {
     // key为路径,value为模块内容包裹成的函数
    var __webpack_modules__ = ({
        "./src/index2.js": ((module) => {
            module.exports = 'index2'
        })
    });

     // 如果缓存里有该模块,就使用缓存中的模块
    var __webpack_module_cache__ = {};
    function __webpack_require__(moduleId) {
        var cachedModule = __webpack_module_cache__[moduleId];
        if (cachedModule !== undefined) {
            return cachedModule.exports;
        }
        // 创建一个新模块并将其放入缓存
        var module = __webpack_module_cache__[moduleId] = {
            exports: {}
        };
        // 执行模块时 传入三个参数, module module.exports 以及 require,
        // 以供嵌套递归引用模块
        __webpack_modules__[moduleId](module, module.exports,
                                      __webpack_require__);
        // 最终返回该模块的exports
        return module.exports;
    }

    var __webpack_exports__ = {};
    // 自执行函数,分割作用域,防止变量污染
    (() => {
        // 最终,入口文件的代码开始执行
        let index2 = __webpack_require__("./src/index2.js")
        console.log(index2)
    })();
})()
```

__解析__

当文件中存在 `require()` `module.exports` 等关键字时,会被webpack识别为CommonJS模块规范

打包后的main.js会在webpack创建的 `index.html` 文件中通过添加标签 `<script defer src="main.js"></script>` 引用

1. `(() => {})()` 自执行函数,立即执行,同时具有分割模块作用域的效果

2. `__webpack_modules__` 对象储存所有加载模块,供模块互相`require()`,key为src的相对路径,value是模块内容转换成的函数

3. `__webpack_require__` 替换文件中的 `require()`, 接收key,从`__webpack_modules__`读取模块运行 并返回其`exports`

4. 上述准备完毕后,执行入口文件代码,项目启动

> 浏览器本身不支持模块化,使用函数来模拟模块化的效果,node也是如此,require exports等全局变量其实就是函数的参数
> 注意 (模块函数) 为什么有最外层的括号,该函数后续是拿出来直接执行的, 箭头函数自执行需要这样写 (()=>{})()

热身完毕，来看看最重要，最常用的 ESModule，Webpack又是如何打包的吧。

### ESModule规范

ESModule规范的语法如下，同时也是此次模拟打包的项目文件

__模拟的文件结构__
```js
// 入口文件index
import index2 from './index2'
console.log(index2)
```

```js
// 被引用文件index2
const index2 = 'index2'
export default index2
```

话不多说，直接上源码，心急的同学可以先看后面的分析，再看源码，方便理解。

(为了Word排版，做了一定的折叠。)

__打包后的全部源码带注释__
```js
(() => { // webpackBootstrap
    "use strict";
    var __webpack_modules__ = ({
        "./src/index2.js":
            ((__unused_webpack_module, __webpack_exports__,
              __webpack_require__) => {
                // 标记该模块为ESModule
                __webpack_require__.r(__webpack_exports__);
                // 通过d绑定要导出的数据到__webpack_exports__上
                __webpack_require__.d(__webpack_exports__, {
                    "default": () => (__WEBPACK_DEFAULT_EXPORT__),
                    "test": () => (test)
                });
                // 模块内的代码执行
                const __WEBPACK_DEFAULT_EXPORT__ = ('index2');
                const test = 'test'
            })
    });

    var __webpack_module_cache__ = {};
    function __webpack_require__(moduleId) {
        var cachedModule = __webpack_module_cache__[moduleId];
        if (cachedModule !== undefined) {
            return cachedModule.exports;
        }
        // 创建一个新模块并将其放入缓存
        var module = __webpack_module_cache__[moduleId] = {
            exports: {}
        };
        // 根据moduleId拿到模块,传入exports供挂载导出数据,执行该module
        __webpack_modules__[moduleId](module, module.exports,
                                      __webpack_require__);
        return module.exports;
    }

    (() => {
        // 绑定definition对象内的属性 到 exports上,即要导出的而数据
        __webpack_require__.d = (exports, definition) => {
            for (var key in definition) {
                // definition: { "default": () => (...), "test": () => (test) }
                // definition上有的属性，exports上没有的属性，就绑定上去
                // 之后，外部模块使用如test属性时，实际上是调用`() => (test)`，
                // 由于闭包原则，此时会拿到内部模块此test变量的最新值
                // 这就是harmony exports
                if (__webpack_require__.o(definition, key) && 
                    !__webpack_require__.o(exports, key)) {
                    Object.defineProperty(exports, key, { 
                        enumerable: true, get: definition[key]});
                }
            }
        };
    })();

    (() => {
        // 判断是否有某属性
        __webpack_require__.o = (obj, prop) => (
            Object.prototype.hasOwnProperty.call(obj, prop)
        )
    })();

    (() => {
        // 为该模块的export新增__esModule属性,
        // 以供处理混合使用 ESModule 和 CommonJS 的情况
        __webpack_require__.r = (exports) => {
            // 如果浏览器支持 Symbol属性,就使用Symbol进行属性定义
            // 注:Symbol可以在几乎所有框架内看到,用于作为独一无二的属性Key值
            if (typeof Symbol !== 'undefined' && Symbol.toStringTag) {
                Object.defineProperty(exports, Symbol.toStringTag, {
                    value: 'Module'
                });
            }
            Object.defineProperty(exports, '__esModule', { value: true });
        };
    })();

    // 开始处理index模块，入口模块，整个程序开始运行
    var __webpack_exports__ = {};
    (() => {
        // 标记其导出为ESModule
        __webpack_require__.r(__webpack_exports__);
        // 执行index2模块，拿到其exports
        var _index2__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(
            "./src/index2.js"
        );
        // 执行index主要代码
        console.log(_index2__WEBPACK_IMPORTED_MODULE_0__["default"])
        console.log(_index2__WEBPACK_IMPORTED_MODULE_0__.test)
    })();
})()
```

可以看到与CommonJS规范 __几乎相同__ ！！！

实现了 __三个重要部分__:

`__webpack_modules__` 文件路径为key,包裹为函数的模块为value 的Map结构
`__webpack_require__` 函数类型,实现导入功能(`import`)
`__webpack_exports__` 对象类型,实现导出功能(`export`)

`__webpack_require__`,通过 key(文件路径) 从 Map`__webpack_modules__`
                        获取到 引用的 模块函数 并执行,执行时

传入`__webpack_exports__`对象 供 被引用的模块函数 导出数据

传入`__webpack_require__`函数 供 被引用的模块函数 递归调用 引用模块


__三个工具函数__:
`__webpack_require__.o` 判断某对象是否有某属性
`__webpack_require__.r` 将exports对象标记为ESModule
`__webpack_require__.d` 通过给exports对象设置getter属性,绑定要导出的数据

### 总结

不同设置 不同模块化的规范 都会影响 Webpack打包后的代码

这些都不影响其模块化打包的 __核心逻辑__:

1. 实现导出: 将`__webpack_exports__`对象传入 模块函数供挂载,

2. 实现导入: 使用一个全局对象作为储存所有模块的Map结构,

   ​		导入函数`__webpack_require__`自动在该Map下检索模块并执行

3. 使用函数模拟模块: 引用模块时才执行该模块代码,隔离各模块作用域

4. 从入门模块开始执行,递归调用运行模块,整个项目开始启动

Webpack最后再将打包好的main.js包装为Script标签,插入准备好的模板HTML文件.

试想一下,用户访问网页,nginx返回index.html,浏览器执行到script标签时

又从服务器请求main.js资源, 加载完成之后开始执行main.js,

整个框架开始运作,根据代码在body中插入各类DOM结构

整个web应用便这样运行了起来.
### 后记

Webpack替我们抹平了多种规范,写法的差异,让我们的 编码更轻松,源码更优雅

这篇文章讲解了 相对简单 最基础 也最容易产生疑惑的 模块化原理,

而这只是webpack学习序幕的第一步.

很多源码就是这样,不了解时会觉得深不可测,查找资料研究以后会感叹大道至简.