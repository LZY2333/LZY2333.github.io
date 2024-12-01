---
title: Rspress重构博客
date: 2024-09-01 16:19:19
categories: 技术栈
tags: 
    - Rspack
---

## Rspress

## 碰上的问题

### 1. yarn 无法识别

记得node是内置yarn的，直接`yarn -v` not find

`npm install -g yarn`,再`yarn -v` 还 not find

[必须求助官方文档了](https://www.yarnpkg.cn/getting-started/install)

总结一下， Node.js >=16.10 内置yarn，我是 v20.9.0。

`corepack enable` 需要此命令行来开启(win可能报无权限，使用管理员模式)

`yarn -v` 成功，v1.22.22

### 2. 包下载慢

使用nrm管理镜像源 `npm install -g nrm`,之后就是`nrm ls`看看有哪些源,`nrm use taobao`使用taobao源

此时可能发现命令行无法识别nrm命令，你需要将npm路径加入环境变量

`npm config get prefix` 获取npm路径, 示例：C:\Users\xxx\AppData\Roaming\npm

我的电脑-右键-属性-高级系统设置-环境变量-path双击-新建-粘贴刚刚的路径

最后，关闭并重新打开命令行
