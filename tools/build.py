#!/usr/bin/env python3
"""Generate the portfolio with the measured Sean Halpin page structure."""
import html
import json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
SITE=json.loads((ROOT/"site.json").read_text())
PROJECTS=json.loads((ROOT/"content/projects.json").read_text())["projects"]
BY={p["slug"]:p for p in PROJECTS}
VERSION="20261116-image-fit-2"
ORDER=["zhixu","model-atlas","cash","grok-fat","boxing","notes","launch-kit","portfolio"]
CARD={
 "zhixu":("知序","AI 问答","#d094e5",1,10),
 "model-atlas":("AI MODEL ATLAS","模型全景","#a3dcd4",11,26),
 "cash":("CASH.AI","游戏创作","#e8b89c",1,16),
 "grok-fat":("GROK FAT","桌面助手","#bddff9",17,26),
 "boxing":("BOXING POSE","拳击分析","#ffffff",1,16),
 "notes":("CLASS NOTES","课堂纪要","#1c1c1c",17,26),
 "launch-kit":("IDEA TO LAUNCH","技术手册","#e8b89c",1,10),
 "portfolio":("JIANHANG","个人网站","#c9d0f3",11,26)
}
def e(v):return html.escape(str(v),quote=True)
def name(p):return p.get("displayName",p["name"].replace(" · "," "))
def ext(url,label,cls="text-link"):return f'<a href="{e(url)}" class="{cls}" target="_blank" rel="noopener noreferrer">{label}<span aria-hidden="true">↗</span></a>'
def header(base,active):
    def nav(label,url,key):
        a=' class="active" aria-current="page"' if active==key else ""
        slash='<span class="slash" aria-hidden="true">/</span>' if key=="work" else ""
        return f'<li><a href="{base}{url}"{a}>{label}{slash}</a></li>'
    return f'''<a class="skip" href="#main">跳到正文</a><header class="site-header"><nav aria-label="主导航"><ul class="nav-list">{nav("Work","","work")}{nav("About","about/","about")}{nav("Play","play/","play")}{nav("Notes","projects/notes/","notes")}<li><button data-contact>Contact</button></li></ul></nav></header>'''
def footer(base):
    ticks="".join(f'<button class="hour{" active" if i==13 else ""}" data-hour="{i}" aria-label="{i:02d}:00 配色" aria-pressed="{str(i==13).lower()}"><span class="hour-bubble" aria-hidden="true">☀</span><span class="hour-line"></span></button>' for i in range(24))
    return f'''<footer class="site-footer"><div class="footer-grid"><div class="legal">© 2026 张健航 <span>•</span> <a href="{base}references.html">Colophon</a></div><ul><li class="footer-label">Elsewhere</li><li>{ext(SITE["github"],"GitHub","")}</li><li><a href="{base}work/">全部项目</a></li><li><a href="{base}projects/launch-kit/">技术手册</a></li><li><button data-theme-toggle aria-label="切换为深色主题">Theme</button></li></ul><ul><li class="footer-label">Contact</li><li><button data-contact>Message</button></li></ul></div></footer><div class="circadian" aria-label="背景时段配色"><div class="hours">{ticks}</div></div>'''
def overlays(base):
    items=[{"name":name(p),"detail":p["description"],"href":base+"projects/"+p["slug"]+"/"} for p in PROJECTS]
    data=json.dumps(items,ensure_ascii=False).replace("<","\\u003c")
    return f'''<aside class="contact-panel" role="dialog" aria-label="张健航的项目与联系入口" aria-modal="false" hidden><div class="contact-head"><img src="{base}assets/avatar.webp" alt="" width="38" height="38"><div><strong>张健航</strong><span>AI 产品经理</span></div><button class="close-contact" data-contact-close aria-label="关闭联系窗口">×</button></div><div class="contact-inner"><p class="chat-bubble">你好，我是张健航。</p><p class="chat-bubble">这里可以查看我的项目和个人介绍，也可以去 GitHub 找到我。</p><div class="quick-links"><a href="{base}work/">查看全部项目</a><a href="{base}play/">看看演示</a><a href="{base}about/">了解我的背景</a>{ext(SITE["github"],"去 GitHub","")}</div></div></aside>
<div class="search-backdrop" data-search-backdrop hidden><section class="search-dialog" role="dialog" aria-modal="true" aria-label="搜索项目"><label class="sr-only" for="project-search">搜索项目</label><input id="project-search" placeholder="Search projects…" autocomplete="off"><button class="search-close" data-search-close aria-label="关闭搜索">Esc</button><div class="search-results"></div></section></div><script type="application/json" id="search-data">{data}</script><div class="toast" role="status" aria-live="polite"></div>'''
def page(title,desc,content,base="./",canonical="",demo=None,active="work"):
    demoattrs=f' data-demo="{demo}"' if demo else ""
    dcss=f'<link rel="stylesheet" href="{base}demos.css?v={VERSION}">' if demo else ""
    djs=f'<script defer src="{base}demos.js?v={VERSION}"></script>' if demo else ""
    return f'''<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>{e(title)}</title><meta name="description" content="{e(desc)}"><meta name="theme-color" content="#ede7de"><meta property="og:title" content="{e(title)}"><meta property="og:description" content="{e(desc)}"><meta property="og:type" content="website"><meta property="og:image" content="{SITE["url"]}assets/screens/zhixu-chat.png"><link rel="canonical" href="{SITE["url"]}{canonical}"><link rel="icon" href="{base}favicon.svg" type="image/svg+xml"><link rel="stylesheet" href="{base}assets/fonts/fonts.css"><link rel="preload" href="{base}assets/fonts/bricolage-grotesque-latin-variable.woff2" as="font" type="font/woff2" crossorigin><script>try{{if(localStorage.getItem('jh-theme')==='dark')document.documentElement.dataset.theme='dark'}}catch(e){{}}</script>{dcss}<link rel="stylesheet" href="{base}style.css?v={VERSION}"><script defer src="{base}app.js?v={VERSION}"></script>{djs}</head><body data-base="{base}"{demoattrs}><div class="aura" aria-hidden="true"><canvas width="32" height="32"></canvas><div class="aura-mask"></div></div>{header(base,active)}{content}{footer(base)}{overlays(base)}</body></html>'''
def screen(p):return {"zhixu":"zhixu-chat.png","model-atlas":"model-atlas-live.jpg","cash":"cash-dark.png","grok-fat":"grok-app.jpg","boxing":"boxing-analysis.png"}.get(p["slug"])
SCREEN_SIZES={"zhixu":(1106,664),"model-atlas":(1280,720),"cash":(1800,1016),"grok-fat":(1280,720)}
def visual(p, base="./", lazy=True):
    slug=p["slug"]
    loading='loading="lazy"' if lazy else 'fetchpriority="high"'
    if slug=="launch-kit":
        return '''<div class="media-visual document-visual" role="img" aria-label="想法到上线技术手册的六个阶段"><div class="document-sheet"><span>想法到上线</span><h3>一份可以照着走的<br>开发手册。</h3><div class="document-stages"><span>PRD 体检</span><span>技术适配</span><span>后端 MVP</span><span>正式前端</span><span>上线</span><span>收尾</span></div><p>手册 / PRD 模板 / 阶段验收清单</p></div></div>'''
    if slug=="notes":
        return '''<div class="media-visual notes-visual" role="img" aria-label="课堂纪要整理示例，操作系统课程"><div class="notes-sheet"><small>操作系统 · 第 5 周</small><h3>进程与线程</h3><div class="note-line"><span>知识点</span><p>进程是资源分配的基本单位。<br>线程是 CPU 调度的基本单位。</p></div><div class="note-line"><span>作业</span><p>fork 后，子进程修改变量，<br>父进程是否看得到？</p></div><span class="note-tag">同一份记录，两种整理方式</span></div></div>'''
    if slug=="portfolio":
        return f'''<div class="media-visual portfolio-visual" role="img" aria-label="张健航个人网站的姓名与训练画面"><img src="{base}assets/training-poster.png" alt="" {loading}><span>张健航</span><small>AI 产品经理 / 个人作品</small></div>'''
    if slug=="boxing":
        return f'''<div class="media-visual analysis-visual"><img class="analysis-person" src="{base}assets/boxing-poster.jpg" alt="训练中的骨架与重心标注" {loading}><img class="analysis-chart" src="{base}assets/screens/boxing-analysis.png" alt="训练重心与逐拳分析图表" {loading}></div>'''
    width,height=SCREEN_SIZES[slug]
    return f'<div class="media-visual screen-visual media-{slug}"><img src="{base}assets/screens/{screen(p)}" alt="{e(name(p))}实际项目界面" {loading} width="{width}" height="{height}"></div>'

def card(p,base="./"):
    brand,title,color,start,end=CARD[p["slug"]]
    dark=' card-dark' if p["slug"]=="notes" else ""
    return f'''<a class="project-card{dark}" data-project href="{base}projects/{p["slug"]}/" aria-label="了解{name(p)}" style="--card-bg:{color};--col-start:{start};--col-end:{end}"><div class="card-wrap"><div class="card-info"><span>{e(brand)}</span><h2>{e(title)}</h2></div><div class="card-inner"><div class="card-picture">{visual(p,base)}</div></div></div></a>'''
def home(base="./",canonical=""):
    first="".join(card(BY[s],base) for s in ORDER[:4])
    more="".join(card(BY[s],base) for s in ORDER[4:])
    content=f'''<main id="main"><h1 class="home-title"><span class="title-holder">Hi. I'm Jianhang.<br><span class="role-line">AI Product Manager.</span><svg class="sparkle left" viewBox="0 0 100 100" aria-hidden="true"><path d="M50 0C58 0 58 32 67 36S100 42 100 50S76 58 67 64S58 100 50 100S42 76 36 67S0 58 0 50S24 42 36 36S42 0 50 0Z"/></svg><svg class="sparkle right" viewBox="0 0 100 100" aria-hidden="true"><path d="M50 0C58 0 58 32 67 36S100 42 100 50S76 58 67 64S58 100 50 100S42 76 36 67S0 58 0 50S24 42 36 36S42 0 50 0Z"/></svg></span></h1><div class="text-wrapper"><p class="hero-description">张健航，25 岁，计算机应用技术专业毕业。<br>这里是我的 AI 项目、开源改版和一些小工具。</p></div><section class="cards main-cards" id="projects" aria-label="主要项目"><div class="cards-content">{first}</div></section><section class="more-work"><h2>More Projects.</h2><div class="text-wrapper"><p>训练视频分析、课堂笔记、开发手册，还有这个网站。<br>每个项目都保留了介绍、来源和可以体验的演示。</p></div><div class="cards more-cards"><div class="cards-content">{more}</div></div></section></main>'''
    return page("张健航 • AI 产品经理","张健航，25岁，计算机应用技术专业毕业，AI产品经理。查看八个项目的介绍和演示。",content,base,canonical)
def about():
    timeline="".join(f'<a class="project-history" href="../projects/{s}/"><strong>{e(name(BY[s]))}</strong><span>{e(BY[s]["kind"])}</span><span aria-hidden="true">↗</span></a>' for s in ("zhixu","model-atlas","boxing","notes"))
    topics="".join(f'<article><span class="topic-number">{i+1:02}</span><h3>{e(name(BY[s]))}</h3><p>{e(BY[s]["summary"])}</p></article>' for i,s in enumerate(("zhixu","model-atlas","boxing","notes")))
    content=f'''<main id="main"><h1 class="page-title">I'm Jianhang.</h1><section class="about-intro"><figure class="about-portrait"><img src="../assets/training-poster.png" alt="张健航日常拳击训练的视频截图" width="320" height="568"></figure><div><h2 class="display-heading">我是张健航，<br>一名 AI 产品经理。</h2><p>25 岁，计算机应用技术专业毕业。这里放了我的个人项目，也有基于现有项目做的改版。</p><p>知识库、模型资料站、游戏创作工具，还有用来复盘拳击动作的小原型，都可以在作品页里找到。</p></div></section><div class="project-history-list">{timeline}</div><section class="about-topics"><h2 class="display-heading">我在做的几件事。</h2><p>每个项目页里都写了具体用途、实现和原作来源，也保留了对应的演示。</p><div class="topic-grid">{topics}</div></section><section class="about-ending text-wrapper"><p>平时我也练拳击。我拍了自己的训练视频，试着提取骨架和重心，再把结果叠回视频，方便逐拳回看。现在还是个二维分析的小原型。</p><div class="about-pictures"><img src="../assets/training-poster.png" alt="日常训练" loading="lazy"><img src="../assets/screens/boxing-analysis.png" alt="训练分析图表" loading="lazy"></div></section></main>'''
    return page("About • 张健航","张健航，25岁，计算机应用技术专业毕业，AI产品经理。",content,"../","about/",active="about")
def play():
    content=f'''<main id="main"><h1 class="page-title">A little Play.</h1><div class="text-wrapper"><p class="hero-description">试试头像、看看训练标注，或者玩一段简单的接星星示意。</p></div><div class="play-grid"><a href="../projects/grok-fat/#demo">{visual(BY["grok-fat"],"../")}<h2>Fat 头像</h2><p>六款头像与动态预览。</p></a><a href="../projects/boxing/#demo">{visual(BY["boxing"],"../")}<h2>拳击动作分析</h2><p>播放骨架与重心标注片段。</p></a><a href="../projects/cash/#demo">{visual(BY["cash"],"../")}<h2>游戏创作与试玩</h2><p>查看流程，再试一段本站实现的接星星玩法。</p></a></div></main>'''
    return page("Play • 张健航","现有项目里的头像、视频与玩法示意。",content,"../","play/",active="play")
def case(p,index):
    nxt=BY[ORDER[(index+1)%len(ORDER)]]
    features="".join(f'<article class="feature-row"><h3>{e(x["title"])}</h3><p>{e(x["detail"])}</p></article>' for x in p["features"])
    decisions="".join(f'<article class="decision"><h3>{e(x["title"])}</h3><p>{e(x["detail"])}</p></article>' for x in p["decisions"])
    sources="".join(f'<li>{ext(x["url"],e(x["label"]))}<p>{e(x["detail"])}</p></li>' for x in p["evidence"])
    bg=CARD[p["slug"]][2]
    content=f'''<main id="main"><header class="case-head"><h1 class="page-title">{e(name(p))}.</h1><div class="case-meta"><div><span>Type</span><p>{e(p["kind"])}</p></div><div><span>Project</span><p>{e(p["category"])}</p></div><div><span>Links</span><p><a href="#demo">查看演示 ↓</a><br>{ext(p["links"]["repo"],"项目源码")}</p></div></div></header><div class="hero-media" style="--media-bg:{bg}">{visual(p,"../../",False)}</div><div class="case-content">
<section class="case-section" id="problem"><h2>Overview</h2><p class="project-description">{e(p["description"])}</p><p>{e(p["summary"])}</p><dl class="problem-details"><div><dt>给谁用</dt><dd>{e(p["audience"])}</dd></div><div><dt>遇到的问题</dt><dd>{e(p["pain"])}</dd></div></dl></section>
<section class="case-section" id="demo"><h2>Demo</h2><p>{e(p["demoIntro"])}</p><div id="project-demo" class="demo-shell" aria-label="{e(name(p))}交互演示"><div class="empty-demo">正在载入演示…</div></div><noscript><p>交互演示需要 JavaScript，也可以通过源码链接查看项目。</p></noscript><p class="demo-disclosure">{e(p["demoLimit"])}</p></section>
<section class="case-section" id="features"><h2>Features</h2><div class="feature-list">{features}</div></section>
<section class="case-section" id="decisions"><h2>Decisions</h2><div class="decision-grid">{decisions}</div></section>
<section class="case-section" id="evidence"><h2>Current Status</h2><p>{e(p["status"])}</p><div class="stack"><span>Tools</span><p>{e(" / ".join(p["stack"]))}</p></div><details class="project-sources"><summary>查看资料与原作来源 <span>+</span></summary><ul class="evidence-list">{sources}</ul><p class="attribution">{e(p["attribution"])}</p></details></section>
<a class="next-project" href="../{nxt["slug"]}/"><span>Next project</span><strong>{e(name(nxt))}.</strong><span aria-hidden="true">↗</span></a></div></main>'''
    return page(f'{name(p)} • 张健航',p["description"],content,"../../",f'projects/{p["slug"]}/',demo=p["demoType"],active="notes" if p["slug"]=="notes" else "work")
def references():
    content='''<main id="main"><h1 class="page-title">Colophon.</h1><div class="reading-page"><h2>页面参考</h2><p>本版按 <a href="https://www.seanhalpin.xyz/" target="_blank" rel="noopener">Seán Halpin 的公开网站</a>核对布局、色板、导航、卡片比例与响应式规则，用张健航的信息和项目内容重新实现。</p><h2>字体</h2><p>原站标题为 Acorn Semibold，正文为 GT Planar Regular，均为商业字款。本网站使用可公开部署的 Bricolage Grotesque 与 DM Sans 近似替代，保留 OFL 许可。中文采用系统字体。</p><p><a href="content/font-sources.md">字体来源与许可</a></p><h2>项目与素材</h2><p>八个项目的介绍、源码、原作归属与演示保留。项目界面、训练片段和头像来自本人提供或公开仓库中的原有素材。首页图像已替换为自己的项目内容。</p><p>模型全景资料快照为 2026-11-06。其余演示各自保留固定示例、界面预览或视频范围说明。</p><p><a href="content/SOURCES.md">项目资料与许可</a> · <a href="assets/manifest.json">媒体来源</a> · <a href="https://github.com/z2302743489/z2302743489.github.io" target="_blank" rel="noopener">网站源码</a></p></div></main>'''
    return page("Colophon • 张健航","网站参考、字体、项目资料与媒体来源。",content,canonical="references.html")
(ROOT/"index.html").write_text(home())
for folder in ("work","about","play"):(ROOT/folder).mkdir(exist_ok=True)
(ROOT/"work/index.html").write_text(home("../","work/"))
(ROOT/"about/index.html").write_text(about())
(ROOT/"play/index.html").write_text(play())
for i,s in enumerate(ORDER):
    folder=ROOT/"projects"/s;folder.mkdir(parents=True,exist_ok=True)
    (folder/"index.html").write_text(case(BY[s],i))
(ROOT/"references.html").write_text(references())
(ROOT/"404.html").write_text(page("页面没找到 • 张健航","返回个人网站。",'<main id="main"><h1 class="page-title">Not found.</h1><div class="text-wrapper"><p class="hero-description"><a href="/">返回首页</a></p></div></main>',"/","404.html"))
(ROOT/".nojekyll").touch()
print("Built Sean-layout homepage, Work, About, Play, 8 project pages, Colophon and 404.")
