---
title: Webpack5模块打包分析
date: 2022-09-19 04:11:42
categories: 技术栈
tags: 
    - Webpack
---

## Webpack5模块打包分析

JS模块化规范有多种,就不展开分析了,

这里 主要分析一下 Webpack 对 ESModule 的打包方式, 所有模块都是大同小异


只要对Webpack按需配置,就可以完成 



webpack的打包本质上是 按规则正则匹配源码 然后替换为 新的代码,

在这一替换的过程中,实现了 模块合并 代码优化 浏览器兼容 等一系列功能

其中模块化是前端工程化中不可缺少的一环,源码的分块分层,组件的复用,项目模块懒加载等,都依赖于模块化的存在.


### CommonJS规范

Webpack对该模式的打包方式代码较为简单,先做个基础

当文件中存在 `require()` `module.exports` 等关键字时,会被webpack识别为CommonJS模块规范

打包后的main.js会在webpack创建的 `index.html` 文件中通过添加标签 `<script defer src="main.js"></script>` 引用

1. `(() => {})()` 自执行函数,立即执行,同时具有分割模块作用域的效果

2. `__webpack_modules__` 对象储存所有加载模块,供模块互相`require()`,key为src的相对路径,value是模块内容转换成的函数

3. `__webpack_require__` 替换文件中的 `require()`, 接收key,从`__webpack_modules__`读取模块运行 并返回其`exports`

4. 上述准备完毕后,执行入口文件代码,项目启动

> 浏览器本身不支持模块化,使用函数来模拟模块化的效果,node也是如此,require exports等全局变量其实就是函数的参数
> 注意 (模块函数) 为什么有最外层的括号,该函数后续是拿出来直接执行的, 箭头函数自执行需要这样写 (()=>{})()

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

__打包后的全部源码注释__
```js
// 打包结束后的main.js,自执行函数,script标记加载完后立即执行
(() => {
    var __webpack_modules__ = ({ // key为路径,value为模块内容包裹成的函数
        "./src/index2.js": ((module) => {
            module.exports = 'index2'
        })
    });

    var __webpack_module_cache__ = {}; // 如果缓存里有该模块,就使用缓存中的模块
    function __webpack_require__(moduleId) {
        var cachedModule = __webpack_module_cache__[moduleId];
        if (cachedModule !== undefined) {
            return cachedModule.exports;
        }
        // 创建一个新模块并将其放入缓存
        var module = __webpack_module_cache__[moduleId] = {
            exports: {}
        };
        // 执行模块时 传入三个参数, module module.exports 以及 require,以供嵌套递归引用模块
        __webpack_modules__[moduleId](module, module.exports, __webpack_require__);
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

### ESModule规范

可以看到实现了三个重要部分:

`__webpack_modules__` 文件路径为key,包裹为函数的模块为value 的Map结构
`__webpack_require__` 函数类型,实现导入功能(`import`)
`__webpack_exports__` 对象类型,实现导出功能(`export`)

`__webpack_require__`,通过 key(文件路径) 从 Map`__webpack_modules__`获取到 引用的 模块函数 并执行,执行时

传入`__webpack_exports__`对象 供 被引用的模块函数 导出数据

传入`__webpack_require__`函数 供 被引用的模块函数 递归调用 引用模块


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

__打包后的全部源码注释__
```js
(() => {
    "use strict";
    var __webpack_modules__ = ({
        "./src/index2.js":
            ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {
                __webpack_require__.r(__webpack_exports__);
                __webpack_require__.d(__webpack_exports__, {
                    "default": () => (__WEBPACK_DEFAULT_EXPORT__)
                });
                const index2 = 'index2'
                const __WEBPACK_DEFAULT_EXPORT__ = (index2);
            })
    });

    var __webpack_module_cache__ = {}; // 依旧是缓存
    function __webpack_require__(moduleId) {
        var cachedModule = __webpack_module_cache__[moduleId];
        if (cachedModule !== undefined) {
            return cachedModule.exports;
        }
        // 创建一个新模块并将其放入缓存
        var module = __webpack_module_cache__[moduleId] = {
            exports: {}
        };
        __webpack_modules__[moduleId](module, module.exports, __webpack_require__);
        return module.exports;
    }

    (() => {
        // 定义getter函数 for harmony exports(这里没搞懂什么叫harmony exports)
        __webpack_require__.d = (exports, definition) => {
            for (var key in definition) {
                if (__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
                    Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
                }
            }
        };
    })();

    (() => {
        __webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
    })();

    (() => {
        // 为该模块的export新增__esModule属性,以供处理混合使用 ESModule 和 CommonJS 的情况
        __webpack_require__.r = (exports) => {
             // 如果浏览器支持 Symbol属性,就使用Symbol进行属性定义
             // 注:Symbol可以在几乎所有框架内看到,用于作为独一无二的属性Key值
            if (typeof Symbol !== 'undefined' && Symbol.toStringTag) {
                Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
            }
            Object.defineProperty(exports, '__esModule', { value: true });
        };
    })();

    var __webpack_exports__ = {};
    (() => {
        __webpack_require__.r(__webpack_exports__);
        var _index2__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("./src/index2.js");

        console.log(_index2__WEBPACK_IMPORTED_MODULE_0__["default"])
    })();
})()
```

### 按需加载

### 总结

不同设置 不同模块化的规范 都会影响 Webpack打包后的代码

这些都不影响其模块化打包的 __核心逻辑__:

1. 实现导出: 将`__webpack_exports__`对象传入 模块函数供挂载,

2. 实现导入: 使用一个全局对象作为储存所有模块的Map结构,导入函数`__webpack_require__`自动在该Map下检索模块并执行

3. 使用函数模拟模块: 引用模块时才执行该模块代码,隔离各模块作用域

4. 从入门模块开始执行,递归调用运行模块,整个项目开始启动

### 后记

Webpack替我们抹平了多种规范,写法的差异,让我们的 编码更轻松,源码更优雅

这篇文章讲解了 相对简单 最基础 也最容易产生疑惑的 模块化原理,而这只是webpack学习序幕的第一步.

很多源码就是这样,不了解时会觉得深不可测,查找资料研究以后会感叹大道至简,豁然开朗.

如果你非常喜欢我的Webpack系列,请点赞支持,后续可能推出Webpack 按需加载, 热更新, AST, Tree-Shaking 等原理的讲解.

如果你对框架技术更为关注,请在评论区留言,Vue 和 React 源码也可以拉出来和大家唠一唠.



感谢以下大佬的文章

[Webpack 将代码打包成什么样子？](https://juejin.cn/post/6844903760188145672#comment)

[webpack模块化原理-ES module](https://segmentfault.com/a/1190000010955254)

[webpack模块化原理-Code Splitting](https://segmentfault.com/a/1190000011435407)

[commonjs 与 esm 的区别](https://juejin.cn/post/6844903861166014478)


为什么webpack可以将任何资源转换为浏览器认识的资源？

webpack本质上应该是正则匹配字符串并拼接

cmj导出值 

esm'导出引用， esm的导出是箭头函数，并且是重写get方法，会实时去原模块拿最新的值

但是cmj如果导出的是一个对象，那还是会与原模块实时同步的，因为对象是同一地址