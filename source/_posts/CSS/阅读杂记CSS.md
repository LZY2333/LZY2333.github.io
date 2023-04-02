---
title: 阅读杂记CSS
date: 2022-04-25 02:10:41
categories: 经验帖
tags:
    - CSS
    - 杂记
summary: CSS杂记，阅读杂记系列为 【对日常看过的一些有趣帖子的笔记】/【对某一细节进行搜索深入了解后的分析】/【对某一技术原理架构分析后的脑图】，总贴记录 待研究的知识点 及 小知识点，分贴记录大知识点
---

# 阅读杂记CSS

### 水平居中与垂直居中
```html
<div class='father' style="width: 300px; height: 300px; background: pink;">
    <!-- 子元素宽高一半为 50px 50px -->
    <div class='son' style="width: 100px; height: 100px; background: #ff00dd;"></div>
</div>
```
居中元素定宽高

absolute + margin auto(`0;0;0;0; margin: auto;`)
absolute + 负margin(`50%;50%; margin-top: -50px;`)
absolute + calc(`top: calc(50% - 50px);`)

居中元素不定宽高

absolute + transform(`50%;50%; transform: translate(-50%, -50%)`)
flex

absolute + margin auto
```css
.father {
    position: relative;
}
.son {
    position: absolute;
    top: 0; right: 0; bottom: 0; left: 0;
    margin: auto; /* 自动填充 */
}
```

absolute + 负margin
```css
.father {
    position: relative;
}
.son {
    position: absolute;;
    top: 50%;
    left: 50%;
    margin-top: -50px;
    margin-left: -50px;
}
```

absolute + calc
```css
.father {
    position: relative;
}
.son {
    position: absolute;;
    top: calc(50% - 50px);
    left: calc(50% - 50px);
}
```

absolute + transform
```css
.father {
    position: relative;
}
.son {
    position: absolute;
    top: 50%; left: 50%;
    transform: translate(-50%, -50%);
}
```

flex布局
```css
.father {
    display: flex;
    justify-content: center;
    align-items: center;
}
.son { }
```

### flex布局




### 什么是盒模型

CSS盒模型分为 标准盒模型 IE盒模型, 由 margin border padding content

标准盒模型 width 和 height 只包括 content的大小
IE盒模型 width 和 height 等于 content + padding + border

box-sizing: content-box(默认值,标准盒模型)
box-sizing: border-box(IE盒模型)

一个 块级 默认定位 未声明 width 的盒子,其宽度为100%,也就是父盒子content的宽度,同时盒子的padding和border会向内挤压空间

一个 绝对定位 未声明width 的盒子

普通文档流中块框的垂直外边距才会发生外边距合并，行内框、浮动框或绝对定位之间的外边距不会合并。

### CSS选择器的优先级

内联 > ID选择器 > 类选择器/属性选择器 > 标签选择器。

会计算 上面四类选择器的 出现次数,从左往右依次比较,以较大的为准,如果相同,则比较下一位.

如果四位均相同,则 后出现的会覆盖前面出现的

!important 的优先级最高,内联+important 的优先级最高

### 什么是重绘和重排，改善方案
浏览器请求到对应页面资源的时候，会将HTML解析成DOM，把CSS解析成CSSDOM，然后将DOM和CSSDOM合并就产生了Render Tree。在有了渲染树之后，浏览器会根据流式布局模型来计算它们在页面上的大小和位置，最后将节点绘制在页面上。
那么当Render Tree中部分或全部元素的尺寸、结构、或某些属性发生改变，浏览器就会重新渲染页面，这个就是浏览器的回流。常见的回流操作有：页面的首次渲染、浏览器窗口尺寸改变、部分元素尺寸或位置变化、添加或删除可见的DOM、激活伪类、查询某些属性或调用方法（各种宽高的获取，滚动方法的执行等）。
当页面中的元素样式的改变不影响它在文档流的位置时（如color、background-color等），浏览器对应元素的样式，这个就是回流。
可见：回流必将导致重绘，重绘不一定会引起回流。回流比重绘的代价更高。
常见改善方案：

在进行频繁操作的时候，使用防抖和节流来控制调用频率。
避免频繁操作DOM，可以利用DocumentFragment，来进行对应的DOM操作，将最后的结果添加到文档中。
灵活使用display: none属性，操作结束后将其显示出来，因为display的属性为none的元素上进行的DOM操作不会引发回流和重绘。
获取各种会引起重绘/回流的属性，尽量将其缓存起来，不要频繁的去获取。
对复杂动画采用绝对定位，使其脱离文档流，否则它会频繁的引起父元素及其后续元素的回流。

### display

| none          |    元素不显示，并从文档流中移除  | 
| inline        |    行内元素类型，高度宽度无效，text-align无效，可设置左右方向的padding margin  |
| block	        |    块级元素，默认宽度继承父类，高度由子类撑开，独占一行，即使宽度能放下下一个block |
| inline-block  |	 行内块元素，一行内可存在多个的块级元素，inline-block结合text-align: justify  |
| list-item	    |    把元素作为列表显示，要完全模仿列表的话还需要加上 list-style-position，list-style-type  |
| table	        |   块级表格，前后有换行符，一个HTML元素和它的子节点像table元素一样，可用于实现三栏布局   |
| inherit	    |    从父元素继承display属性   |
| flex    	    |    弹性布局 ，子元素的float、clear和vertical-align属性将失效  |

### lineHeight如何继承


### 对BFC的理解

### 实现两栏布局，三栏布局

### 实现圣杯布局和双飞翼布局


### REM
[https://juejin.cn/post/7132046222327545870](https://juejin.cn/post/7132046222327545870)