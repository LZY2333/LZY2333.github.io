## 使用 Promise 封装极简弹窗

### 问题的产生 以及 我的期望的效果

### 理论基础

### 如何封装一行函数可调用的极好用弹窗

__弹窗封装__
```js
// DemoModal.tsx
import { Form, Input, Modal } from 'antd';
import React, { useImperativeHandle, useRef, useState } from 'react';

export interface DemoForm {
    name: string;
}
export interface DemoModalRefType {
    show: () => Promise<DemoForm | false>;
}

export const DemoModal = React.forwardRef<DemoModalRefType>((_props, ref) => {
    const [visible, setVisible] = useState(false);
    const [form] = Form.useForm();
    const promiseRef = useRef<{ resolve: (value: DemoForm | false) => void }>();

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
        <Modal title="DemoModal" visible={visible} onOk={handleConfirm} onCancel={handleCancel}>
            <Form form={form}>
                <Form.Item label="name" name="name" required>
                    <Input maxLength={8} autoComplete="off" />
                </Form.Item>
            </Form>
        </Modal>
    );
})
```

__弹窗使用__
```js
import { Button } from 'antd';
import React, { useRef } from 'react'
import { DemoModal, DemoModalRefType } from './DemoModal';

export const PageTestDemoModal: React.FC = () => {
    const demoModalRef = useRef<DemoModalRefType>(null)

    const longCheck = async () => {
        // do something ...
        // when you need a Modal check
        const result = await demoModalRef.current?.show()
        if(!result) {
            return;
        }
        console.log('success and continue')
        // do something ...
    }
    return (
        <div>
            <h1>PageTestDemoModal</h1>
            <Button onClick={longCheck}>Click Here!</Button>
            <DemoModal ref={demoModalRef}/>
        </div>
    );
};
```