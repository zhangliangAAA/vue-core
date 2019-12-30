class Compile {
  constructor(el, vm) {
    //要遍历的宿主节点
    this.$el = document.querySelector(el);

    this.$vm = vm;

    // 编译
    if (this.$el) {
      // 转换内部内容为片段 fragment
      this.$fragment = this.node2Fragment(this.$el);
      // 执行编译
      this.compile(this.$fragment);
      // 将编译完成的html结果追加到$el
      this.$el.appendChild(this.$fragment);
    }
  }
  // 将宿主元素中代码片段拿出来遍历
  node2Fragment(el) {
    const frag = document.createDocumentFragment();
    // 将el中所有的子元素搬至frag中
    let child;
    while ((child = el.firstChild)) {
      frag.appendChild(child);
    }
    return frag;
  }
  //编译过程
  compile(el) {
    const childNodes = el.childNodes;
    Array.from(childNodes).forEach(node => {
      //类型判断
      if (this.isElement(node)) {
        //元素 处理指令类
        console.log('编译元素', node.nodeName);
        // 查询 k- @ :
        const nodeAttrs = node.attributes;
        Array.from(nodeAttrs).forEach(attr => {
          const attrName = attr.name; //属性名称
          const exp = attr.value; //属性值
          if (this.isDirective(attrName)) {
            //eg: k-text
            const dir = attrName.substring(2);
            //执行指令
            this[dir] && this[dir](node, this.$vm, exp);
          }
          if (this.isEvent(attrName)) {
            const dir = attrName.substring(1);
            //执行指令
            this.eventHandler(node, this.$vm, exp, dir);
          }
        });
      } else if (this.isInterpolation(node)) {
        //插值文本 处理{{}}
        console.log('编译文本', node.textContent);
        this.compileText(node);
      }
      // 递归子节点
      if (node.childNodes && node.childNodes.length > 0) {
        this.compile(node);
      }
    });
  }
  // 编译text
  compileText(node) {
    console.log('compileText', RegExp.$1);
    this.update(node, this.$vm, RegExp.$1, 'text');
  }
  // 事件处理器
  eventHandler(node, vm, exp, dir) {
    let fn = vm.$options.methods && vm.$options.methods[exp];
    if (dir && fn) {
      node.addEventListener(dir, fn.bind(vm));
    }
  }
  text(node, vm, exp) {
    this.update(node, vm, exp, 'text');
  }
  //双向绑定model
  model(node, vm, exp) {
    // 指定input的value值
    this.update(node, vm, exp, 'model');
    // 视图对于模型相应
    node.addEventListener('input', e => {
      vm[exp] = e.target.value;
    });
  }
  html(node, vm, exp){
    this.update(node, vm, exp, 'html');
  }
  // 更新函数
  update(node, vm, exp, dir) {
    const updaterFn = this[dir + 'Updater'];
    // 初始化
    updaterFn && updaterFn(node, vm[exp]);
    // 依赖收集
    new Watcher(vm, exp, function(val) {
      updaterFn && updaterFn(node, vm[exp]);
    });
  }

  textUpdater(node, val) {
    node.textContent = val;
  }
  modelUpdater(node, val){
    node.textContent = val;
  }
  htmlUpdater(node, val){
    node.innerHTML = val;
  }

  isDirective(attr) {
    return attr.indexOf('k-') === 0;
  }
  isEvent(attr) {
    return attr.indexOf('@') === 0;
  }
  isElement(node) {
    return node.nodeType === 1;
  }
  //插值文本
  isInterpolation(node) {
    return node.nodeType === 3 && /\{\{(.*)\}\}/.test(node.textContent);
  }
}
