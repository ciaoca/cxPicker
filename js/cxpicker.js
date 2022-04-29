/**
 * cxPicker
 * @version 1.0.1
 * @author ciaoca
 * @email ciaoca@gmail.com
 * @site https://github.com/ciaoca/cxPicker
 * @license Released under the MIT license
 */
(function() {
  const picker = {
    dom: {}
  };

  picker.init = function() {
    const self = this;

    self.loopTime = 100;

    self.dom.wrap = document.createElement('div');
    self.dom.wrap.classList.add('cxpicker');
    self.dom.wrap.innerHTML = `<div class="mask"></div>
      <div class="box">
        <div class="acts">
          <a class="cancel" href="javascript://" rel="cxpicker_hide"></a>
          <a class="set" href="javascript://" rel="cxpicker_set"></a>
        </div>
        <div class="list"></div>
      </div>
    </div>`;

    self.dom.list = self.dom.wrap.querySelector('.list');

    if('ontouchend' in document.documentElement){
      self.dom.list.addEventListener('touchend', () => {
        self.checkStable();
      });

    } else {
      self.dom.list.addEventListener('mousewheel', () => {
        clearTimeout(self.scrollThrottle);

        self.scrollThrottle = setTimeout(() => {
          self.checkStable();
        }, self.loopTime);
      });
    };

    self.dom.wrap.addEventListener('click', (e) => {
      const el = e.target;
      const nodeName = el.nodeName.toLowerCase();

      if (nodeName === 'a') {
        switch (el.rel) {
          case 'cxpicker_hide':
            event.preventDefault();
            self.hide();
            break;

          case 'cxpicker_set':
            event.preventDefault();
            self.confirm();
            break;
        };

      } else if (nodeName === 'div') {
        for (let x of el.classList) {
          if (x === 'mask') {
            self.hide();
            break;
          };
        };
      }
    });

    document.body.insertAdjacentElement('beforeend', self.dom.wrap);
  };

  picker.setOptions = function(options) {
    const self = this;

    self.options = Object.assign({}, cxPicker.defaults, options);

    if (typeof self.options.jsonValue !== 'string' || !self.options.jsonValue.length) {
      self.options.jsonValue = self.options.jsonName;
    };
  };

  picker.attach = function(options) {
    const self = this;

    self.setOptions(options);

    if (!Array.isArray(self.options.data)) {
      console.warn('[cxPicker] data is not array.')
      return;
    };

    if (self.options.selectLength === 0) {
      self.options.selectLength = self.options.data.length;
    };

    self.cacheSelect = [];
    self.cacheResult = [];
    self.subStart = null;

    self.buildSelect();
    self.show();
  };

  picker.buildSelect = function() {
    const self = this;
    let subData;
    let html = '';

    for (let i = 0; i < self.options.selectLength; i++) {
      let curData;

      if (Array.isArray(subData)) {
        curData = subData;
      } else if (self.options.data.length - i > 0) {
        curData = self.options.data[i];
      } else {
        curData = [];
      };

      const curResult = {
        index: 0
      };

      if (curData.length && self.options.value.length - i > 0) {
        for (let j = 0, k = curData.length; j < k; j++) {
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

    for (let x of self.cacheSelect) {
      html += self.createList(x);
    };
    self.dom.list.innerHTML = html;

    // 调整选项定位
    const group = self.dom.list.getElementsByTagName('ul');
    self.itemHeight = self.dom.list.getElementsByTagName('li')[0].offsetHeight;

    for (let i = 0, l = self.cacheResult.length; i < l; i++) {
      self.cacheResult[i].top = self.itemHeight * self.cacheResult[i].index;
      group[i].scrollTop = self.cacheResult[i].top;
    };
  };

  picker.createList = function(data) {
    const self = this;
    const list = [];

    for (let x of data) {
      list.push(self.createItem(x));
    }

    return '<section><ul>' + list.join('') + '</ul></section>';
  };

  picker.createItem = function(data) {
    const self = this;
    let html = '';

    if (typeof data === 'object') {
      html = '<li data-value="' + data[self.options.jsonValue] + '">' + data[self.options.jsonName] + '</li>';

    } else {
      html = '<li data-value="' + data + '">' + data + '</li>';
    };

    return html;
  };

  picker.show = function() {
    const self = this;

    self.dom.wrap.classList.remove('out');
    self.dom.wrap.classList.add('in');
  };

  picker.hide = function() {
    const self = this;

    self.dom.wrap.classList.remove('in');
    self.dom.wrap.classList.add('out');
  };

  picker.confirm = function() {
    const self = this;

    self.checkStable(true);

    if (typeof self.options.callback === 'function') {
      self.options.callback(self.getResult());
    };

    self.hide();
  };

  picker.checkStable = function(isForce) {
    const self = this;
    const group = self.dom.list.getElementsByTagName('ul');
    let pass = true;

    if (isForce) {
      self.checkLock = false;
    };

    if (self.checkLock) {
      return;
    };

    clearTimeout(self.checkLoop);

    for (let i = 0, l = group.length; i < l; i++) {
      if (group[i].scrollTop !== self.cacheResult[i].top) {
        if (group[i].scrollTop > self.cacheResult[i].top) {
          self.cacheResult[i].index = Math.ceil(group[i].scrollTop / self.itemHeight);
        } else {
          self.cacheResult[i].index = Math.floor(group[i].scrollTop / self.itemHeight);
        };

        self.cacheResult[i].top = group[i].scrollTop;
        pass = false;
        break;
      };
    };

    if (!pass && !isForce) {
      self.checkLock = true;
      self.checkLoop = setTimeout(() => {
        self.checkLock = false;
        self.checkStable();
      }, self.loopTime);
      return;
    };

    self.checkSelect();
  };

  picker.checkSelect = function() {
    const self = this;
    const group = self.dom.list.getElementsByTagName('ul');

    for (let i = 0; i < self.options.selectLength; i++) {
      const curIndex = self.cacheResult[i].index;
      const curValue = self.cacheResult[i].value;
      const curItem = self.cacheSelect[i][curIndex];
      const curTop = curIndex * self.itemHeight;
      let subData;
      let newLabel;
      let newValue;

      if (group[i].scrollTop !== curTop) {
        group[i].scrollTop = curTop;
      };

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
    const self = this;
    const group = self.dom.list.getElementsByTagName('section');
    const start = index + 1;
    let curData;

    if (Array.isArray(self.cacheSelect[index][self.cacheResult[index].index][self.options.jsonSub])) {
      curData = self.cacheSelect[index][self.cacheResult[index].index][self.options.jsonSub];
    };

    self.cacheSelect.splice(start, self.options.selectLength - index);
    self.cacheResult.splice(start, self.options.selectLength - index);

    for (let i = start; i < self.options.selectLength; i++) {
      if (!Array.isArray(curData)) {
        curData = [];
      };

      const curResult = {
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
    const self = this;
    const result = {
      label: [],
      value: []
    };

    for (let x of self.cacheResult) {
      if (typeof x === 'object' && typeof x.value === 'undefined') {
        break;
      };

      result.label.push(x.label);
      result.value.push(x.value);
    };

    return result;
  };


  const cxPicker = function() {
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

  document.addEventListener('DOMContentLoaded', () => {
    picker.init();
  });

  window.cxPicker = cxPicker;
})();