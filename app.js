(() => {
  "use strict";
  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];
  const root = document.documentElement;
  let toastTimer;
  window.portfolioToast = message => {
    const el = $(".toast");
    el.textContent = message; el.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove("show"), 2600);
  };
  window.portfolioCopy = async value => {
    try { await navigator.clipboard.writeText(value); window.portfolioToast("已复制"); }
    catch { window.portfolioToast("请手动复制地址栏中的链接。"); }
  };
  const themeButton = $("[data-theme-toggle]");
  function syncTheme() {
    const dark = root.dataset.theme === "dark";
    themeButton.setAttribute("aria-label",dark ? "切换为浅色主题" : "切换为深色主题");
    themeButton.title = themeButton.getAttribute("aria-label");
    themeButton.textContent = dark ? "☀" : "◐";
  }
  function toggleTheme() {
    const theme = root.dataset.theme === "dark" ? "light" : "dark";
    root.dataset.theme = theme;
    try { localStorage.setItem("jh-theme",theme); } catch {}
    syncTheme();
  }
  syncTheme(); themeButton.addEventListener("click",toggleTheme);
  $("[data-theme-secondary]")?.addEventListener("click",toggleTheme);
  const menu = $("[data-menu]");
  function closeMenu() {
    menu.setAttribute("aria-expanded","false");menu.setAttribute("aria-label","展开导航");
    $("#navigation").classList.remove("open");document.body.classList.remove("menu-open");
  }
  menu.addEventListener("click",() => {
    const opened = menu.getAttribute("aria-expanded") !== "true";
    menu.setAttribute("aria-expanded",String(opened));
    menu.setAttribute("aria-label",opened ? "收起导航" : "展开导航");
    $("#navigation").classList.toggle("open",opened);document.body.classList.toggle("menu-open",opened);
  });
  $$("#navigation a").forEach(a => a.addEventListener("click",closeMenu));
  document.addEventListener("keydown",ev => {if(ev.key === "Escape")closeMenu();});
  $("[data-copy-url]")?.addEventListener("click",() => window.portfolioCopy("https://z2302743489.github.io/"));
  const onScroll = () => document.body.classList.toggle("scrolled",window.scrollY > 50);
  onScroll();window.addEventListener("scroll",onScroll,{passive:true});
  $$("[data-filter]").forEach(button => button.addEventListener("click",() => {
    $$("[data-filter]").forEach(b => b.setAttribute("aria-pressed",String(b === button)));
    let count=0;
    $$("[data-project]").forEach(item => {
      item.hidden=button.dataset.filter !== "all" && item.dataset.group !== button.dataset.filter;
      if(!item.hidden)count++;
    });
    $("[data-project-count]").textContent=count+" 个项目";
  }));
  const preview=$(".hover-preview");
  if(preview && matchMedia("(hover:hover) and (pointer:fine)").matches) {
    $$("[data-preview-src]").forEach(row => {
      row.addEventListener("pointerenter",() => {
        preview.querySelector("img").src=row.dataset.previewSrc;preview.classList.add("visible");
      });
      row.addEventListener("pointermove",ev => {
        const w=360,h=230;
        const x=Math.max(12,Math.min(innerWidth-w-12,ev.clientX-w/2));
        const y=Math.max(92,Math.min(innerHeight-h-18,ev.clientY-h/2));
        preview.style.transform="translate("+x+"px,"+y+"px)";
      });
      row.addEventListener("pointerleave",() => preview.classList.remove("visible"));
      row.addEventListener("click",() => preview.classList.remove("visible"));
    });
    window.addEventListener("scroll",() => preview.classList.remove("visible"),{passive:true});
  }
  const video=$(".hero-video"),play=$("[data-hero-play]");
  if(video && play) {
    const reduce=matchMedia("(prefers-reduced-motion:reduce)");
    let manuallyPaused=false;
    function syncVideo() {
      play.textContent=video.paused ? "播放画面" : "暂停画面";
      play.setAttribute("aria-pressed",String(!video.paused));
    }
    ["play","pause","ended"].forEach(event => video.addEventListener(event,syncVideo));
    async function start() { try { await video.play(); } catch { syncVideo(); } }
    play.addEventListener("click",() => {
      if(video.paused) {manuallyPaused=false;start();} else {manuallyPaused=true;video.pause();}
    });
    if(!reduce.matches && !navigator.connection?.saveData)start();
    reduce.addEventListener("change",() => {if(reduce.matches)video.pause();});
    if("IntersectionObserver" in window) {
      new IntersectionObserver(entries => {
        if(!entries[0].isIntersecting)video.pause();
        else if(!manuallyPaused&&!reduce.matches&&!document.hidden&&!navigator.connection?.saveData)start();
      },{threshold:.1}).observe(video);
    }
    document.addEventListener("visibilitychange",() => {if(document.hidden)video.pause();});
  }
})();
