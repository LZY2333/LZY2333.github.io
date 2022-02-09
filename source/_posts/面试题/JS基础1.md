---
title: JS基础1
date: 2022-01-21 09:51:55
categories: 知识点
tags: 
    - 面试题
---

# JS基础1

## 防抖和节流

防抖和节流都是防止某一事件频繁触发

### 防抖(debounce)

施法前摇，在读条期间再次触发会打断施法，重新读条，直到正常读条结束，触发函数。

```js

function debounce(f, wait) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      f(...args);
    }, wait);
  };
}
let a = {}
a.c = debounce((b)=>{console.log(this,b)},500)
a.c()
```

场景: 按钮多次点击重复提交,浏览器窗口resize,文本编辑器自动保存,输入框智能提示

防抖重在清零 `clearTimeout(timer)`

### 节流

节流重在加锁 `timer=timeout`,控制事件发生频率,限流,单位时间内只发生一次

防抖是在等用户给出最终答案 再触发，节流就是防止频繁触发 限流 锁。
```js
function throttle(f, wait) {
  let timer;
  return (...args) => {
    if (timer) {
      return;
    }
    timer = setTimeout(() => {
      f(...args);
      timer = null;
    }, wait);
  };
}
```

## 图片懒加载

__懒加载__:滑动页面到能看到图片时再加载图片

__难点__:如何判断图片出现在了视口?如何控制图片的加载?

### 位置计算

判断图片出现在视口: clientTop，offsetTop，clientHeight 以及 scrollTop 各种关于图片的高度作比对

控制图片加载: 把图片路径储存在dom属性内如`<img data-src="xxx.jpg" />`,监听`window.scroll`事件,触发时`img.src = img.datSet.src`

> DataSet API, 这里 data-src 和 datSet.src 似乎是用了这个 DataSet API,回头看看

### getBoundingClientRect元素相对视口位置

`Element.getBoundingClientRect()` 方法返回元素的大小及其相对于视口的位置

```js
// 图片距离顶端的高度 < 视口的高度,说明出现在视口内了
img.getBoundingClientRect().top < document.documentElement.clientHeight;
```

> window.scroll监听 可以加个 防抖 或 节流

### IntersectionObserver元素是否到了视口位置

`IntersectionObserver`监听当前元素是否到了当前视口位置

```js
const observer = new IntersectionObserver((changes) => {
  // changes: 目标元素集合
  changes.forEach((change) => {
    // intersectionRatio
    if (change.isIntersecting) { // 代表目标元素可见
      const img = change.target;
      img.src = img.dataset.src;
      observer.unobserve(img);
    }
  });
});

observer.observe(img);
```

> IntersectionObserver 除了给图片做懒加载外，还可以对单页应用资源做预加载

### loading="lazy"浏览器自动懒加载

`<img src="xxx.jpg" loading="lazy" />`

存在浏览器兼容问题