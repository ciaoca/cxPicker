# cxPicker

cxPicker 是基于 JavaScript 的联级选择器插件，支持单列、多列、联动等多种数据格式。



**兼容性：**

* Safari & Chrome for iOS 11+
* Android Browser 98+
* Chrome for Android 98+

Demo: https://ciaoca.github.io/cxPicker/



## 使用方法

### 载入 CSS 文件

```html
<link rel="stylesheet" href="cxpicker.css">
```

### 载入 JavaScript 文件

```html
<script src="cxpicker.js"></script>
```

### 调用 cxPicker

```javascript
// 设置数据并显示选择器
cxPicker({
  data: [
    ['a1', 'a2'],
    ['b1', 'b2'],
    // 更多列选项
  ],
  value: ['a1','b2'] // 可选参数，选择器的默认值
});
```

### 设置全局默认值

```javascript
cxPicker.defaults.jsonName = 'name';
```



## 参数说明

名称|默认值|说明
---|---|---
data|undefined|**选择器数据**<br>格式需为 `Array`
value|[]|**选择器默认值**
selectLength|0|**选择器组数量**<br>默认为 `data.length` ，如果是数据是联动的类型，需要设置。
jsonName|'n'|**数据标题字段名称**
jsonValue|'v'|**数据值字段名称**
jsonSub|'s'|**子集数据字段名称**

### `data` 格式说明

#### 1. 单列、多列，无联动的数据格式

```javascript
cxPicker({
  data: [
    // 值与标题相同
    ['value-1-1', 'value-1-2'],

    // 值与标题不同
    [
      {n: 'name-2-1', v: 'value-2-1'},
      {n: 'name-2-2', v: 'value-2-2'}
    ]
  ]
});
```

#### 2. 联动的数据格式

```javascript
cxPicker({
  data: [
    [
      {n: '北京', v: '北京'},
      {n: '上海', v: '上海', s: [
        {n: '黄浦区', v: '黄浦区'},
        {n: '徐汇区', v: '徐汇区'},
        {n: '长宁区', v: '长宁区'},
        {n: '静安区', v: '静安区'},
        {n: '浦东新区', v: '浦东新区'},
      ]},
      {n: '浙江', v: '浙江', s: [
        {n: '杭州', v: '杭州', s: [
          {n: '上城区', v: '上城区'},
          {n: '西湖区', v: '西湖区'},
          {n: '余杭区', v: '余杭区'},
        ]},
        {n: '宁波', v: '宁波', s: [
          {n: '海曙区', v: '海曙区'},
          {n: '江北区', v: '江北区'},
          {n: '北仑区', v: '北仑区'},
        ]}
      ]}
    ]
  ],
  selectLength: 3 // 设定为三个选项组
});
```

#### 以上两种数据格式混用的注意事项

- 当有一组数据为联动的格式时，其之后的数据将会被忽略。


例如，在用于选择日期使用时，由于每个月份的天数不同，所以存在联动的情况，数据格式为：

```javascript
cxPicker({
  data: [
    [
      {n:'1月', v:1, s:[1, 2, .., 31]},
      {n:'2月', v:2, s:[1, 2, .., 28]},
      {n:'3月', v:3, s:[1, 2, .., 31]},
      {n:'4月', v:4, s:[1, 2, .., 30]},
      ...
    ]
  ]
})
```

> cxPicker 是偏向于通用的选择器插件，并未对日期/时间选择有专门的优化。
