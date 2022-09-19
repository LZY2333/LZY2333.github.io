---
title: Webpack基础配置
date: 2022-09-19 04:10:44
categories: 技术栈
tags: 
    - Webpack
---

## Webpack基础配置


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

[webpack5三种mode默认配置对比](https://juejin.cn/post/6957976536905416712#heading-25)

### 如何 命令行 动态启用不同的环境

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

process代表webpack运行的node进程,env代表环境变量,NODE_ENV代表一个key

通过`cross-env`可设定任意key值,包括NODE_ENV

需要先`npm i cross-env --D` 此module名意为,跨平台环境变量

因为win和mac的环境变量设置的命令行语句不同,

例如,win平台需要set命令`set NODE_ENV=production webpack`,mac平台不需要加set



__在scripts命令中注入的NODE_ENV只能被webpack的构建脚本访问，而被webpack打包的源码中是无法访问到的__

借助webpack的DefinePlugin插件,可以对源码进行替换

4. __DefinePlugin__ 设置了一些key value，用于打包的时候进行替换。也可以修改 源代码中的`process.env.NODE_ENV`,进行字面量替换.
 当然这里的`process.env.NODE_ENV` 可以是任何字符串.
 比如`'abc':'cba'`,只要webpack发现源码里有 变量类型的`abc`,就会被替换为`'cba'`

 注意:源码里的 字符串类型的 `'abc'` 则不会被替换成 `'cba'`,不会被识别
 只有 变量`abc`,会被替换为  `'cba'`,

```js
plugins: [
    new webpack.DefinePlugin({
        'process.env.NODE_ENV': 'production'
    })
]
// 配合上 cross-env NODE_ENV=production webpack,可以这样写
plugins: [
    new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
    })
]
    // 注意 使用变量时得加上 JSON.stringify(dev.production) 或 '"'+ a + '"'
    // 不加的话替换过去会没有双引号,变成 没引号的 production,从而在运行的时候被视为变量,或错误,而非字符串字面量
    // 当然这个字符串也可以随便写 abcd啥的,就是个编译时的字符串替换
```

5.__最佳实践__ cross-env修改node中的变量,webpack读取到node中的变量,再通过DefinePlugin 传给源码进行字面量替换

6. `dotenv` 包,可以自动加载`.env`文件下的 `key/value`,进 `process.env`

### 插件

插件可以执行范围更广的任务

比如: 打包优化 资源管理 输入环境变量 生成输入文件


## loader与插件配置

### webpack-dev-server

__相关配置__
```js
devServer: {
    port: 8080,
    open: true,
    static: path.resolve(__dirname, 'public')
}
```

__原理__
1. 也是会用webpack从入口文件进行打包，然后输出到输出目录，
2. 此输出目录 只在内存,未写入硬盘,在文件夹里看不到
3. 然后会启动http服务器预览我们的项目 

`localhost:8080/xxx` 可以获取到打包好的项目文件.
`static` 配置项指将指定文件夹作为静态目录文件,也可以直接`localhost:8080/xxx`

http服务器内部其实是 __express实现的__,托管了两个静态文件根目录

### StyleLoader CSSLoader postcss

styleLoader 处理cssLoader导出的叔祖,通过Style标签,插入DOM
cssLoader 对import和url()进行处理,将样式作为字符串存为数组,然后作为JS导出
postcss 处理CSS浏览器兼容性,加入各厂商前缀.

需要额外的配置文件`postcss.config.js`,
或package.json中添加 `"browserslist": {"development" : ["xxx"]}`

### 读取图片

webpack4 关于图片需要 使用file-loader url-loader 
file-loader=>asset/resource 把图片拷贝到输出目录里去，返回一个输出后的路径，包括文件
url-loader=>asset/inline 不拷贝文件，直接把源文件变成base64字符串内嵌到输出结果

webpack5 不再需要,内置了

__配置方法__
```JS
{
    {
        test: /\.png$/,
        // use:["file-loader"],
        type: 'asset/resource',
        generator: {
          filename: 'png/[hash][ext]',// 指定文件位置
        },
    },
    {
        test: /\.ico$/, // 会把ico文件变成base64字符串并返回给调用者
        // use:["url-loader"],
        type: 'asset/inline',
    },
    {
        test: /\.jpg$/, // 会把txt内容直接返回
        // use:["raw-loader"],
        type: 'asset', // 表示可以根据实际情况进行自选择是resource还inline
        parser: {
          dataUrlCondition: {
            maxSize: 4 * 1024, // 如果文件大小小于4K就走inline,如果大于4K就resource
          },
        },
    }
}
```

__如果是服务器地址,那图片的打包路径怎么办?__

webpack 集成了插件`clean-webpack-plugin`使用配置 `output:{clean:true}` 打包前清除 dist目录

webpack-merge包用于 合并不同环境的配置文件

### JS兼容性 Babel

__配置方法__
```js
module: {
    rules: [
      {
        test: /\.jsx?$/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react'],
            plugins: [
              ['@babel/plugin-proposal-decorators', { legacy: true }],
              ['@babel/plugin-proposal-private-property-in-object', { loose: true }],
              ['@babel/plugin-proposal-private-methods', { loose: true }],
              ['@babel/plugin-proposal-class-properties', { loose: true }],
            ],
          },
        },
      },
    ]
}
```

babel-loader  
@babel/core    
@babel/preset-env
@babel/preset-react
@babel/plugin-proposal-decorators
@babel/plugin-proposal-private-property-in-object
@babel/plugin-proposal-private-methods
@babel/plugin-proposal-class-properties

源文件 的 ES6 JSX 转换 为浏览器能读懂的ES5

1. `babel-loader` 读取源文件 调用`@babel/core` 进行转换,但也不认识各种语法
2. `@babel/core` 调用插件进行转换各类语法
3. 各类语法太多,不可能一个个引用,所以有了`preset`
4. `@babel/preset-env` 转ES5要用的插件包,`@babel/preset-react` 转换React语法要的插件包
5. `plugins` 代表转换需要的额外插件,装饰器 私有属性 私有方法 类的属性
6. `plugins` 可以写成二维数组,每个插件的第二个参数 是该插件的配置

### ESLint预校验

__设置方法__
```js
module: {
    rules: [
      {
        test: /\.jsx?$/,
        loader: 'eslint-loader',
        exclude: /node_modules/,
        options: { fix: true },
        enforce: 'pre', // 指定loader的类型 pre normal post inline
      }
    ]
}
```
enforce 决定配置的执行顺序,比如两个jsx的配置,pre会先执行.

`.eslintrc.js` 进行配置

```js
module.exports = {
  // root: true 代表根规则,规则是可以继承的,如这里extends继承了,root就注释掉
  parser: 'babel-eslint', // 识别ES6语法等等
  extends: 'airbnb', // 使用别人配好的语法
  parserOptions: {
    sourceType: 'module', //
    ecmaVersion: 2015,  // ES6
  },
  env: {
    browser: true,
    node: true,
  },
  rules: {
    'no-param-reassign': 'off', // 覆盖airbnb的设置
    'no-console': 'off',
    'no-unused-vars': 'off',
    'linebreak-style': 'off',
  },
};
```

__VSCode插件 ESLint 可以编码时对源代码进行实时检查__

__Webpack插件 ESLint-loader 会在编译时进行报错提示或修复__

在项目下 创建 `.vscode`文件夹 创建`setting.json` 可对vscode的设置统一更改

这样可以给项目成员统一开启ESLint自动修复
```js
{
  "eslint.validate": [
    "javascript",
    "javascriptreact",
    "typescript",
    "typescriptreact"
  ],
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```
__`.vscode`文件夹 还有哪些作用?__

### 服务器代理配置

__配置方法__
```js
devServer: {
    port: 8080,
    open: true,
    static: path.resolve(__dirname, 'public'),
    // 当你已经有一个后台接口API服务器的可以直接 代理过去,避免跨域
    proxy: {
      '/api1': {
        target: 'http://localhost:3000',
        pathRewrite: {
          '^/api': '',
          '^/home/name/api': '/home/name',
        },
      },
      '/api2': {
        target: 'http://localhost:4000',
        pathRewrite: {
          '^/api': '',
          '^/home/name/api': '/home/name',
        },
      },
    },
    // 如果你没有后台服务器，直接把mock功能直接定义在这里
    onBeforeSetupMiddleware(devServer) {
      // app其实就是webpack-dev-sever里面的express的app
      devServer.app.get('/xxx', (req, res) => {
        res.json({
          id: 1, name: 'zhufeng',
        });
      });
    },
  },
```

