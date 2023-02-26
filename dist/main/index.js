!function(s,a){"object"==typeof exports&&"object"==typeof module?module.exports=a():"function"==typeof define&&define.amd?define([],a):"object"==typeof exports?exports.main=a():s.main=a()}(self,(()=>(()=>{"use strict";var s={d:(a,n)=>{for(var l in n)s.o(n,l)&&!s.o(a,l)&&Object.defineProperty(a,l,{enumerable:!0,get:n[l]})},o:(s,a)=>Object.prototype.hasOwnProperty.call(s,a),r:s=>{"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(s,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(s,"__esModule",{value:!0})}},a={};s.r(a),s.d(a,{default:()=>l});const n='<p><code>原文地址： https://www.waylon.online/blog?id=5d859e36-d20b-4982-bb83-663bb55eb5b0</code></p>\n<h3 id="webpack自定义loadermarkdown-loader">webpack自定义loader(markdown-loader)</h3>\n<p>一篇关于webpack loader基础知识的博客</p>\n<p>同时记录下自己手撸了一个webpack解析markdown文件的自定义插件;</p>\n<h2 id="前置知识">前置知识</h2>\n<p>loader 本质上是导出为函数的 JavaScript 模块。loader runner 会调用此函数，然后将上一个 loader 产生的结果或者资源文件传入进去。函数中的 this 作为上下文会被 webpack 填充，并且 loader runner 中包含一些实用的方法，比如可以使 loader 调用方式变为异步，或者获取 query 参数。</p>\n<p>用白话文来说,loader的本质就是函数模块，既然是函数，我们关注这个函数的<strong>入参，出参，功能</strong>，即可,以下就是loader的基本结构:</p>\n<pre><code class="hljs language-javascript"><span class="hljs-comment">/**\n *\n * <span class="hljs-doctag">@param</span> {<span class="hljs-type">string|Buffer</span>} content 源文件的内容\n * <span class="hljs-doctag">@param</span> {<span class="hljs-type">object</span>} [map] SourceMap 数据\n * <span class="hljs-doctag">@param</span> {<span class="hljs-type">any</span>} [meta] meta 数据，可以是任何内容\n */</span>\n<span class="hljs-keyword">function</span> <span class="hljs-title function_">webpackLoader</span>(<span class="hljs-params">content, map, meta</span>) {\n  <span class="hljs-comment">// do something...</span>\n}\n\n<span class="hljs-variable language_">module</span>.<span class="hljs-property">exports</span> = webpackLoader\n</code></pre>\n<p>众所周知,loader runner是<strong>从下到上/从右到左</strong>调用loader的,但是我们也能通过配置loader的enforce属性来改变loader的执行顺序;\nenforce</p>\n<pre><code>- pre：前置loader\n- normal：普通loader\n- inline：内联loader\n- post：后置loader\n</code></pre>\n<p>loader在使用方式上分为 <strong>同步 loader，异步 loader，raw loader，pitch loader</strong> 这4类;</p>\n<ol>\n<li>同步 loader: 顾名思义在整个loader的执行流程中为同步执行;</li>\n<li>异步 loader: 内部执行 <code>const callback = this.async()</code>卡住执行进程,等待异步任务执行完毕;</li>\n<li>raw loader: 一般用于处理 <strong>Buffer</strong> 数据流的文件;</li>\n<li>pitch loader: 当前loader依赖上个loader的输出结果，且该结果为js而非webpack处理后的资源(style loader)</li>\n</ol>\n<h2 id="编写自定义loader---markdown-loader">编写自定义Loader - markdown loader</h2>\n<h1 id="1创建loader">1.创建loader</h1>\n<pre><code class="hljs language-javascript"><span class="hljs-keyword">const</span> { marked } = <span class="hljs-built_in">require</span>(<span class="hljs-string">&#x27;marked&#x27;</span>); <span class="hljs-comment">// md =&gt; html</span>\n<span class="hljs-keyword">const</span> hljs = <span class="hljs-built_in">require</span>(<span class="hljs-string">&#x27;highlight.js&#x27;</span>); <span class="hljs-comment">// 样式引入</span>\n<span class="hljs-keyword">const</span> <span class="hljs-title function_">waylonMdLoader</span> = source =&gt; {\n    <span class="hljs-comment">// 初始化样式</span>\n    marked.<span class="hljs-title function_">setOptions</span>({\n        <span class="hljs-attr">renderer</span>: <span class="hljs-keyword">new</span> marked.<span class="hljs-title class_">Renderer</span>(),\n        <span class="hljs-attr">langPrefix</span>: <span class="hljs-string">&#x27;hljs language-&#x27;</span>,\n        <span class="hljs-attr">highlight</span>: <span class="hljs-function"><span class="hljs-params">code</span> =&gt;</span> hljs.<span class="hljs-title function_">highlightAuto</span>(code, [<span class="hljs-string">&#x27;html&#x27;</span>, <span class="hljs-string">&#x27;javascript&#x27;</span>, <span class="hljs-string">&#x27;nginx&#x27;</span>]).<span class="hljs-property">value</span>,\n        <span class="hljs-attr">pedantic</span>: <span class="hljs-literal">false</span>,\n        <span class="hljs-attr">gfm</span>: <span class="hljs-literal">true</span>,\n        <span class="hljs-attr">breaks</span>: <span class="hljs-literal">false</span>,\n        <span class="hljs-attr">sanitize</span>: <span class="hljs-literal">false</span>,\n        <span class="hljs-attr">smartypants</span>: <span class="hljs-literal">false</span>,\n        <span class="hljs-attr">xhtml</span>: <span class="hljs-literal">false</span>\n    });\n    <span class="hljs-comment">// 将marked转为html字符串 网上许多文章写的是marked(xxx) 跑起来有问题</span>\n    <span class="hljs-keyword">const</span> htmlStr = marked.<span class="hljs-title function_">parse</span>(source);\n    <span class="hljs-comment">// 将html字符串转化成一段可以导出的js代码</span>\n    <span class="hljs-keyword">const</span> codeStr = <span class="hljs-string">`export default <span class="hljs-subst">${<span class="hljs-built_in">JSON</span>.stringify(htmlStr)}</span>`</span>;\n    <span class="hljs-keyword">return</span> codeStr;\n};\n<span class="hljs-variable language_">module</span>.<span class="hljs-property">exports</span> = waylonMdLoader;\n</code></pre>\n<h1 id="2添加loader">2.添加loader</h1>\n<pre><code class="hljs language-javascript"><span class="hljs-attr">rules</span>: [\n    {\n        <span class="hljs-attr">test</span>: <span class="hljs-regexp">/\\.md$/</span>, <span class="hljs-comment">// 匹配md文件</span>\n        <span class="hljs-attr">use</span>: [<span class="hljs-string">&#x27;./build/loaders/index.js&#x27;</span>]\n    },\n    {\n        <span class="hljs-attr">test</span>: <span class="hljs-regexp">/\\.(jsx?|babel|es6)$/</span>,\n        <span class="hljs-attr">loader</span>: <span class="hljs-string">&#x27;babel-loader&#x27;</span>,\n        <span class="hljs-attr">options</span>: {\n            <span class="hljs-attr">plugins</span>: [[<span class="hljs-string">&#x27;@babel/plugin-proposal-decorators&#x27;</span>, { <span class="hljs-attr">legacy</span>: <span class="hljs-literal">true</span> }]]\n        },\n        <span class="hljs-attr">exclude</span>: <span class="hljs-regexp">/node_modules/</span>\n    }\n]\n</code></pre>\n<h1 id="3渲染md文件">3.渲染md文件</h1>\n<pre><code class="hljs language-javascript"><span class="hljs-tag">&lt;<span class="hljs-name">template</span>&gt;</span>\n    <span class="hljs-tag">&lt;<span class="hljs-name">div</span> <span class="hljs-attr">class</span>=<span class="hljs-string">&quot;waylon&quot;</span>&gt;</span>\n        <span class="hljs-tag">&lt;<span class="hljs-name">div</span> <span class="hljs-attr">v-html</span>=<span class="hljs-string">&quot;test&quot;</span> /&gt;</span>\n    <span class="hljs-tag">&lt;/<span class="hljs-name">div</span>&gt;</span>\n<span class="hljs-tag">&lt;/<span class="hljs-name">template</span>&gt;</span>\n\n<span class="hljs-tag">&lt;<span class="hljs-name">script</span>&gt;</span><span class="language-javascript">\n<span class="hljs-keyword">import</span> test <span class="hljs-keyword">from</span> <span class="hljs-string">&#x27;./test.md&#x27;</span>;\n<span class="hljs-keyword">export</span> <span class="hljs-keyword">default</span> {\n    <span class="hljs-title function_">data</span>(<span class="hljs-params"></span>) {\n        <span class="hljs-keyword">return</span> { test };\n    },\n    <span class="hljs-title function_">created</span>(<span class="hljs-params"></span>) {\n        <span class="hljs-variable language_">console</span>.<span class="hljs-title function_">warn</span>(<span class="hljs-string">&#x27;test&#x27;</span>, test);\n    },\n};\n</span><span class="hljs-tag">&lt;/<span class="hljs-name">script</span>&gt;</span>\n</code></pre>\n<p>别忘了引入css样式 <a href="https://cdn.bootcss.com/highlight.js/9.18.1/styles/monokai-sublime.min.css">https://cdn.bootcss.com/highlight.js/9.18.1/styles/monokai-sublime.min.css</a>\n更多样式参考 <a href="url">https://highlightjs.org/static/demo/</a></p>\n<h1 id="4最终效果">4.最终效果</h1>\n<p><img src="https://www.waylon.online/static/usr/blog/mdloader.png" alt="">\n大功告成,后面有时间会继续分享webpack插件与自定义插件~</p>\n';function l(){const s=document.querySelector("#waylon-md-loader");s&&(s.innerHTML=n)}return l(),a})()));