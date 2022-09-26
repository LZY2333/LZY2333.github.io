---
title: CreateReactApp
date: 2022-09-26 07:23:47
categories: 技术栈
tags: 
    - Webpack
---

## CreateReactApp

yarn 速度快，workspace功能，

软链功能（yarn install 把 workspace内 的项目 都放了一份软链在根目录的node_modules下面，这样项目间可以相互引）

### monorepo

`lerna` `monorepo这种管理模式` 是babel团队开发的

`yarn add chalk cross-pawn fs-extra --ignore-workspace-check` 给根目录装依赖(各个子项目都要用到的包)


`yarn workspace create-react-app2 add commander` 给指定子项目安装包(子项目独自依赖的包)

yarn workspace VS lerna

有很多功能是重复的，相等的

yarn 重点在于包管理，处理依赖，处理软链(yarn install === lerna bootstrap)

lerna 重点在于多个项目的管理和发布