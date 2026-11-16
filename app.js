(() => {
  "use strict";
  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];
  const base = document.body.dataset.base || "./";
  let toastTimer;
  window.portfolioToast = message => {
    const el = $(".toast");
    el.textContent = message;
    el.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove("show"), 2600);
  };
  window.portfolioCopy = async value => {
    try { await navigator.clipboard.writeText(value); window.portfolioToast("已复制"); }
    catch { window.portfolioToast("当前浏览器无法复制，请手动选择内容。"); }
  };
  const themeButton = $("[data-theme-toggle]");
  function syncTheme() {
    const dark = document.documentElement.dataset.theme === "dark";
    themeButton.setAttribute("aria-label", dark ? "切换为浅色主题" : "切换为深色主题");
    themeButton.title = dark ? "切换为浅色主题" : "切换为深色主题";
    themeButton.textContent = dark ? "☀" : "◐";
  }
  syncTheme();
  themeButton.addEventListener("click", () => {
    const theme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = theme;
    try { localStorage.setItem("jh-theme", theme); } catch {}
    syncTheme();
  });
  const menuButton = $("[data-menu]");
  menuButton.addEventListener("click", () => {
    const opened = menuButton.getAttribute("aria-expanded") !== "true";
    menuButton.setAttribute("aria-expanded", String(opened));
    menuButton.setAttribute("aria-label", opened ? "收起导航" : "展开导航");
    $("#navigation").classList.toggle("open", opened);
  });
  $$("#navigation a").forEach(a => a.addEventListener("click", () => {
    $("#navigation").classList.remove("open");
    menuButton.setAttribute("aria-expanded", "false");
    menuButton.setAttribute("aria-label", "展开导航");
  }));
  $("[data-copy-url]")?.addEventListener("click", () => window.portfolioCopy("https://z2302743489.github.io/"));
  $$("[data-filter]").forEach(button => button.addEventListener("click", () => {
    $$("[data-filter]").forEach(b => b.setAttribute("aria-pressed", String(b === button)));
    let count = 0;
    $$("[data-project]").forEach(item => {
      item.hidden = button.dataset.filter !== "all" && item.dataset.group !== button.dataset.filter;
      if (!item.hidden) count++;
    });
    $("[data-project-count]").textContent = count + " 个项目";
  }));
  const previews = {
    zhixu: {name:"知序 · 企业知识库",title:"从答案，回到依据。",description:"文档管理与带引用的 AI 问答",image:"zhixu-chat.png",slug:"zhixu"},
    cash: {name:"cash.ai · 游戏创作",title:"让游戏创意，可以试玩。",description:"从玩法描述到制作、审查与预览",image:"cash-dark.png",slug:"cash"},
    grok: {name:"Grok fat · 桌面 Agent",title:"让工具，更像自己的伙伴。",description:"个人 Agent 桌面版与 Fat 主题形象",image:"grok-app.jpg",slug:"grok-fat"}
  };
  const tabs = $$("[data-preview]");
  function showPreview(button) {
    const p = previews[button.dataset.preview];
    tabs.forEach(b => {b.setAttribute("aria-selected", String(b === button)); b.tabIndex = b === button ? 0 : -1;});
    $("[data-preview-image]").src = base + "assets/screens/" + p.image;
    $("[data-preview-image]").alt = p.name + "项目界面";
    $("[data-preview-name]").textContent = p.name;
    $("[data-preview-title]").textContent = p.title;
    $("[data-preview-description]").textContent = p.description;
    $$("[data-preview-link]").forEach(a => {a.href = base + "projects/" + p.slug + "/";});
  }
  tabs.forEach((b,i) => {
    b.addEventListener("click", () => showPreview(b));
    b.addEventListener("keydown", ev => {
      if (!["ArrowLeft","ArrowRight","Home","End"].includes(ev.key)) return;
      ev.preventDefault();
      const n = ev.key === "Home" ? 0 : ev.key === "End" ? tabs.length-1 : (i + (ev.key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length;
      tabs[n].focus(); showPreview(tabs[n]);
    });
  });
})();
