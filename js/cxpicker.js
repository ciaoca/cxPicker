/*!
 * cxPicker
 * @name cxpicker.js
 * @version 1.0.0
 * @date 2022-02-21
 * @author ciaoca
 * @email ciaoca@gmail.com
 * @site https://github.com/ciaoca/cxPicker
 * @license Released under the MIT license
 */
(function() {
  var picker = {
    dom: {}
  };

  picker.init = function() {
    var self = this;

    self.loopTime = 200;

    self.dom.wrap = document.createElement('div');
    self.dom.wrap.classList.add('cxpicker');
    self.dom.wrap.innerHTML = '<div class="mask"></div>'
      + '<div class="box">'
        + '<div class="acts">'
          + '<a class="cancel" href="javascript://" rel="cxpicker_hide"></a>'
          + '<a class="set" href="javascript://" rel="cxpicker_set"></a>'
        + '</div>'
        + '<div class="list"></div>'
      + '</div>'
    + '</div>';

    self.dom.list = self.dom.wrap.querySelector('.list');

    if('ontouchend' in document.documentElement){
      self.dom.list.addEventListener('touchend', function() {
        self.checkStable();
      });

    } else {
      self.loopTime = 500;
      self.dom.list.addEventListener('mousewheel', function() {
        clearTimeout(self.scrollThrottle);

        self.scrollThrottle = setTimeout(function() {
          self.checkStable();
        }, self.loopTime);
      });
    };

    self.dom.wrap.addEventListener('click', function() {
      var target = event.target;
      var tagName = '';

      if (typeof target.nodeName === 'string') {
        tagName = target.nodeName.toLowerCase();
      };

      if (tagName === 'a') {
        switch (target.rel) {
          case 'cxpicker_hide':
            self.hide();
            break;

          case 'cxpicker_set':
            self.confirm();
            break;
        };

      } else if (tagName === 'div') {
        for (var i = 0, l = target.classList.length; i < l; i++) {
          if (target.classList[i] === 'mask') {
            self.hide();
            break;
          };
        };
      }
    });

    document.body.insertAdjacentElement('beforeend', self.dom.wrap);
  };

  picker.setOptions = function(options) {
    var self = this;
    self.options = Object.assign({}, cxPicker.defaults, options);
  };

  picker.attach = function(options) {
    var self = this;

    self.setOptions(options);

    if (!Array.isArray(self.options.data)) {
      console.warn('cxPicker: data is not array.')
      return;
    };

    if (self.options.selectLength === 0) {
      self.options.selectLength = self.options.data.length;
    };

    self.cacheData = self.options.data;
    self.cacheSelect = [];
    self.cacheResult = [];

    self.buildSelect();
    self.show();
  };

  picker.buildSelect = function() {
    var self = this;
    var curData;
    var curResult;
    var subData;
    var html = '';

    for (var i = 0; i < self.options.selectLength; i++) {
      if (Array.isArray(subData)) {
        curData = subData;
      } else if (self.cacheData.length - i > 0) {
        curData = self.cacheData[i];
      } else {
        curData = [];
      };

      curResult = {
        index: 0
      };

      if (curData.length && self.options.value.length - i > 0) {
        for (var j = 0, k = curData.length; j < k; j++) {
          if (curData[j] === self.options.value[i] || (typeof curData[j] === 'object' && curData[j][self.options.jsonValue] === self.options.value[i])) {
            curResult.index = j;

            if (typeof curData[j] === 'object') {
              curResult.label = curData[j][self.options.jsonName];
              curResult.value = curData[j][self.options.jsonValue];
            } else {
              curResult.label = curData[j];
              curResult.value = curData[j];
            };
            break;
          };
        };
      };

      if (typeof curResult.value === 'undefined') {
        if (typeof curData[0] === 'object') {
          curResult.label = curData[0][self.options.jsonName];
          curResult.value = curData[0][self.options.jsonValue];
        } else {
          curResult.label = curData[0];
          curResult.value = curData[0];
        };
      };

      if (typeof curData[curResult.index] === 'object' && Array.isArray(curData[curResult.index][self.options.jsonSub])) {
        subData = curData[curResult.index][self.options.jsonSub];
      } else {
        subData = null;
      };

      if (Array.isArray(subData) && (typeof self.subStart !== 'number' || i < self.subStart)) {
        self.subStart = i;
      };

      self.cacheSelect.push(curData);
      self.cacheResult.push(curResult);
    };

    for (var i = 0, l = self.cacheSelect.length; i < l; i++) {
      html += self.createList(self.cacheSelect[i]);
    };
    self.dom.list.innerHTML = html;

    // 调整选项定位
    var group = self.dom.list.getElementsByTagName('ul');
    self.itemHeight = self.dom.list.getElementsByTagName('li')[0].offsetHeight;

    for (var i = 0, l = self.cacheResult.length; i < l; i++) {
      self.cacheResult[i].top = self.itemHeight * self.cacheResult[i].index;
      group[i].scrollTop = self.cacheResult[i].top;
    };
  };

  picker.createList = function(data) {
    var self = this;
    var list = [];

    for (var i = 0, l = data.length; i < l; i++) {
      list.push(self.createItem(data[i]));
    };

    return '<section><ul>' + list.join('') + '</ul></section>';
  };

  picker.createItem = function(data) {
    var self = this;
    var html = '';

    if (typeof data === 'object') {
      html = '<li data-value="' + data[self.options.jsonValue] + '">' + data[self.options.jsonName] + '</li>';

    } else {
      html = '<li data-value="' + data + '">' + data + '</li>';
    };

    return html;
  };

  picker.show = function() {
    var self = this;

    self.dom.wrap.classList.remove('out');
    self.dom.wrap.classList.add('in');
  };

  picker.hide = function() {
    var self = this;

    self.dom.wrap.classList.remove('in');
    self.dom.wrap.classList.add('out');
  };

  picker.confirm = function() {
    var self = this;

    if (typeof self.options.callback === 'function') {
      self.options.callback(self.getResult());
    };

    self.hide();
  };

  picker.checkStable = function() {
    var self = this;
    var group = self.dom.list.getElementsByTagName('ul');
    var result = true;

    if (self.checkLock) {
      return;
    };

    clearTimeout(self.checkLoop);

    for (var i = 0, l = group.length; i < l; i++) {
      if (self.cacheResult[i].top !== group[i].scrollTop) {
        self.cacheResult[i].top = group[i].scrollTop;
        self.cacheResult[i].index = Math.round(group[i].scrollTop / self.itemHeight);
        result = false;
        break;
      };
    };

    if (!result) {
      self.checkLock = true;
      self.checkLoop = setTimeout(function() {
        self.checkLock = false;
        self.checkStable();
      }, self.loopTime);
      return;
    };

    self.checkSelect();
  };

  picker.checkSelect = function() {
    var self = this;
    var curIndex;
    var curValue;
    var curItem;
    var subData;
    var newLabel;
    var newValue;

    for (var i = 0; i < self.options.selectLength; i++) {
      curIndex = self.cacheResult[i].index;
      curValue = self.cacheResult[i].value;
      curItem = self.cacheSelect[i][curIndex];

      if (typeof curItem === 'object') {
        newLabel = curItem[self.options.jsonName];
        newValue = curItem[self.options.jsonValue];

        if (Array.isArray(curItem[self.options.jsonSub])) {
          subData = curItem[self.options.jsonSub];
        } else {
          subData = null;
        };

      } else {
        newLabel = curItem;
        newValue = curItem;
        subData = null;
      };

      if (Array.isArray(subData) && (typeof self.subStart !== 'number' || i < self.subStart)) {
        self.subStart = i;
      };

      if (curValue !== newValue) {
        self.cacheResult[i].label = newLabel;
        self.cacheResult[i].value = newValue;

        if (typeof self.subStart === 'number' && self.subStart <= i) {
          self.clearSelect(i);
        };
        continue;
      };
    };
  };

  picker.clearSelect = function(index) {
    var self = this;
    var curData;
    var curResult;
    var start = index + 1;
    var group = self.dom.list.getElementsByTagName('section');

    if (Array.isArray(self.cacheSelect[index][self.cacheResult[index].index][self.options.jsonSub])) {
      curData = self.cacheSelect[index][self.cacheResult[index].index][self.options.jsonSub];
    };

    self.cacheSelect.splice(start, self.options.selectLength - index);
    self.cacheResult.splice(start, self.options.selectLength - index);

    for (var i = start; i < self.options.selectLength; i++) {
      if (!Array.isArray(curData)) {
        curData = [];
      };

      curResult = {
        index: 0
      };

      if (typeof curData[0] === 'object') {
        curResult.label = curData[0][self.options.jsonName];
        curResult.value = curData[0][self.options.jsonValue];
      } else {
        curResult.label = curData[0];
        curResult.value = curData[0];
      };

      self.cacheSelect.push(curData);
      self.cacheResult.push(curResult);

      group[i].insertAdjacentHTML('afterend', self.createList(curData));
      self.dom.list.removeChild(group[i]);

      if (typeof curData[curResult.index] === 'object' && Array.isArray(curData[curResult.index][self.options.jsonSub])) {
        curData = curData[curResult.index][self.options.jsonSub];
      } else {
        curData = null;
      };
    };
  };

  picker.getResult = function() {
    var self = this;
    var result = {
      label: [],
      value: []
    };

    for (var i = 0; i < self.cacheResult.length; i++) {
      if (typeof self.cacheResult[i] === 'object' && typeof self.cacheResult[i].value === 'undefined') {
        break;
      };

      result.label.push(self.cacheResult[i].label);
      result.value.push(self.cacheResult[i].value);
    };

    return result;
  };


  var cxPicker = function() {
    return cxPicker.attach.apply(cxPicker, arguments);
  };

  cxPicker.attach = function() {
    picker.attach.apply(picker, arguments);
  };

  cxPicker.defaults = {
    value: [],
    selectLength: 0,
    jsonName: 'n',
    jsonValue: 'v',
    jsonSub: 's',
  };

  document.addEventListener('DOMContentLoaded', function() {
    picker.init();
  });

  window.cxPicker = cxPicker;
})();