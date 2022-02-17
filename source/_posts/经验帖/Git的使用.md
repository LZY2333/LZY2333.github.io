---
title: Git的使用
date: 2021-11-20 09:43:01
categories: 经验帖
tags: 
    - Git
---


# Git的使用

## 回滚历史版本

### git log --oneline

查看历史提交版本

1.`git log` 查看历史所有版本信息

2.`git log --graph` 查看历史所有版本,命令行模拟图表展示(好看一点点)

3.`git log -x` 查看最新的x个版本信息

4.`git log -x filename`查看某个文件filename最新的x个版本信息（需要进入该文件所在目录）

5.`git log --oneline`查看历史所有版本信息,只包含版本号和记录描述

6.VI中同时按 `Shift + g` 展示全部,`q`退出查看

可以自定义git log的展示内容,以后用 `git lg` 就行(最推荐)

```sh
git config --global alias.lg "log --color --graph --pretty=format:'%Cred%h%Creset -%C(yellow)%d%Creset %s %Cgreen(%ci) %C(bold blue)<%an>%Creset' --abbrev-commit --"

git mylog
# 效果(带颜色):* 16c8eff - init (2021-11-03 21:01:24 +0800) <Your Name>
# ci换成cr则提交日期，按多久以前的方式显示 例如：1 day ago

# 删除别名配置: git config --global --unset alias.lg

```

### git reset --hard commit号

回滚版本,且丢弃之后所有版本

1.`git reset --hard HEAD^`,回滚到上个版本

2.`git reset --hard HEAD^~2`,回滚到前两个版本

3.`git reset --hard xxx`(版本号或版本号前几位),回滚到指定版本号,会自动匹配

4.`git reset --hard xxx filename`回滚某个文件到指定版本号(需要进入该文件所在目录)


使用 `git push -f` 提交更改,(这一步很危险,会产生代码丢失,一定要确定是想要的结果)

如果用`git push`会报错,因为我们本地库HEAD指向的版本比远程库的要旧

```sh
--soft 回退后a分支修改的代码被保留并标记为add的状态（git status 是绿色的状态）
--mixed 重置索引，但不重置工作树，更改后的文件标记为未提交（add）的状态。默认操作。
--hard 重置索引和工作树，并且a分支修改的所有文件和中间的提交，没提交的代码都被丢弃了。
--merge 和--hard类似，只不过如果在执行reset命令之前你有改动一些文件并且未提交，merge会保留你的这些修改，hard则不会。【注：如果你的这些修改add过或commit过，merge和hard都将删除你的提交】
--keep 和--hard类似，执行reset之前改动文件如果是a分支修改了的，会提示你修改了相同的文件，不能合并。如果不是a分支修改的文件，会移除缓存区。git status还是可以看到保持了这些修改。
```

### git revert commit号

新建一个回退了指定commit的修改的新commit.

比如产生了3个版本,想丢弃版本2的修改,并保留版本3的修改,

使用此方法,会生成版本4,此版本4由版本1和3的修改组成.

[git reset 和 git revert](https://juejin.cn/post/6844903614767448072)

### git checkout （*）

git checkout commit号 本地跳到指定版本

git checkout master 回到原来的分支

这样就可以自由查看某一个版本的代码了，这种方法正是我要找的。


## 拉取代码覆盖本地

### git fetch


[git fetch VS pull](https://juejin.cn/post/6844903921794859021)
## 碰到一个问题写一个
