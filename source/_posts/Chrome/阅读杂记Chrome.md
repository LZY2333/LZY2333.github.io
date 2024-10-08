---
title: 阅读杂记Chrome
date: 2022-04-25 07:11:27
categories: 经验帖
tags:
    - Chrome
    - 杂记
summary: Chrome杂记，阅读杂记系列为 【对日常看过的一些有趣帖子的笔记】/【对某一细节进行搜索深入了解后的分析】/【对某一技术原理架构分析后的脑图】，总贴记录 待研究的知识点 及 小知识点，分贴记录大知识点
---


### 从地址栏输入URL到首屏渲染

用户发出URL请求 到 页面开始解析的过程,叫做 __导航__

1. 判断地址栏 输入的是 __URL规则__ 数据 还是 __搜索内容：__
2. beforeunloaded

3.浏览器进程 通过 进程通讯(IPC) 把URL请求 发送至网络进程,网络进程开启真正的HTTP请求
4.构建请求行信息
5.查找本地是否有对应网站缓存
6.DNS寻址,本地有IP缓存的话也会直接返回
7.等待TCP队列,同一域名最多6个TCP连接

8.TCP连接,通过IP和端口号,三次握手
9.发送HTTP请求,请求行,请求头
10.返回相应行,响应头,响应体
11.TCP断开连接
12.重定向

13.数据处理Content-Type
14.准备渲染进程
15.提交文档

### 浏览器渲染流程(已经拆分，待总结)

### HTTP缓存 协商缓存 强缓存 弱缓存 CDN

304 协商缓存 还是要和服务器通信一次

强制浏览器使用本地缓存（cache-control/expires）

### cookie sessionStorage localStorage
```js
document.cookie = "username=xxx; expires=Thu, 15 Dec 2023 16:00:00 UTC; path=/";
sessionStorage.setItem("key", "value"); // getItem removeItem clear()
localStorage.setItem("key", "value"); // getItem removeItem clear()
```
储存容量
cookie：4KB； LocalStorage和SessionStorage：5MB到10MB； indexedDB：无上限

生命周期
cookie：持久保存，可以设置过期时间。
LocalStorage：持久保存，除非被显式清除。
indexedDB：持久保存，除非被显式清除。
SessionStorage：关闭浏览器标签或窗口后清除。

安全性
cookie最不安全，可以设置路径、域名和安全标志来限制访问。

cookie
session storage
local storage
indexedDB:用于客户端存储大量的结构化数据（文件/二进制大型对象（blobs））。该API使用索引实现对数据的高性能搜索。
cache storage：用于对Cache对象的存储。

sessionStorage 不能在多个窗口或标签页之间共享数据，
但是当通过 window.open 或链接打开新同源页面时(不能是新窗口)，新页面会复制前一页的 sessionStorage

### 跨域

ajax请求 与 当前页面URL 不同源: 协议+域名+端口

跨域解决方案
__JSONP__: 用script标签src属性来发送请求, 因为跨域只对ajax有限制，老浏览器支持

__nginx__: 在同源服务器内设置反向代理，后端无跨域限制

__CORS__: 后端配置允许跨域

对于 __CORS简单请求__, 浏览器会自动添加 Origin 头部
只需要服务端设置响应头Access-Control-Allow-Origin
get post head 且 请求头中只有Accept Accept-Language Content-Language Content-Type

对于 __CORS非简单请求__, 浏览器会先发送一个预检请求 OPTIONS 

```js
app.get("/api/sayHello", (req, res) => {  
    // 允许有所的地址跨域  
    res.setHeader("Access-Control-Allow-Origin", "*")  
    // 允许所有的请求方法 GET, POST, PUT, DELETE 
    res.setHeader("Access-Control-Allow-Methods", "*")
    // 允许的非简单请求的头部字段，如（Content-Type、X-Requested-With、Accept、Origin、Access-Control-Request-Method、Access-Control-Request-Headers） 
    res.setHeader("Access-Control-Allow-Headers", "*")  
    // 允许携带cookie  
    res.setHeader("Access-Control-Allow-Credentials", "*")
    // 设置预检请求（OPTIONS 方法）的结果缓存时间。
    res.setHeader("Access-Control-Max-Age", "*")
    res.send({ name: "hello word" })  
})  
  
app.listen(3000, () => {  
    console.log("service running at 3000 ...")  
})
```
> 发送cookie，需要服务器端设置 Access-Control-Allow-Credentials , 需要 AJAX 请求设置 withCredentials

```js
location /api {
    proxy_pass http://api.example.com; # 目标服务器地址
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
}
```

### 浏览器

#### 介绍一下浏览器有哪些进程
__浏览器进程__
界面显示 用户交互 子进程管理 提供储存功能

__渲染进程__
将HTML CSS JS转换为用户交互的页面
排版引擎Blink JS引擎V8 运行其中
非同源网站,每个Tab一个渲染进程
安全考虑,渲染进程运行在沙箱模式下

__GPU进程__
初衷是为了实现3D CSS 效果
随后 UI界面都采用 GPU来绘制

__网络进程__
负责网络资源的加载
之前只是作为 浏览器进程 的一个模块

__插件进程__
插件易崩溃,通过插件进程来隔离,保证不对浏览器和页面造成影响
[浏览器渲染进程的多线程机制](https://blog.csdn.net/fredricen/article/details/105217588)





### HTTP协议

#### 什么是DNS寻址

#### HTTP 请求的过程

IP 负责把数据包送达目的主机。
UDP 负责把数据包送达具体应用。
TCP 保证了数据完整地传输，它的连接可分为三个阶段：建立连接、传输数据和断开连接。

#### IP UDP TCP
互联网实际上就是一套理念和协议组成的体系架构

IP(Internet Protocol) 网际协议
> IP其实就是计算机地址 访问网站就是访问另一台计算机
> 数据包交给网络层,包上IP头,交给底层,通过物理网络传输给目标主机的网络层

UDP(User Datagram Protocol) 用户数据包协议
> 端口号,传输层识别端口号将此电脑的数据包分发给对应的程序
> 数据包(上层) +UDP头(传输层) +IP头(网络层) 再底层传输到目标主机,再解析
> UDP有数据校验,但对于错误的数据包直接丢弃没有重发机制,且发送方无法得知数据是否送达,优点是传输快

TCP(Transmission Control Protocol) 传输控制协议
> 面向连接的 可靠的 基于字节流的传输层通信协议
> 优点:数据包丢失时,提供重传机制;有数据包排序机制,保证把乱序的数据包组合成完整文件

__TCP连接__

TCP连接生命周期包括 建立连接 传输数据 断开连接

首先,建立连接 三次握手 指客户端和服务器共需要发送三个数据包确认连接的建立

其次,数据传输 接收端需要再接收到每个数据包后返回确认数据包给发送端,
接收到数据包后会根据TCP头中的序号为其排序,组合成完整的数据

最后,断开连接 四次挥手

__HTTP__ 和 __TCP的关系__
HTTP协议和TCP协议都是TCP/IP协议簇的子集。

HTTP协议属于应用层，TCP协议属于传输层，HTTP协议位于TCP协议的上层。

数据包(上层) +HTTP头(应用层) +TCP头(传输层) +IP头()

TCP在传输层发生丢包时,会要求重传,最后会在保证排好序数据完整的状态下,把数据传给HTTP层

先通过三次握手建立tcp链接，链接建立好之后，发送http请求行和http请求头给服务器，然后服务器返回响应行，响应头和响应体，最终完成后通过四次挥手断开tcp链接

websocket其实就是http的改造版本,增加了服务器向客户端主动发消息的功能

TCP是底层通讯协议，定义的是数据传输和连接方式的规范
HTTP是应用层协议，定义的是传输数据的内容的规范
HTTP协议中的数据是利用TCP协议传输的，所以支持HTTP也就一定支持TCP

HTTP支持的是www服务
而TCP/IP是协议
它是Internet国际互联网络的基础。TCP/IP是网络中使用的基本的通信协议。
TCP/IP实际上是一组协议，它包括上百个各种功能的协议，如：远程登录、文件传输和电子邮件等，而TCP协议和IP协议是保证数据完整传输的两个基本的重要协议。通常说TCP/IP是Internet协议族，而不单单是TCP和IP

__总结__
IP 负责送达目标主机 UDP负责送达具体应用 
使用TCP的话则保证了数据的完整传输

#### HTTP协议字段及常见值
常见请求头字段

常见响应头字段

#### HTTP 1.0 2.0

#### HTTPS为什么更安全

#### HTTP tcp/ip 请求的特点

#### 为什么需要三次握手，两次不行吗？

为了确定传输是可靠的，要确认客户端和服务器的发送和接收能力。

第一次握手,你在吗我能发送西给你,
第二次握手,确认了服务端的发送能力和接收能力，
所以第三次握手才可以确认客户端的接收能力。不然容易出现丢包的现象。

#### 五层因特网协议栈
#### URI和URL

UDP 协议有什么优点？
协商缓存如何判断命不命中？
HTTP 103是什么意思？
如何处理跨域？

HTTP1.1 和 HTTP2 做了什么？队头阻塞有没有了解过，在 HTTP2 中有这个问题吗？
有了解过 HTTP3 吗？为什么使用 UDP？

域名解析之后如何找到目标主机？
HTTP3的协议一定是TCP
HTTP1.1和HTTP2的区别
HTTPS如何保证安全性

### CSS树
元素的渲染规则，如包含块，控制框，BFC，IFC
优化

### JS引擎
在 V8 引擎中,会把 JavaScript 热点代码编译成机器码,
它是电脑CPU直接读取运行的机器码，运行速度最快，但是非常晦涩难懂，同时也比较难编写；
机器码就是计算机可以直接执行，并且执行速度最快的代码；





### 其他

#### 如何理解HTML语义化
增加代码可读性
利于SEO,让搜索引擎更容易读懂
无CSS的情况下,页面也能有良好的内容结构.

#### script 标签中 defer 和 async 的区别
      script：阻碍HTML解析,只有下载好并执行完脚本才会继续解析 HTML。
async script：解析HTML过程中进行脚本的异步下载,下载成功立马执行,有可能会阻断 HTML 的解析。
defer script：完全不会阻碍HTML的解析,解析完成之后再按照顺序执行脚本。