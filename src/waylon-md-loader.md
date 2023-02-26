`原文地址： https://www.waylon.online/blog?id=5d859e36-d20b-4982-bb83-663bb55eb5b0`
### webpack自定义loader(markdown-loader)
一篇关于webpack loader基础知识的博客

同时记录下自己手撸了一个webpack解析markdown文件的自定义插件;
## 前置知识
loader 本质上是导出为函数的 JavaScript 模块。loader runner 会调用此函数，然后将上一个 loader 产生的结果或者资源文件传入进去。函数中的 this 作为上下文会被 webpack 填充，并且 loader runner 中包含一些实用的方法，比如可以使 loader 调用方式变为异步，或者获取 query 参数。

用白话文来说,loader的本质就是函数模块，既然是函数，我们关注这个函数的**入参，出参，功能**，即可,以下就是loader的基本结构:

```javascript
/**
 *
 * @param {string|Buffer} content 源文件的内容
 * @param {object} [map] SourceMap 数据
 * @param {any} [meta] meta 数据，可以是任何内容
 */
function webpackLoader(content, map, meta) {
  // do something...
}

module.exports = webpackLoader
```
众所周知,loader runner是**从下到上/从右到左**调用loader的,但是我们也能通过配置loader的enforce属性来改变loader的执行顺序;
enforce

    - pre：前置loader
    - normal：普通loader
    - inline：内联loader
    - post：后置loader
loader在使用方式上分为 **同步 loader，异步 loader，raw loader，pitch loader** 这4类;

1. 同步 loader: 顾名思义在整个loader的执行流程中为同步执行;
2. 异步 loader: 内部执行 `const callback = this.async()`卡住执行进程,等待异步任务执行完毕;
3. raw loader: 一般用于处理 **Buffer** 数据流的文件;
4. pitch loader: 当前loader依赖上个loader的输出结果，且该结果为js而非webpack处理后的资源(style loader)

## 编写自定义Loader - markdown loader

# 1.创建loader
```javascript
const { marked } = require('marked'); // md => html
const hljs = require('highlight.js'); // 样式引入
const waylonMdLoader = source => {
    // 初始化样式
    marked.setOptions({
        renderer: new marked.Renderer(),
        langPrefix: 'hljs language-',
        highlight: code => hljs.highlightAuto(code, ['html', 'javascript', 'nginx']).value,
        pedantic: false,
        gfm: true,
        breaks: false,
        sanitize: false,
        smartypants: false,
        xhtml: false
    });
    // 将marked转为html字符串 网上许多文章写的是marked(xxx) 跑起来有问题
    const htmlStr = marked.parse(source);
    // 将html字符串转化成一段可以导出的js代码
    const codeStr = `export default ${JSON.stringify(htmlStr)}`;
    return codeStr;
};
module.exports = waylonMdLoader;
```
# 2.添加loader
```javascript
rules: [
    {
        test: /\.md$/, // 匹配md文件
        use: ['./build/loaders/index.js']
    },
    {
        test: /\.(jsx?|babel|es6)$/,
        loader: 'babel-loader',
        options: {
            plugins: [['@babel/plugin-proposal-decorators', { legacy: true }]]
        },
        exclude: /node_modules/
    }
]
```
# 3.渲染md文件
```javascript
<template>
    <div class="waylon">
        <div v-html="test" />
    </div>
</template>

<script>
import test from './test.md';
export default {
    data() {
        return { test };
    },
    created() {
        console.warn('test', test);
    },
};
</script>
```
别忘了引入css样式 https://cdn.bootcss.com/highlight.js/9.18.1/styles/monokai-sublime.min.css
更多样式参考 [https://highlightjs.org/static/demo/](url)
# 4.最终效果

![](https://www.waylon.online/static/usr/blog/mdloader.png)
大功告成,后面有时间会继续分享webpack插件与自定义插件~