import md from './waylon-md-loader.md'
export default function renderMd () {
    const el = document.querySelector('#waylon-md-loader');
    if (!el) return;
    el.innerHTML = md;
}
renderMd();