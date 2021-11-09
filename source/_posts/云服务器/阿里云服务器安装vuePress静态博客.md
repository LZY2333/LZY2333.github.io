---
title: 阿里云服务器安装vuePress静态博客
date: 2021-11-07 20:01:31
categories: 知识点
tags: 
    - 云服务器
---

# 阿里云服务器安装vuePress静态博客

双十一优惠在吴师兄的活动返利下买了个新的阿里云服务器，

准备用vuePress搭建一个静态博客，

之前的博客[luoziyu.cn](luoziyu.cn)也挺好的，方便快捷....

就是访问有亿点点慢...

经常有同学说你网站怎么进不去，毕竟本质上访问的还是github......

加上我还有个[luoziyu.com](luoziyu.com)域名没用起来，这不是巧了嘛，一波安排上。

计划是，

1.搞定vuePress静态网站,知识点主要涉及：linux vuePress nginx 

2.域名备案，据说得弄一个月

## 连接阿里云

__1.下载一个 用于ssh连接的客户机__,

相比直接命令行链接服务器，最大的好处是可以保存会话账号密码，

同时还提供可视化文件管理,我这里用的是 XShell.

__2.新建会话__

安装好后打开XShell,点击左上角有绿色+的网页图标,新建会话框.

填写表单上的 主机(云服务器实例界面的公网IP),点击确定,新建会话成功.

左侧出现新的会话卡,以后点击此处就可链接上你的云服务器了.

__3.开启会话__

第一次连接会话,需填写用户名,用户名写root,并勾选记住用户名,点击下一步,

要求输入 用户密码,这个密码就是阿里云的 __实例密码__,实例就代表你的云服务器,

并勾选记住密码,点击确定,就连接上你的云服务器了.

__如果不知道实例密码的话__,

需登录阿里云服务器控制台,找到你的ECS云服务器实例列表.

右侧操作栏找到 `更多`选项,

更多 -> 密码/密匙 -> 重置实例密码 -> 修改密码

修改成功后重启你的 __实例__,

返回XShell,__重新打开__ 会话,再做一遍第三步就行.

## 安装nginx

要安装软件,首先得了解自己的操作系统,选择软件管理工具

### Alibaba Cloud Linux 3

阿里云服务器的默认操作系统是 __Alibaba Cloud Linux 3__

Alibaba Cloud Linux 2（没找到3的找到了2的介绍）是阿里云官方操作系统，

在全面兼容CentOS 7生态的同时，为云上应用程序提供安全、稳定、高性能的定制化运行环境，

并针对云基础设施进行了深度优化，为您打造更好的运行时体验。

您可以免费使用Alibaba Cloud Linux 2公共镜像，并免费获得阿里云针对该操作系统的长期支持。

总之，就是说 __操作阿里云服务器 和 CentOS 7 是几乎没有区别的__.

> 似乎是由于RedHat提供商业化支持,所以阿里选择了RedHat系
> 购买阿里云服务器的选择CentOS7的居多

### yum和apt-get

在和朋友讨论的时候发现我们使用的安装命令不同 __apt-get__ 和 __yum__ 

__apt-get__ __yum__ 都是高级软件包管理工具,类似于前端的 __npm__

linux系统分为两大类:

RedHat系列(yum)：Redhat、CentOS、Fedora等

Debian系列(apt-get)：Debian、Ubuntu等

__yum是RedHat系列的高级软件包管理工具__

- 主要功能是更方便的添加/删除/更新RPM包。
- 它能自动解决包的依赖性问题。
- 它能便于管理大量系统的更新问题。

__yum的特点__

- 可以同时配置多个资源库(Repository)
- 简洁的配置文件(/etc/yum.conf)
- 自动解决增加或删除rpm包时遇到的倚赖性问题
- 保持与RPM数据库的一致性

转自[小菜鸟的博客园<yum和apt-get用法及区别>](https://www.cnblogs.com/garinzhang/p/diff_between_yum_apt-get_in_linux.html)


## nginx 的使用

真正安装nginx其实才几步,遇到的问题反而更多,都记录在后面了.

其实这其中还涉及linux目录结构,linux指令,yum指令,vim编辑器用法,nginx配置等,

以后做持续集成的时候八成还得学,会各个专门开篇.

[linux指令教程,无账号是看不到的,仅供自己参考](http://www.zhufengpeixun.com/strong/html/125.1.linux.html)

```js
yum install nginx  -y

whereis nginx // 查看安装位置

nginx   // 启动

nginx -t  // 测试nginx.conf是否符合语法

nginx -s reload // 修改nginx.conf之后，可以重载

curl http://120.24.169.47/  // 测试是否出现nginx默认页面
```

这个时候就可以在自己本地的浏览器里输入 公网IP 访问了

我这里是 `120.24.169.47`

## VuePress

第一步,看完[VuePress官网](https://vuepress.vuejs.org/zh/guide/getting-started.html)

第二部,选择一个VuePress主题[vuepress-theme-reco](https://vuepress.vuejs.org/zh/guide/getting-started.html)

这里用的是yarn的指令,回头再细看,又是一篇笔记,

学!都可以学!难整嗷,要学的东西真多..

[Yarn vs npm：你需要知道的一切](https://zhuanlan.zhihu.com/p/23493436)

后续会慢慢记录一些遇见的问题,和常用的指令操作

## 我遇见的问题

### nginx 已开启但输入ip无法访问?

特别感谢下面这位大佬,我的最终原因是没配置阿里云的安全组

[渐暖大佬的<nginx无法访问完整排除方案>](https://blog.csdn.net/yujing1314/article/details/105225325?spm=1001.2101.3001.6650.5&utm_medium=distribute.pc_relevant.none-task-blog-2%7Edefault%7EBlogCommendFromBaidu%7Edefault-5.no_search_link&depth_1-utm_source=distribute.pc_relevant.none-task-blog-2%7Edefault%7EBlogCommendFromBaidu%7Edefault-5.no_search_link)

### 阿里云连接短时间频繁断开

1.修改配置文件
```js
vim /etc/ssh/sshd_config

ClientAliveInterval 60 // 每隔60秒向客户端发送请求消息,并等待客户端响应
ClientAliveCountMax 10 // 客户端超过10次没响应,自动断开(10分钟)
```

2.重启SSH服务
```js
systemctl restart sshd
```

### 输入visudo显示busy

问题:linux命令中输入`visudo`显示`visudo: /etc/sudoers is busy, try again later`

找到进程号`ps -ef|grep visudo`

根据进程号杀掉进程`kill -9 (进程号)`

### 输入visudo显示swap file

问题:Linux下想编辑/etc/sudoers文件,出现`Found a swap file`

丢弃修改`rm /etc/.sudoers.tmp.swp`




