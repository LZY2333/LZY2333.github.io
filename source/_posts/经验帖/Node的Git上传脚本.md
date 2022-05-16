---
title: Node的Git上传脚本
date: 2022-03-12 20:06:03
categories: 经验帖
tags: 
    - node
---

# Node的Git上传脚本

由于我自己用git的时候每次都是重复的 3个操作

`git add .`/ `git commit -m"XXX"`/`git push` 

估计能写个node脚本一句话解决,发现了这个Simple Git包

好像挺好玩

## Simple Git

[npm包](https://www.npmjs.com/package/simple-git)

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

命令行敲 `node bin my-message` 就OK了，详细的以后再去研究