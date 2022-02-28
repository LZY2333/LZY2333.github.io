---
title: Node的Git上传脚本
date: 2022-01-20 19:30:12
categories: 经验帖
tags: 
    - node
---

# Node的Git上传脚本

由于我自己用git的时候每次都是重复的 3个操作

`git add .`/ `git commit -m"XXX"`/`git push` 

希望能写个node脚本一句话解决,发现了这个Simple Git包

还挺好用

## Simple Git

[Simple Git npm包介绍页](https://www.npmjs.com/package/simple-git)

新建一个文件,我这里叫`bin.js`

```js
const simpleGit = require('simple-git');
const git = simpleGit();
git
.init()
.add('.')
.commit(global.process.argv[2])
.push([],()=> {
    console.log("Push to master success");
})
```

`npm i` 更新一下包,自动下载simple-git

命令行敲 `node bin my-message` 就OK了，详细的以后再去研究