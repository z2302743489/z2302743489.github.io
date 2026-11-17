(() => {
  "use strict";
  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];
  const root=document.documentElement;
  let toastTimer;
  window.portfolioToast=message=>{
    const el=$(".toast");el.textContent=message;el.classList.add("show");
    clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove("show"),2600);
  };
  window.portfolioCopy=async value=>{
    try{await navigator.clipboard.writeText(value);window.portfolioToast("已复制");}
    catch{window.portfolioToast("请手动复制内容或地址栏链接。");}
  };

  const header=$(".site-header");
  const onScroll=()=>header.classList.toggle("scrolled",scrollY>80);
  onScroll();addEventListener("scroll",onScroll,{passive:true});

  const panel=$(".contact-panel");
  let contactTrigger;
  function closeContact(){
    panel.hidden=true;document.body.classList.remove("contact-open");
    if(contactTrigger)contactTrigger.focus({preventScroll:true});
  }
  $$("[data-contact]").forEach(button=>button.addEventListener("click",()=>{
    if(!panel.hidden){closeContact();return;}
    contactTrigger=button;panel.hidden=false;document.body.classList.add("contact-open");
    $("[data-contact-close]").focus({preventScroll:true});
  }));
  $("[data-contact-close]").addEventListener("click",closeContact);

  const searchBackdrop=$("[data-search-backdrop]");
  const input=$("#project-search");
  const results=$(".search-results");
  const entries=JSON.parse($("#search-data").textContent);
  function renderSearch(){
    const q=input.value.trim().toLowerCase();
    const matches=entries.filter(x=>(x.name+" "+x.detail).toLowerCase().includes(q));
    results.replaceChildren();
    if(!matches.length){
      const p=document.createElement("p");p.className="search-empty";p.textContent="没有找到这个项目，试试其他关键词。";results.append(p);return;
    }
    matches.forEach(item=>{
      const a=document.createElement("a");a.className="search-result";a.href=item.href;
      const strong=document.createElement("strong");strong.textContent=item.name;
      const small=document.createElement("small");small.textContent=item.detail;
      a.append(strong,small);results.append(a);
    });
  }
  function closeSearch(){searchBackdrop.hidden=true;document.body.classList.remove("scroll-lock");}
  function openSearch(){closeContact();searchBackdrop.hidden=false;document.body.classList.add("scroll-lock");renderSearch();input.focus();}
  input.addEventListener("input",renderSearch);
  input.addEventListener("keydown",ev=>{
    if(ev.key==="Enter"){const a=results.querySelector("a");if(a){ev.preventDefault();a.click();}}
    if(ev.key==="ArrowDown"){const a=results.querySelector("a");if(a){ev.preventDefault();a.focus();}}
  });
  $("[data-search-close]").addEventListener("click",closeSearch);
  searchBackdrop.addEventListener("click",ev=>{if(ev.target===searchBackdrop)closeSearch();});
  document.addEventListener("keydown",ev=>{
    const editable=ev.target instanceof Element && (ev.target.matches("input,textarea,select")||ev.target.isContentEditable);
    if(ev.key==="/"&&!editable){ev.preventDefault();openSearch();}
    if(ev.key==="Escape"){if(!searchBackdrop.hidden)closeSearch();else if(!panel.hidden)closeContact();}
    if(ev.key==="Tab"&&!searchBackdrop.hidden){
      const controls=[input,$("[data-search-close]"),...results.querySelectorAll("a")];
      const first=controls[0],last=controls.at(-1);
      if(ev.shiftKey&&document.activeElement===first){ev.preventDefault();last.focus();}
      else if(!ev.shiftKey&&document.activeElement===last){ev.preventDefault();first.focus();}
    }
  });

  const themeButton=$("[data-theme-toggle]");
  let selectedHour=13;
  function applyTheme(theme,persist=true){
    root.dataset.theme=theme;
    themeButton.setAttribute("aria-label",theme==="dark"?"切换为浅色主题":"切换为深色主题");
    if(persist){try{localStorage.setItem("jh-theme",theme);}catch{}}
  }
  applyTheme(root.dataset.theme==="dark"?"dark":"light",false);
  const canvas=$(".aura canvas");
  const ctx=canvas.getContext("2d");
  const reduce=matchMedia("(prefers-reduced-motion:reduce)");
  let phase=0,lastFrame=0,raf=0;
  function draw(time){
    const data=ctx.createImageData(32,32);
    for(let y=0;y<32;y++)for(let x=0;x<32;x++){
      const a=Math.min(x,30),b=Math.min(y,30),i=(y*32+x)*4;
      data.data[i]=150+64*Math.cos((a*a-b*b)/300+time);
      data.data[i+1]=200+64*Math.sin((a*a*Math.cos(time/4)+b*b*Math.sin(time/3))/300);
      data.data[i+2]=100+64*Math.sin(5*Math.sin(time/9)+((a-100)**2+(b-100)**2)/1100);
      data.data[i+3]=255;
    }
    ctx.putImageData(data,0,0);
  }
  function frame(t){
    if(document.hidden||reduce.matches||innerWidth<768){raf=0;return;}
    if(t-lastFrame>30){phase+=.05;draw(phase);lastFrame=t;}
    raf=requestAnimationFrame(frame);
  }
  function startCanvas(){
    draw(phase);
    if(!raf&&!reduce.matches&&innerWidth>=768&&!document.hidden)raf=requestAnimationFrame(frame);
  }
  function selectHour(hour,persist=true){
    selectedHour=hour;phase=(hour-13)*.7;
    const dark=hour<6||hour>=20;applyTheme(dark?"dark":"light",persist);
    $$("[data-hour]").forEach(button=>{
      const active=Number(button.dataset.hour)===hour;
      button.classList.toggle("active",active);button.setAttribute("aria-pressed",String(active));
      button.querySelector(".hour-bubble").textContent=dark?"☾":"☀";
    });
    draw(phase);
  }
  $$("[data-hour]").forEach(button=>button.addEventListener("click",()=>selectHour(Number(button.dataset.hour))));
  themeButton.addEventListener("click",()=>selectHour(root.dataset.theme==="dark"?13:22));
  selectHour(root.dataset.theme==="dark"?22:13,false);
  startCanvas();
  document.addEventListener("visibilitychange",()=>{
    if(document.hidden){cancelAnimationFrame(raf);raf=0;}else startCanvas();
  });
  reduce.addEventListener("change",()=>{cancelAnimationFrame(raf);raf=0;startCanvas();});
  addEventListener("resize",()=>{
    if(innerWidth<768){cancelAnimationFrame(raf);raf=0;}else startCanvas();
  },{passive:true});
})();
