const tabs = [...document.querySelectorAll('[role="tab"]')];
function activateTab(tab, focus = false) {
  tabs.forEach(item => {
    const selected = item === tab;
    item.setAttribute('aria-selected', String(selected));
    item.tabIndex = selected ? 0 : -1;
    document.getElementById(item.getAttribute('aria-controls')).hidden = !selected;
  });
  if (focus) tab.focus();
}
tabs.forEach((tab, index) => {
  tab.addEventListener('click', () => activateTab(tab));
  tab.addEventListener('keydown', event => {
    let target;
    if (event.key === 'ArrowRight') target = tabs[(index + 1) % tabs.length];
    if (event.key === 'ArrowLeft') target = tabs[(index - 1 + tabs.length) % tabs.length];
    if (event.key === 'Home') target = tabs[0];
    if (event.key === 'End') target = tabs[tabs.length - 1];
    if (target) { event.preventDefault(); activateTab(target, true); }
  });
});
const header = document.querySelector('.header');
function updateHeader() { header.classList.toggle('scrolled', window.scrollY > 12); }
window.addEventListener('scroll', updateHeader, { passive: true });
updateHeader();
document.getElementById('year').textContent = new Date().getFullYear();
let toastTimer;
function toast(message) {
  const element = document.getElementById('toast');
  element.textContent = message;
  element.classList.add('visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => element.classList.remove('visible'), 3500);
}
document.getElementById('copy-card').addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText('张健航 · AI 产品经理\nhttps://z2302743489.github.io/');
    toast('网站链接已复制，期待与你交流。');
  } catch {
    toast('请从地址栏复制网站链接：https://z2302743489.github.io/');
  }
});
