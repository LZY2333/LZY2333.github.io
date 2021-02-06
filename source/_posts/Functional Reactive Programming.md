# Functional Programming

## 什么是 Functional Programming

Functional Programming 是一種編程範式(programming paradigm)，
就像 Object-oriented Programming(OOP)一樣，就是一種寫程式的方法論，這些方法論告訴我們如何思考及解決問題。

```js
(5 + 6) - 1 * 3
```
写成
```js
const add = (a, b) => a + b
const mul = (a, b) => a * b
const sub = (a, b) => a - b

sub(add(5, 6), mul(1, 3))
```

把每個運算包成一個個不同的 function，並用這些 function 組合出結果，這就是 Functional Programming。

## Functional Programming 基本条件

__函式為一等公民__,一等公民就是指跟其他資料型別具有同等地位，
也就是說函式能夠被賦值給變數，函式也能夠被當作參數傳入另一個函式，也可當作一個函式的回傳值

函式能夠被賦值給變數

函式能被當作參數傳入

函式能被當作回傳值


## Functional Programming 有什么特性

### Expression, no Statement

Functional Programming 都是 表達式 (Expression) 不會是 陳述式(Statement)。

表達式 是一個運算過程，一定會有返回值，例如執行一個 function

陳述式 則是表現某個行為，例如一個 賦值給一個變數

### Pure Function

Pure function 是指 一個 function 給予相同的參數，永遠會回傳相同的返回值，並且沒有任何顯著的副作用(Side Effect)

> Side Effect
> Side Effect 是指一個 function 做了跟本身運算返回值沒有關係的事，
> 比如說修改某個全域變數，或是修改傳入參數的值，甚至是執行 console.log 都算是 Side Effect。
>
> Referential transparency
> 前面提到的 pure function 不管外部環境如何，只要參數相同，函式執行的返回結果必定相同。
> 這種不依賴任何外部狀態，只依賴於傳入的參數的特性也稱為 引用透明(Referential transparency)

### 利用參數保存狀態

```js
function findIndex(arr, predicate, start = 0) {
    if (0 <= start && start < arr.length) {
        if (predicate(arr[start])) {
            return start;
        }
        return findIndex(arr, predicate, start+1);
    }
}
findIndex(['a', 'b'], x => x === 'b'); // 找陣列中 'b' 的 index
```

`findeIndex`中第三个参数就是利用参数保存状态

## Functional Programming 有什么优势

__可讀性高__

因为可以靠函数名释义

__可維護性高__

不依赖外部环境，不影响外部环境，一个函数维持一小个功能，可直接单独修改。

__易於併行/平行處理__

Functional Programming 易於做併行/平行(Concurrency/Parallel)處理，
因為我們基本上只做運算不碰 I/O，再加上沒有 Side Effect 的特性，所以較不用擔心 deadlock 等問題。

# 