---
title: AdvancedCSS&Sass
date: 2022-08-08 21:54:51
categories: 技术栈
tags:
    - CSS
---

# AdvancedCSS&Sass

1. `line-height: 1;` 使 lineHeight 为 fontSize 的 x 倍

2. `background-size: cover;background-position: bottom` 保持底部不变，其他位置对背景裁剪。

3. `background-image: linear-gradient(to right bottom,rgba(126,213,111,0.8),rgba(40,180,131,0.8)), url(../image/hero.jpg)`

从左上到右下 线性渐变的背景，下面再一个图片背景

4. `clip-path: polygon(0 0, 100% 0, 100% 200px, 0 100%)` 输入多个xy轴坐标点，连成多边形，多边形外部会被裁剪

5. `transform: translate(-50%, -50%);` 相对于元素自身的50%

6. 关键帧动画,为了浏览器性能,设置动画时最好最多只修改两个属性效果

```css
.heading-primary-main {
    animation-name: moveInLeft;
    animation-duration: 1s;
    animation-timing-function: ease-out; /* 动画计时器，这里是越来越慢*/
    /* animation: moveInLeft 1s ease-out; 可以写一起*/
    /* animation-delay: 3s; 延迟3秒 */
    /* animation-iteration-count: 3; 重复三次 */
}
@keyframes moveInLeft {
    0% {
        opacity: 0;
        transform: translateX(-100px);
    }

    80% {
        transform: translateX(10px);
    }

    100% {
        opacity: 1;
        transform: translateX(0);
    }
}
```

7. `backface-visibility: hidden;` 元素背面向屏幕时是否可见,
    也可用于修复动画结束时产生的莫名未知抖动问题。

8. 伪类选择器,用来选中特殊状态时的元素,例如`:hover` `:last-child`

9. `:link` 选中未访问过的链接, `:visited` 选中已访问过的链接。
    例如，一个普通的`<a>`标签没点过是 蓝色的，点击过是 紫色的。

10. `:active` 正在互动中的链接(鼠标点击中)，`:active`必须位于`:hover之后

10. `display:inline` display的默认属性，与其他行内元素共享一行，
    大小由内容撑开，可以使用padding，margin，但无法设置 top/bottom
    且无法使用height，width。

11. `display:inline-block` 与 
    `display:float`相比，不会脱离文档流
    `display:inline`相比，可使用上下边距，可使用width/height
    `display:block`相比，可与其他元素共享一行，不设置宽高则大小由内容撑开

12.  `text-aline:center`子元素是行内元素，可父元素直接文本居中使其居中

13. `transition: all .2s;` 写在初始状态的选择器内，定义特殊状态时 属性过渡的动画效果

14. `box-shadow: 0 10px 20px rgba(0,0,0,.2);` 0px X轴偏移，10px Y轴偏移，20px 模糊度， 透明度0.2的黑色
