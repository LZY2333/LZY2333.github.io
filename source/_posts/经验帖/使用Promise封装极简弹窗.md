---
title: react个人最佳实践(一)--弹窗
date: 2024-08-01 10:46:13
categories: 经验帖
tags: 
    - 最佳实践
---

# react个人最佳实践(一)--弹窗

__最佳实践__

作为一个四年react业务仔，在日常开发中不断积累经验，不断反思，

逐渐总结出了一套自己的最佳实践，并实现为Demo模板代码。

涉及 弹窗 表单 表格 表单+表格，四大场景业务场景的实现。

在相关场景，该最佳实践将具有该场景 最细节 最易用 最简洁 的封装，以及 完备的TS示例。()

可根据这套Demo模板生成可直接运行的组件，再根据业务填充修改。

也可根据其中思想 和 技术实现，结合自身业务封装自己的最佳实践模板代码。

最佳实践 最重要的是其组件封装思想/编码思想，技术实现/demo代码只是载体。

__优点__

最佳实践的核心目标是做到 更简单，更易用 的组件封装，本质是做到了高内聚低耦合。

能极大降低心智负担，提升开发速度，减少bug的出现概率。

即使未推广的情况下前端同学也纷纷来抄作业，在项目中得到了大家的自发应用，

遂分享出来。

## 弹窗Demo源码

任何弹窗相关的需求，复制粘贴该demo即可使用

这是个人总结的一个完整弹窗逻辑的最简运行demo

主在提供一个思路方法，大家copy后可根据自己的理解修改

```ts
// ModalDemo 弹窗封装页面
import { Form, Input, Modal } from 'antd';
import React, { useImperativeHandle, useRef, useState } from 'react';

export interface ModalDemoForm {
    name: string;
}

export interface ModalDemoRefType {
    show: () => Promise<ModalDemoForm | false>;
}
interface ModalDemoPropsType {}

const ModalDemo = React.forwardRef<ModalDemoRefType, ModalDemoPropsType>((_props, ref) => {
    const [visible, setVisible] = useState(false);
    const [form] = Form.useForm();
    const promiseRef = useRef<{ resolve: (value: ModalDemoForm | false) => void }>();

    useImperativeHandle(ref, () => ({
        show: () => {
            setVisible(true);
            return new Promise((resolve) => {
                promiseRef.current = { resolve };
            });
        },
    }));

    const handleConfirm = async () => {
        setVisible(false);
        const formResult = await form.validateFields();
        promiseRef.current?.resolve(formResult);
    };
    const handleCancel = () => {
        setVisible(false);
        promiseRef.current?.resolve(false);
    };

    return (
        <Modal
            title='ModalDemo'
            open={visible}
            onOk={handleConfirm}
            onCancel={handleCancel}
        >
            <Form form={form}>
                <Form.Item label='name' name='name' required>
                    <Input maxLength={8} autoComplete='off' />
                </Form.Item>
            </Form>
        </Modal>
    );
});

export default ModalDemo;
```

## 弹窗Demo使用

使用仅需三步

```ts
// ModalDemoTestPage.tsx 弹窗使用示例页面
import { Button } from 'antd';
import React, { useRef } from 'react';
import ModalDemo, { ModalDemoRefType } from './ModalDemo';

const ModalDemoTestPage: React.FC = () => {
    {/* 第一步 */}
    const demoModalRef = useRef<ModalDemoRefType>(null);

    const longCheck = async () => {
        // 第三步
        const result = await demoModalRef.current!.show();
        if (!result) {
            return;
        }
        console.log('result as ModalDemoForm', result);
    };
    return (
        <div>
            <h1>ModalDemoTestPage </h1>
            <Button onClick={longCheck}>Click Here!</Button>
            {/* 第二步 */}
            <ModalDemo ref={demoModalRef} />
        </div>
    );
};

export default ModalDemoTestPage;
```

核心代码就是这些，下面是一些碎碎念

## 弹窗Demo封装建议

各类使用场景举例及注意事项

### 核心思想

该最佳实践，返回一个Promise作为对弹窗结果的订阅，将用户对弹窗的操作 视作 和后台接口请求一样的 异步操作。

并由主流程函数，对整个生命周期进行控制

弹窗开启前，可对传入的弹窗需要的数据进行处理，调用后端请求接口发起数据校验等

弹窗开启前，如校验出数据不合格，可直接调用tip提示，再`return Promise.resolve(false)`以结束该次调用的生命周期，

推荐对整个弹窗流程进行拆分，再由主流程函数进行组合调用

弹窗开启后，需返回一个pending的Promise，外部调用者可借此挂起后续流程，等待弹窗的结果返回

该pending状态的Promise，将由用户点击按钮等操作触发状态改变，返回数据，从而继续外部后续流程

这种模式的技术支撑是Promise，将Promise视作为了一种发布订阅模式。

将resolve


### 两种接收数据的方式

封装弹窗时，需考虑弹窗被调用需要使用到的数据，从

从TS的设置可看出，弹窗接收的数据 可以以两种方式传入，

__主流程函数形参__ 和 __组件props__ ,组件执行所需要的数据应使用哪种方式传入？

通俗的讲，

与该组件摆放位置相关的参数 应作为 __组件props__

与该组件每次被调用相关的参数 应作为 __主流程函数形参__

例如:

在A业务页面使用该组件，与B业务页面使用该组件，逻辑不同，需要传参区分

这种参数不管该组件被调用多少次，只要在当前页面都无需改变，显然该使用 组件props

另一种参数，例如传入的form初始数据，每次组件被调用时可能不一样，应在show主流程函数调用时传入

### 返回值及报错

返回 `true`/`false`, 或返回 数据类型/`false`，

`false`表示告诉外部中断后续流程, `true`/数据类型 表示后续流程继续。

并且，无论返回什么值，都应当代表着该弹窗相关的业务流程完全结束。

弹窗的报错应属于弹窗流程的一部分，应在弹窗内处理，而非抛出弹窗让使用者处理。

报错不一定代码流程结束，需根据业务判断，代码边界唯一标准是业务逻辑。

执行高内聚低耦合原则，应当认真考虑哪部分代码逻辑在弹窗范围内，哪部分逻辑在弹窗范围外。

注意,该弹窗封装与外部交互,数据的返回只存在一次，也就是弹窗生命周期结束时返回，

这也是我一直强调的理念，

如果你存在 在弹窗每次调用的生命周期中途 通过回调函数 或双向绑定的方式，传出数据的情况

那应该重新考虑相关业务流程，是否存在业务逻辑划分不当，或拆分业务逻辑缩小弹窗职责范围

比如将其融入弹窗

### 永远不使用reject

resolve代表当前流程在编写者的掌控之内，reject代表掌控之外的意外

报错应属于当前弹窗组件业务流程以内，在弹窗内部`catch`处理，而不是`throw error`

当该错误意味着后续外部流程无法继续时，应主动返回`false`

换言之，能预见的报错分支都是属于当前正常业务流程之内应使用resolve


从另一方面讲，error会使得外部调用者需要在catch中进行处理，产生了割裂

因此，外部调用者可以增加`catch`防止编写者

### TS支持

作为一个方便好用的通用组件封装，以下三个TS类型约束必须存在并`export`，

这样，使用者获得充分的参数提示和约束，极大提升便利性

TS类型约束被缺省时，使用者往往依旧需要阅读源码来知晓参数内容

1.`ModalDemoRefType` ref挂载的内容约束， 主要用于`show`这个主流程函数的约束和提供提示

注意，可挂载装多个主流程函数，先将业务逻辑拆解，再在主流程函数中组合不同的的流程，以适应多种业务情况。

2.`ModalDemoPropsType` 弹窗属性约束

3.`ModalDemoForm` 弹窗的返回值类型，如无拱外部使用的返回值可省略，仅返回`boolean`作为流程结束标志

### 一些技术问题

`React.forwardRef<ModalDemoRefType, ModalDemoPropsType>()`
用于将函数组件包裹

## 优势对比

### 目标及其实现



### 普通弹窗封装模式的缺点

使用处 流程割裂/阅读困难/逻辑重复/产生额外的变量:

需要传入`onSuccess`/`onCancel`等函数回调,整个业务流程难以在一个函数中解决

阅读代码时，阅读到弹窗调用处，又需要从jsx代码中找其回调函数，再继续阅读

有些业务逻辑可能需要在 成功/失败时均调用，需要额外抽离逻辑以实现复用

### 为什么不建议弹窗与弹窗内容分离的封装模式

有些同学在需要封装一个弹窗组件时，会仅封装`<Modal></Modal>`内的内容作为组件，

而不将`Modal`本身一同封装进去,使用者需自行包裹`Modal`，并自行控制`Modal`的开启关闭

这种封装方式，

1. 一种可能是对组件理解不够深刻，认为`<Modal></Modal>`必须出现在调用者页面

    这显然是没必要的顾虑，

2. 另一个原因是认为弹窗开启关闭应该由外部控制

其实不然，弹窗本身 以及弹窗封装者 是最清楚弹窗生命周期的人 弹窗相关的整个业务应该高度聚合在弹窗内，由弹窗组件本身控制，

甚至很多时候，调用了弹窗组件，弹窗都不一定会开启，例如 传入的数据校验报错，直接tip提醒而非打开弹窗

应该做到 【使用者仅需关注 调用时传入的数据 及获得 成功/失败时获得的结果】

需要 TS支持 以及 对业务的彻底思考，让弹窗足够黑盒

## 总结

开篇就提到了，最佳实践，重要的不是这篇demo，

而且我认为的大家在编码过程中一定要转变过来的思想

在编码过程中不断地问自己，我是否做到了。

不断地改进，总结，再记录下来，形成自己的最佳实践。

__组件本身业务高内聚__

其实不仅仅是弹窗，所有组件封装都可以用到这些思路，至少我是这么想的

__用在工作中__

乐趣，创造带来乐趣，当然这需要花额外的时间，但是这些时间是为自己花的

__写优雅的代码__

代码是一个人的标签

__符合高内聚低耦合原则，应当认真考虑哪部分代码逻辑在弹窗范围内，哪部分逻辑在弹窗范围外__