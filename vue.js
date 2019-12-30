// 模仿Vue new KVue({data:{...}})
let globalWatcher = null;

class KVue {
  constructor(options) {
    this.$data = options.data;
    this.$options = options;
    this.observer(this.$data);
    //模拟 一个个 watcher创建
    // new Watcher();
    // this.$data.test;
    // new Watcher();
    // this.$data.foo.bar;

    // 编译
    new Compile(options.el, this)

    // 钩子函数
    if(options.created){
      options.created.call(this) //绑定this
    }
  }
  // 观察函数
  observer(value) {
    if (!value || typeof value !== 'object') {
      return;
    }
    // 遍历
    Object.keys(value).forEach(key => {
      this.defineReactive(value, key, value[key]);
      // 代理data中的属性到vue实例上
      this.proxyData(key)
    });
  }
  proxyData(key){
    Object.defineProperty(this, key, {
      get(){
        return this.$data[key]
      },
      set(newVal){
        this.$data[key] = newVal
      }
    })
  }
  // 定义响应式
  defineReactive(obj, key, val) {
    // 递归建立观察者
    this.observer(val)

    const dep = new Dep()

    const self = this
    Object.defineProperty(obj, key, {
      enumerable: true /* 属性可枚举 */,
      configurable: true /* 属性可被修改或删除 */,
      get() {
        // Dep.target && dep.addDep(Dep.target)
        globalWatcher && dep.addDep(globalWatcher)
        return val;
      },
      set(newVal) {
        if (newVal === val) return;
        val = newVal
        //  console.log(`${key}值变化为：${val}`);
        dep.notify()
        // self.cb(newVal);
      },
    });
  }
  cb(val) {
    console.log('更新数据了', val);
  }
}

// Dep: 管理多个Watcher；每个key有一个Dep
class Dep {
  constructor(){
    // 这里存放若干依赖（Watcher）
    this.deps = []
  }
  addDep(dep){
    this.deps.push(dep)
  }
  notify(){
    this.deps.forEach(dep => {
      dep.update()
    });
  }
}

class Watcher{
  constructor(vm, key, cb){
    this.vm = vm;
    this.key = key;
    this.cb = cb;
     // 将当前Watcher实例指定到Dep静态属性target
     console.log('who is this',this);
     // Dep.target = this
     globalWatcher = this;
     // 触发getter 添加依赖
     this.vm[this.key]
     //添加完成后置空
    //  Dep.target = null
     globalWatcher = null
  }
  update(){
    console.log('属性更行啦');
    this.cb.call(this.vm,this.vm[this.key])
  }
}
