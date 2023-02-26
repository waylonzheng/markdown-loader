const { marked } = require('marked'); // md => html
const hljs = require('highlight.js'); // 样式引入
module.exports = source => {
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
