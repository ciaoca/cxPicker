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
  value: ['a1','b2'], // 可选参数，选择器的默认值
  callback: function(result) {
    console.log(result);
  }
});
```

### 设置全局默认值

```javascript
cxPicker.defaults.jsonName = 'name';
```



## 参数说明

名称|类型|默认值|说明
---|---|---|---
data|array|undefined|**选择器数据**
value|array|[]|**选择器默认值**
selectLength|int|0|**选择器组数量**<br>默认获取 `data.length` ，如果是联动的数据，需要设置。
jsonName|string|'n'|**数据标题字段名称**
jsonValue|string|'v'|**数据值字段名称**
jsonSub|string|'s'|**子集数据字段名称**
callback|function|undefined|**确定按钮回调函数**

### `data` 支持的格式

#### 1. 纯数组

```javascript
cxPicker({
  data: [
    ['选项 1-1', '选项 1-2'],
    ['选项 2-1', '选项 2-2']
  ]
});
```

#### 2. 标题与值不同

```javascript
cxPicker({
  data: [
    [
      {n: '选项 1-1', v: '101'},
      {n: '选项 1-2', v: '102'}
    ],
    [
      {n: '选项 2-1', v: '201'},
      {n: '选项 2-2', v: '202'}
    ]
  ]
});
```

#### 3. 联动数据

```javascript
cxPicker({
  data: [
    [
      {n: '北京'},
      {n: '上海', s: [
        {n: '黄浦区'},
        {n: '徐汇区'},
        {n: '长宁区'},
        {n: '静安区'},
        {n: '浦东新区'}
      ]},
      {n: '浙江', s: [
        {n: '杭州', s: [
          {n: '上城区'},
          {n: '西湖区'},
          {n: '余杭区'}
        ]},
        {n: '宁波', s: [
          {n: '海曙区'},
          {n: '江北区'},
          {n: '北仑区'}
        ]}
      ]}
    ]
  ],
  jsonValue: 'n', // 不区分标题与值
  selectLength: 3 // 设定为三个选项组
});
```

#### 多种数据格式混用的注意事项

- 当有一组数据为联动的格式时，其之后的数据将会被忽略。

例如，在用于选择日期使用时，由于每个月份的天数不同，所以存在联动的情况，需在月份的选项中配置天数选项。那么在月份之后，不能在添加其他的选项。

> cxPicker 是偏向于通用的选择器插件，并未对日期/时间选择有专门的优化。

```javascript
cxPicker({
  data: [
    [
      {n: '2020年', v: 2020},
      {n: '2021年', v: 2021},
      {n: '2022年', v: 2022}
    ],
    [
      {n:'1月', v:1, s:[1, 2, .., 31]},
      {n:'2月', v:2, s:[1, 2, .., 28]},
      {n:'3月', v:3, s:[1, 2, .., 31]},
      {n:'4月', v:4, s:[1, 2, .., 30]},
      ...
    ],
    [1, 2, 3, .., 31], // × 这组数据会被忽略
  ]
})
```

### callback 返回结果

名称|类型|说明
---|---|---
label|array|选中的内容列表
value|array|选中的值列表

```javascript
{
  callback: function(result) {
    console.log(result);
    /*
    result = {
      label: ['name-1', 'name-2'],
      value: ['value-1', 'value-2']
    }
    */
  }
}
```
