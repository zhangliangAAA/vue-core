### Vue工作核心原理

## 编译 compile 
编译template模板
1、parse
使用正则解析template中的vue指令（v-model）变量等，形成语法树AST
2、optiminze
标记一些静态节点，用作后面的性能优化，在diff的时候直接略过
3、generate
把第一部分生成的AST转化为渲染函数 render function

## 响应式
Object.defineProperty
