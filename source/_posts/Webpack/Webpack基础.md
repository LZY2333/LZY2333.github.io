---
title: Webpack基础
date: 2021-11-17 10:56:56
categories: 技术栈
tags: 
    - Webpack
---

# Webpack基础

## 大纲

- webpack5安装的基本使用
- 入口、输出、loader、plugin、mode模式
- 开发环境配置
  - 开发服务器
  - 支持CSS
  - 支持less sass
  - 处理CSS兼容
  - 处理JS和JS兼容
  - 如何配置使用图片等静态资料
  - eslint代码校验
  - sourcemap
  - 打包第三方包
  - 拷贝静态文件
  - 如何配置服务器代码
- 生成环境配置
  - 压缩JS CSS HTML
  - 提取单独CSS文件

## 基础配置

### webpack.config.js

webpack默认配置文件

### 入口

指示webpack应该从哪个文件开始打包，用来作为内部依赖的图构建的起点

在webpack5里，如果没有额外配置的话，入口文件就是`src\index.js`
 

__package.json中的命令如何执行__

package.json文件 的 scripts中添加 `build":"webpack"`命令

执行时npm从当前目录下`node_modules`文件夹bin目录下找同名文件`webpack.cmd`

`webpack.cmd`指向 `../webpack/bin/webpack.js`,

也就是`node_modules`下的`webpack`模块的的`bin`文件夹下的`webpack.js`


### loader

webpack默认情况下只能处理和理解javascript和json文件

如果要想引入其它类型的文件，比如css,需要对源文件进行加载和转换，转成JS  

比如处理CSS文件,配置文件以`/\.css$/`结尾,就用 `['style-loader', 'css-loader']`

两个loader进行处理,__从右向左执行__

1.先读出源文件 index.css

2.把文件内容传递给css-loader,css-loader可以处理css中的@import和url语法,

处理完之后会把内容传递给style-loader

3.style-loader的作用是把CSS转换成style标签插入页面中


### mode 

代表当前编译 的环境

`none` 未指定

`production` 生产环境 webpack会针对构建结果进行生成环境的优化 默认值

`development` 开发环境 webpack不会对代码进行压缩

日常项目开发中，我们会有两套环境

一套是开发环境 用于开发时使用，构建结果用于本地的开发调试，不压缩代码，打印日志，包含sourcemap文件

一套是构建后直接上线的 代码一般都是压缩后，不打印LOG，静态文件也不包含sourcemap

webpack4之后引入mode概念


__production mode 时__

会将 `process.env.NODE_ENV` 的值设为 `development`

默认会 __启用各种性能优化的功能__，包括构建结果优化以及 webpack 运行性能优化

启用 NamedChunksPlugin 和 NamedModulesPlugin

__development mode 时__

会将 `process.env.NODE_ENV` 的值设为 `production`

会 __开启 debug 工具__，运行时打印详细的错误信息，以及更加快速的增量编译构建

启用 FlagDependencyUsagePlugin, FlagIncludedChunksPlugin, 

ModuleConcatenationPlugin, NoEmitOnErrorsPlugin, OccurrenceOrderPlugin, 

SideEffectsFlagPlugin 和 UglifyJsPlugin

__development none 时__,不启动任何额外的插件


__开发环境__,需要生成 sourcemap 文件,打印 debug 信息,hot reload 的功能

__生产环境__,可能需要分离 CSS 成单独的文件,以便多个页面共享同一个 CSS 文件

,需要压缩 HTML/CSS/JS 代码,需要压缩图片


__如何 命令行 动态启用不同的环境__

mode一般不在配置文件中写死,而在命令行中设置.

`webpack`命令 的mode默认为production

`webpack serve`命令 的mode默认为development

1. `webpack --mode=production` 可填入两种模式,直接设置模块内的`process.env.NODE_ENV`的值

> process.env.NODE_ENV变量无法在项目编译完运行时模块内访问,在编译时已被替换为字面量如`'production'`
> mode优先级顺序: 默认mode(production) < 配置文件webpack.config.js里的mode
> < package.json中的--mode的配置


2. `webpack --env`,命令行中用来设置webpack配置文件的函数参数

```js
// 可以在webpack配置文件中 的第一个参数获取到env
module.exports = (env,argv) => {
    console.log('env',env);// env是个对象
    // 假设命令行 webpack --env=abc
    // 则env.abc === true
}
```


3.`cross-env NODE_ENV=production webpack` 可改变node环境变量 `process.env.NODE_ENV`

process.env.NODE_ENV 在 src内的 是被webpack识别并捕获替换的字面量

process.env.NODE_ENV 在 webpack配置文件中 是undefined

process代表webpack运行的node进程,env代表环境变量,NODE_ENV代表一个key

通过`cross-env`可设定任意key值,包括NODE_ENV

需要先`npm i cross-env --D` 此module名意为,跨平台环境变量

因为win和mac的环境变量设置的命令行语句不同,

例如,win平台需要set命令`set NODE_ENV=production webpack`,mac平台不需要加set


4. __DefinePlugin__ 用来设置模块内的全局变量,可以用于模块内的字符串替换

```js
plugins: [
    new webpack.DefinePlugin({
        'process.env.NODE_ENV': 'production'
    }) // 当然这个production也可以使用变量,比如读dev里的production
    // 但是注意 使用变量时得加上 JSON.stringify(dev.production) 或 '"'+ a + '"'
    // 不加的话替换过去会没有双引号,从而在运行的时候被视为变量,或错误,而非字符串字面量
    // 当然这个字符串也可以随便写 abcd啥的,就是个编译时的字符串替换
]
```

__cross-env 用的最多__ 因为webpack.config文件能拿到,又能用于修改mode值,从而修改模块内.

### 插件

插件可以执行范围更广的任务

比如: 打包优化 资源管理 输入环境变量 生成输入文件


## loader与插件配置

### webpack-dev-server开发服务器的原理
- 也是会用webpack从入口文件进行打包，然后输出到输出目录，这个输出是输出的内存文件系统里去了
- 然后会启动http服务器预览我们的项目 



less 用于把less编译成CSS
less-loader 在webpack中使用，负责调用less包
node-sass 用于把sass编译成CSS
sass-loader

background-image: url(~image/kf.jpg);
//为了引入node_modules下面的资源文件，比如说bootstrap，可以添加 ~前缀


CSS兼容 性和importLoaders
importLoaders 允许或者说启动几个数量的loaders应用在import 的文件


webpack4 关于图片需要 使用file-loader url-loader 
webpack5 不再需要
file-loader=>asset/resource 把图片拷贝到输出目录里去，返回一个输出后的路径，包括文件
url-loader=>asset/inline 不拷贝文件，直接把源文件变成base64字符串内嵌到输出结果

js兼容性
polyfill preset-env preset-react
eslint
eslint prettier git hooks 放在一起
source可以放在一起


1.直接引入
每次使用都需要手工导入
2.插件引入
如果使用webpack.ProvidePlugin插件引入的话，则不再需要你在模块手工引入
3.但在没有全局变量，你在模块外是不能访问的
如果想在任何地方访问此变量，需要把此变量设置为环境变量 `window.isarray`
expose-loader 可以把模块添加到全局对象上
以上三种方式，都需要打包库的代码，不能使用CDN

