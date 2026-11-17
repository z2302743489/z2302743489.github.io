(() => {
  "use strict";
  const root = document.querySelector("#project-demo");
  if (!root) return;
  const base = document.body.dataset.base;
  const type = document.body.dataset.demo;
  const esc = value => String(value).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const asset = path => base + "assets/" + path;
  const list = items => "<ul>" + items.map(x => "<li>" + esc(x) + "</li>").join("") + "</ul>";
  const link = (url,label) => `<a href="${esc(url)}" target="_blank" rel="noopener noreferrer" class="text-link">${label} ↗</a>`;
  const shell = (name, tag, html) => { root.innerHTML = `<div class="demo-top"><strong>${name}</strong><span>${tag}</span></div><div class="demo-body">${html}</div>`; };
  const download = (filename,text) => {
    const url = URL.createObjectURL(new Blob([text],{type:"text/markdown;charset=utf-8"}));
    const a = document.createElement("a"); a.href=url; a.download=filename; a.click();
    setTimeout(() => URL.revokeObjectURL(url),1000);
  };
  const pressed = (selector,button) => root.querySelectorAll(selector).forEach(b => b.setAttribute("aria-pressed",String(b===button)));
  const gallery = (id,images) => `<div class="screen-gallery" data-gallery="${id}"><div class="demo-tabs">${images.map((x,i)=>`<button data-screen="${i}" aria-pressed="${i===0}">${x[0]}</button>`).join("")}</div><div class="screen-view"><img src="${asset("screens/"+images[0][1])}" alt="${images[0][0]}" loading="lazy"></div></div>`;
  function wireGallery(id,images) {
    const g=root.querySelector('[data-gallery="'+id+'"]');
    g.querySelectorAll("button").forEach(b=>b.addEventListener("click",()=>{
      g.querySelectorAll("button").forEach(x=>x.setAttribute("aria-pressed",String(x===b)));
      g.querySelector("img").src=asset("screens/"+images[Number(b.dataset.screen)][1]);
      g.querySelector("img").alt=images[Number(b.dataset.screen)][0];
    }));
  }
  function knowledge(f) {
    const d=f.knowledge;
    shell("知序 / 来源问答","公开虚构资料 · 预置回答",`<div class="sample-questions">${d.questions.map((q,i)=>`<button class="question-button" data-question="${i}" aria-pressed="${i===0}">${esc(q.question)}</button>`).join("")}</div><article class="demo-panel"><h3>示例回答</h3><div class="answer" aria-live="polite"></div><div class="source-list"></div><div class="source-excerpt" hidden></div></article><details style="margin-top:18px"><summary class="text-link">查看完整演示资料</summary><div class="demo-panel" style="margin-top:12px"><pre>${esc(d.sourceText)}</pre></div></details><p class="demo-gallery-caption">项目实际界面</p>${gallery("knowledge",[["问答与引用","zhixu-chat.png"],["知识库管理","zhixu-knowledge.png"],["文档导入","zhixu-import.png"]])}`);
    function show(i) {
      const q=d.questions[i];
      root.querySelector(".answer").textContent=q.answer;
      const excerpt=root.querySelector(".source-excerpt"); excerpt.hidden=true;
      root.querySelector(".source-list").innerHTML=q.excerpts.map((x,j)=>`<button class="source-button" data-source="${j}" aria-expanded="false">${esc(x.file.split("/").pop())} · L${x.lineStart}–${x.lineEnd}</button>`).join("");
      root.querySelectorAll("[data-source]").forEach(b=>b.addEventListener("click",()=>{
        const x=q.excerpts[Number(b.dataset.source)];
        excerpt.hidden=!excerpt.hidden;
        b.setAttribute("aria-expanded",String(!excerpt.hidden));
        excerpt.innerHTML=`<strong>来源原文</strong><br>${esc(x.text)}<br>${link(x.url,"在仓库查看")}`;
      }));
    }
    root.querySelectorAll("[data-question]").forEach(b=>b.addEventListener("click",()=>{pressed("[data-question]",b);show(Number(b.dataset.question));}));
    wireGallery("knowledge",[["问答与引用","zhixu-chat.png"],["知识库管理","zhixu-knowledge.png"],["文档导入","zhixu-import.png"]]);
    show(0);
  }
  function launch(f) {
    const d=f.launch;
    let selected=0;
    const checked=new Set();
    shell("想法到上线 / 六阶段导览","手册流程 · 可勾选与下载",`<div class="process-steps">${d.stages.map((s,i)=>`<button data-stage="${i}" class="${i===0?"active":""}" aria-pressed="${i===0}">0${s.stage} ${esc(s.title)}</button>`).join("")}</div><div data-stage-content></div><div class="case-actions"><button class="button small primary" data-download-stage>下载本阶段清单 ↓</button><a class="button small secondary" href="${base}content/prd-template.md" download="PRD模板.md">下载原始 PRD 模板 ↓</a></div><p class="demo-caption">PRD 模板与原始工具包：hubooooooo · MIT</p>`);
    function show(i) {
      selected=i; const s=d.stages[i];
      root.querySelector("[data-stage-content]").innerHTML=`<h3>${esc(s.title)}</h3><p class="stage-summary">AI 的工作：${esc(s.aiWork)}</p><div class="demo-columns"><article class="demo-panel"><h3>人需要核对</h3><ul class="demo-checklist">${s.humanChecks.map((x,j)=>`<li><label><input type="checkbox" data-check="${i}-${j}" ${checked.has(i+"-"+j)?"checked":""}><span>${esc(x)}</span></label></li>`).join("")}</ul></article><article class="demo-panel"><h3>阶段交付物</h3>${list(s.deliverables)}</article></div><p class="demo-caption">${link(s.sourceUrl,"查看手册对应阶段")}</p>`;
      root.querySelectorAll("[data-check]").forEach(input=>input.addEventListener("change",()=>{input.checked?checked.add(input.dataset.check):checked.delete(input.dataset.check);}));
    }
    root.querySelectorAll("[data-stage]").forEach(b=>b.addEventListener("click",()=>{
      root.querySelectorAll("[data-stage]").forEach(x=>{x.classList.toggle("active",x===b);x.setAttribute("aria-pressed",String(x===b));});show(Number(b.dataset.stage));
    }));
    root.querySelector("[data-download-stage]").addEventListener("click",()=>{
      const s=d.stages[selected];
      download("阶段"+s.stage+"-"+s.title+".md","# "+s.title+"\n\nAI 工作\n"+s.aiWork+"\n\n## 人工核对\n"+s.humanChecks.map((x,j)=>"- ["+(checked.has(selected+"-"+j)?"x":" ")+"] "+x).join("\n")+"\n\n## 交付物\n"+s.deliverables.map(x=>"- "+x).join("\n")+"\n\n来源："+s.sourceUrl+"\n原始工具包：hubooooooo（MIT）\n");
    });show(0);
  }
  function notes(f) {
    const d=f.notes;
    let selected="standard";
    shell("课堂纪要 / 同一份材料，两种整理","公开转写 · 固定整理示例",`<div class="demo-columns"><article class="demo-panel"><h3>课堂原始记录</h3><pre>${esc(d.transcript)}</pre><p class="demo-caption">${link(d.sources.transcript.url,"查看原始记录")}</p></article><article class="demo-panel"><div class="demo-tabs"><button data-note-mode="standard" aria-pressed="true">标准纪要</button><button data-note-mode="exam" aria-pressed="false">考试复习</button></div><div class="mini-kit" data-note-output aria-live="polite"></div><button class="button secondary small" data-copy-notes style="margin-top:18px">复制当前整理 ⧉</button></article></div>`);
    function show(mode) {selected=mode;root.querySelector("[data-note-output]").innerHTML=d[mode].sections.map(s=>`<section><h4>${esc(s.title)}</h4>${list(s.items)}<a class="source-button" href="${esc(s.sourceUrl)}" target="_blank" rel="noopener">原文 L${s.sourceLines[0]}–${s.sourceLines.at(-1)} ↗</a></section>`).join("");}
    root.querySelectorAll("[data-note-mode]").forEach(b=>b.addEventListener("click",()=>{pressed("[data-note-mode]",b);show(b.dataset.noteMode);}));
    root.querySelector("[data-copy-notes]").addEventListener("click",()=>window.portfolioCopy("# "+d[selected].label+"\n\n"+d[selected].sections.map(s=>"## "+s.title+"\n"+s.items.map(x=>"- "+x).join("\n")).join("\n\n")+"\n\n来源："+d.sources.transcript.url));
    show("standard");
  }
  function atlas() {
    root.innerHTML=`<div class="demo-top"><strong>模型全景 / 可操作网页</strong><span>项目原始静态构建</span></div><div class="atlas-toolbar"><p>资料快照 2026-11-06 · 可搜索、筛选与比较</p><a class="button secondary small" href="${base}demos/model-atlas/" target="_blank" rel="noopener">在新窗口打开 ↗</a></div><iframe class="embed-demo" title="模型全景可操作演示，静态资料快照" src="${base}demos/model-atlas/" loading="lazy"></iframe>`;
  }
  function avatars() {
    const avatars=[["jelly","果冻胖胖","轻轻漂浮"],["bounce","弹弹胖胖","弹跳节奏"],["sleepy","困困胖胖","慢慢摇晃"],["snack","吃货胖胖","轻轻漂浮"],["royal","国王胖胖","轻轻漂浮"],["space","太空胖胖","轻轻漂浮"]];
    shell("Grok fat / 选择你的桌面伙伴","真实头像素材 · 动态风格预览",`<div class="avatar-stage"><div class="avatar-shadow"></div><img data-avatar src="${asset("avatars/fat-jelly.webp")}" alt="果冻胖胖"></div><div class="avatar-grid">${avatars.map((a,i)=>`<button class="avatar-choice" data-avatar-choice="${i}" aria-pressed="${i===0}"><img src="${asset("avatars/fat-"+a[0]+".webp")}" alt="" width="64" height="64">${a[1]}</button>`).join("")}</div><p class="demo-caption" data-avatar-caption role="status">果冻胖胖 · 轻轻漂浮</p><details style="margin-top:16px"><summary class="text-link">查看桌面界面</summary><div class="screen-view"><img src="${asset("screens/grok-app.jpg")}" alt="Grok fat 桌面版界面，隔离测试截图" loading="lazy"></div></details>`);
    root.querySelectorAll("[data-avatar-choice]").forEach(b=>b.addEventListener("click",()=>{
      pressed("[data-avatar-choice]",b);const a=avatars[Number(b.dataset.avatarChoice)];
      root.querySelector("[data-avatar]").src=asset("avatars/fat-"+a[0]+".webp");root.querySelector("[data-avatar]").alt=a[1];
      root.querySelector(".avatar-stage").className="avatar-stage "+a[0];
      root.querySelector("[data-avatar-caption]").textContent=a[1]+" · "+a[2];
    }));
  }
  function boxing() {
    shell("拳击分析 / 真实标注样例","仓库已发布的视频素材",`<div class="boxing-media"><video controls playsinline preload="none" poster="${asset("boxing-poster.jpg")}" aria-label="训练视频的骨架与重心标注"><source src="${asset("boxing-demo.mp4")}" type="video/mp4">当前浏览器不支持视频播放，请查看完整慢放视频。</video></div><div class="media-controls"><button class="button primary small" data-boxing-play aria-pressed="false">播放标注片段 ▶</button>${link("https://github.com/z2302743489/boxing-pose-analysis/releases/download/v0.1/shadowboxing_slowmo_CoM.mp4","查看完整慢放视频")}</div><p class="demo-caption" style="text-align:center">片段保留原样例中的骨架与重心标注。</p><details style="margin-top:20px"><summary class="text-link">查看分析图表</summary><div class="screen-view"><img src="${asset("screens/boxing-analysis.png")}" alt="样例训练的重心与逐拳分析图表" loading="lazy"></div></details>`);
    const video=root.querySelector("video"),button=root.querySelector("[data-boxing-play]");
    function sync(){button.textContent=video.paused?"播放标注片段 ▶":"暂停播放 Ⅱ";button.setAttribute("aria-pressed",String(!video.paused));}
    ["play","pause","ended"].forEach(event=>video.addEventListener(event,sync));
    button.addEventListener("click",async()=>{if(video.paused){try{await video.play();}catch{window.portfolioToast("片段暂时无法播放，请查看完整视频。");}}else{video.pause();}});
  }
  function game() {
    const steps=[["描述创意","输入玩法、风格和约束，添加参考文件。"],["制定计划","先拆任务和范围，再交给不同角色执行。"],["制作与检查","生成代码和素材，进行构建、审查与有限轮修复。"],["试玩与反馈","打开预览，检查能否玩，再记录需要调整的地方。"]];
    shell("cash.ai / 从创意到试玩","桌面界面与流程导览",`<div class="process-steps">${steps.map((s,i)=>`<button data-game-stage="${i}" class="${i===0?"active":""}" aria-pressed="${i===0}">0${i+1} ${s[0]}</button>`).join("")}</div><div class="demo-panel"><h3 data-game-stage-title>描述创意</h3><p data-game-stage-description>输入玩法、风格和约束，添加参考文件。</p></div><p class="demo-gallery-caption">项目界面截图</p>${gallery("cash",[["深色界面","cash-dark.png"],["浅色界面","cash-light.png"]])}<details style="margin-top:24px"><summary class="text-link">试一段简单玩法</summary><p class="demo-caption" style="margin:12px 0">本站制作的接星星玩法示意，用于感受“能试玩”的结果；不是 cash.ai 实时生成的作品。左右移动接住 5 颗星，漏掉 3 颗则结束。</p><canvas class="mini-game" width="700" height="280" tabindex="0" aria-label="接星星玩法示意，点击开始后使用左右方向键或下方按钮移动"></canvas><div class="media-controls"><button class="button small primary" data-start-game>开始试玩示意</button><span data-game-status role="status">等待开始</span></div><div class="game-controls"><button data-move="-1" aria-label="向左移动">←</button><button data-move="1" aria-label="向右移动">→</button></div></details>`);
    root.querySelectorAll("[data-game-stage]").forEach(b=>b.addEventListener("click",()=>{
      root.querySelectorAll("[data-game-stage]").forEach(x=>{x.classList.toggle("active",x===b);x.setAttribute("aria-pressed",String(x===b));});
      const s=steps[Number(b.dataset.gameStage)];root.querySelector("[data-game-stage-title]").textContent=s[0];root.querySelector("[data-game-stage-description]").textContent=s[1];
    }));
    wireGallery("cash",[["深色界面","cash-dark.png"],["浅色界面","cash-light.png"]]);
    const canvas=root.querySelector("canvas"),ctx=canvas.getContext("2d"),status=root.querySelector("[data-game-status]");
    let x=350,y=-20,starX=350,dir=0,score=0,miss=0,running=false,last=0,raf=0;
    function paint() {
      ctx.clearRect(0,0,700,280);ctx.fillStyle="#e6eef5";ctx.fillRect(0,0,700,280);
      ctx.strokeStyle="#d0dee9";for(let i=0;i<700;i+=40){ctx.beginPath();ctx.moveTo(i,0);ctx.lineTo(i,280);ctx.stroke();}
      ctx.fillStyle="#256f65";ctx.beginPath();ctx.roundRect(x-45,230,90,18,7);ctx.fill();
      ctx.fillStyle="#d09528";ctx.font="31px system-ui";ctx.textAlign="center";ctx.fillText("✦",starX,Math.max(30,y));
      ctx.fillStyle="#182532";ctx.font="14px system-ui";ctx.textAlign="left";ctx.fillText("星星 "+score+" / 5     漏接 "+miss+" / 3",20,25);
    }
    function frame(t) {
      if(!running)return;
      const dt=Math.min((t-last)/1000,.04);last=t;x=Math.max(46,Math.min(654,x+dir*360*dt));y+=105*dt;
      if(y>222){if(Math.abs(starX-x)<55){score++;}else{miss++;}y=-20;starX=60+Math.random()*580;status.textContent="接住 "+score+" 颗 · 漏接 "+miss+" 颗";}
      if(score>=5||miss>=3){running=false;dir=0;status.textContent=score>=5?"完成！接住了 5 颗星。":"试玩结束，可以再来一次。";root.querySelector("[data-start-game]").textContent="重新试玩";paint();return;}
      paint();raf=requestAnimationFrame(frame);
    }
    root.querySelector("[data-start-game]").addEventListener("click",()=>{cancelAnimationFrame(raf);x=350;y=-20;starX=350;score=0;miss=0;dir=0;running=true;last=performance.now();status.textContent="左右移动接星星";root.querySelector("[data-start-game]").textContent="重新试玩";canvas.focus();raf=requestAnimationFrame(frame);});
    canvas.addEventListener("keydown",ev=>{if(["ArrowLeft","ArrowRight"].includes(ev.key)){ev.preventDefault();dir=ev.key==="ArrowLeft"?-1:1;}});
    canvas.addEventListener("keyup",ev=>{if(["ArrowLeft","ArrowRight"].includes(ev.key)){ev.preventDefault();dir=0;}});
    canvas.addEventListener("blur",()=>{dir=0;});
    root.querySelectorAll("[data-move]").forEach(b=>{b.addEventListener("pointerdown",ev=>{ev.preventDefault();b.setPointerCapture(ev.pointerId);dir=Number(b.dataset.move);});b.addEventListener("pointerup",()=>{dir=0;});b.addEventListener("pointercancel",()=>{dir=0;});});
    document.addEventListener("visibilitychange",()=>{if(document.hidden&&running){running=false;cancelAnimationFrame(raf);status.textContent="已暂停，请重新开始。";}});
    paint();
  }
  async function toonflow() {
    const response=await fetch(base+"content/toonflow/demo.json");
    if(!response.ok)throw Error("试跑示例暂时无法载入");
    const d=await response.json();
    shell("Toonflow Skills / 创作示例","仓库文字试跑与安装导览",`<div class="demo-tabs toonflow-tabs" role="group" aria-label="选择演示内容"><button data-toonflow-tab="scenes" aria-pressed="true">剧本试跑</button><button data-toonflow-tab="assets" aria-pressed="false">角色与场景</button><button data-toonflow-tab="install" aria-pressed="false">安装与调用</button></div>
<section data-toonflow-panel="scenes"><h3>《${esc(d.title)}》</h3><p class="demo-caption">${esc(d.duration)} · 虚构短片 · 仓库已公开的文字试跑</p><div class="process-steps toonflow-options" role="group" aria-label="选择剧本场次">${d.scenes.map((s,i)=>`<button data-toonflow-scene="${i}" aria-pressed="${i===0}" class="${i===0?"active":""}">场次 ${i+1}</button>`).join("")}</div><h4 data-toonflow-scene-title aria-live="polite"></h4><div class="toonflow-transcript" data-toonflow-scene-output tabindex="0" role="region" aria-label="剧本场次正文"></div><div class="case-actions"><button class="button small secondary" data-toonflow-copy-scene>复制当前场次</button><a class="button small secondary" href="${base}content/toonflow/text-production.md" download="Toonflow-末班车文字试跑.md">下载完整试跑</a></div></section>
<section data-toonflow-panel="assets" hidden><h3>同一份剧本的文字设计</h3><p class="demo-caption">依据仓库试跑中的角色、空间与连续性要求整理。</p><div class="process-steps toonflow-options" role="group" aria-label="选择设计对象">${d.assets.map((a,i)=>`<button data-toonflow-asset="${i}" aria-pressed="${i===0}" class="${i===0?"active":""}">${esc(a.title)}</button>`).join("")}</div><article class="demo-panel" data-toonflow-asset-output aria-live="polite"></article></section>
<section data-toonflow-panel="install" hidden><label class="form-label" for="toonflow-preset">选择安装分组</label><select class="demo-input" id="toonflow-preset">${d.presets.map(p=>`<option value="${esc(p.id)}">${esc(p.label)} · ${p.count} 个 Skill</option>`).join("")}</select><article class="demo-panel toonflow-install-summary"><h3 data-toonflow-preset-title aria-live="polite"></h3><p data-toonflow-preset-detail></p><p class="demo-caption">需要 Python 3.9+ 和支持本地 Skill 的 AI Agent。</p><pre class="toonflow-command" tabindex="0"><code data-toonflow-command></code></pre><button class="button small secondary" data-toonflow-copy-install>复制安装命令</button><h4 class="toonflow-invocation-title">在 Agent 中调用</h4><pre class="toonflow-command" tabindex="0"><code data-toonflow-invocation></code></pre><button class="button small secondary" data-toonflow-copy-invocation>复制调用示例</button><details class="toonflow-module-list"><summary>查看本组包含的 Skill</summary><ul data-toonflow-modules></ul></details></article><p class="demo-caption">图片、视频、音频生成与画布操作需另行连接对应工具及模型服务。${link("https://github.com/z2302743489/toonflow-skills/blob/"+d.sourceCommit+"/docs/dependencies.md","查看逐项依赖")}</p></section>
<p class="demo-caption toonflow-source">${link(d.source,"查看仓库试跑原文")} · ${link("https://github.com/z2302743489/toonflow-skills","项目仓库")}<br>第三方 Toonflow 技能整理 · MIT · 原作者 HBAI-Ltd</p>`);
    let sceneIndex=0;
    let selectedPreset=d.presets[0];
    function showScene(index) {
      sceneIndex=index;
      root.querySelector("[data-toonflow-scene-title]").textContent=d.scenes[index].title;
      root.querySelector("[data-toonflow-scene-output]").textContent=d.scenes[index].text;
      root.querySelector("[data-toonflow-scene-output]").scrollTop=0;
      root.querySelectorAll("[data-toonflow-scene]").forEach(b=>{const active=Number(b.dataset.toonflowScene)===index;b.classList.toggle("active",active);b.setAttribute("aria-pressed",String(active));});
    }
    function showAsset(index) {
      const a=d.assets[index];
      root.querySelector("[data-toonflow-asset-output]").innerHTML=`<p class="demo-caption">${esc(a.type)}</p><h3>${esc(a.title)}</h3><p>${esc(a.description)}</p>${list(a.details)}`;
      root.querySelectorAll("[data-toonflow-asset]").forEach(b=>{const active=Number(b.dataset.toonflowAsset)===index;b.classList.toggle("active",active);b.setAttribute("aria-pressed",String(active));});
    }
    function installCommand(preset) {
      return "git clone https://github.com/z2302743489/toonflow-skills.git\ncd toonflow-skills\npython3 scripts/install.py --preset "+preset.id;
    }
    function showPreset(id) {
      selectedPreset=d.presets.find(p=>p.id===id);
      root.querySelector("[data-toonflow-preset-title]").textContent=selectedPreset.label+" · "+selectedPreset.count+" 个 Skill";
      root.querySelector("[data-toonflow-preset-detail]").textContent=selectedPreset.detail;
      root.querySelector("[data-toonflow-command]").textContent=installCommand(selectedPreset);
      root.querySelector("[data-toonflow-invocation]").textContent=selectedPreset.invocation;
      root.querySelector("[data-toonflow-modules]").innerHTML=selectedPreset.skills.map(name=>`<li><code>${esc(name)}</code></li>`).join("");
    }
    root.querySelectorAll("[data-toonflow-tab]").forEach(b=>b.addEventListener("click",()=>{
      pressed("[data-toonflow-tab]",b);
      root.querySelectorAll("[data-toonflow-panel]").forEach(panel=>{panel.hidden=panel.dataset.toonflowPanel!==b.dataset.toonflowTab;});
    }));
    root.querySelectorAll("[data-toonflow-scene]").forEach(b=>b.addEventListener("click",()=>showScene(Number(b.dataset.toonflowScene))));
    root.querySelectorAll("[data-toonflow-asset]").forEach(b=>b.addEventListener("click",()=>showAsset(Number(b.dataset.toonflowAsset))));
    root.querySelector("#toonflow-preset").addEventListener("change",ev=>showPreset(ev.target.value));
    root.querySelector("[data-toonflow-copy-scene]").addEventListener("click",()=>window.portfolioCopy(d.scenes[sceneIndex].title+"\n\n"+d.scenes[sceneIndex].text+"\n\n来源："+d.source));
    root.querySelector("[data-toonflow-copy-install]").addEventListener("click",()=>window.portfolioCopy(installCommand(selectedPreset)));
    root.querySelector("[data-toonflow-copy-invocation]").addEventListener("click",()=>window.portfolioCopy(selectedPreset.invocation));
    showScene(0);showAsset(0);showPreset(d.presets[0].id);
  }
  function portfolio() {
    shell("这个网站 / 响应式体验","调整宽度，观察内容重排",`<label class="form-label" for="preview-width">预览宽度 <output data-width-output>620 px</output></label><input id="preview-width" type="range" min="260" max="700" value="620" style="width:100%;accent-color:var(--brand)"><div class="mini-portfolio" style="width:620px;max-width:100%;margin:20px auto 0"><p class="eyebrow">张健航 / 个人网站</p><h3>张健航</h3><p style="font-size:12px;color:var(--muted)">拖动上方滑块，看看项目列表如何换行。</p><div class="mini-card-list"><a class="mini-card" href="../zhixu/"><strong>知序 · 企业知识库 ↗</strong><p>文档管理与带引用的问答</p></a><a class="mini-card" href="../model-atlas/"><strong>模型全景 ↗</strong><p>查找与对比大模型资料</p></a></div></div><div class="media-controls"><button class="button small secondary" data-preview-theme>切换全站深浅主题 ◐</button><a class="button small secondary" href="${base}#projects">浏览全部项目 →</a></div>`);
    root.querySelector("input").addEventListener("input",ev=>{const w=Number(ev.target.value);root.querySelector("[data-width-output]").textContent=w+" px";root.querySelector(".mini-portfolio").style.width=w+"px";root.querySelector(".mini-card-list").style.gridTemplateColumns=w<440?"1fr":"repeat(2,1fr)";});
    root.querySelector("[data-preview-theme]").addEventListener("click",()=>document.querySelector("[data-theme-toggle]").click());
  }
  async function init() {
    if(type==="atlas")return atlas();
    if(type==="avatars")return avatars();
    if(type==="boxing")return boxing();
    if(type==="game")return game();
    if(type==="toonflow")return toonflow();
    if(type==="portfolio")return portfolio();
    const response=await fetch(base+"content/fixtures.json");
    if(!response.ok)throw Error("示例资料暂时无法载入");
    const fixtures=await response.json();
    ({knowledge,launch,notes})[type](fixtures);
  }
  init().catch(()=>{root.innerHTML='<p class="empty-demo">演示暂时无法载入，请刷新页面，或通过上方源码链接查看项目。</p>';});
})();
