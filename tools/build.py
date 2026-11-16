#!/usr/bin/env python3
"""Build the static portfolio. No third-party dependencies."""
import html
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SITE = json.loads((ROOT / "site.json").read_text())
PROJECTS = json.loads((ROOT / "content/projects.json").read_text())["projects"]
BY_SLUG = {p["slug"]: p for p in PROJECTS}
VERSION = "20261116-dennis-1"

def e(value):
    return html.escape(str(value), quote=True)

def name(p):
    return p.get("displayName", p["name"].replace(" · ", " "))

def ext(url, label, cls="text-link"):
    return f'<a class="{cls}" href="{e(url)}" target="_blank" rel="noopener noreferrer">{label}<span aria-hidden="true">↗</span></a>'

def header(base):
    return f'''<a class="skip" href="#main">跳到正文</a>
<header class="site-header"><div class="header-inner">
<a class="wordmark" href="{base}" aria-label="张健航 首页"><span class="brand-dot" aria-hidden="true"></span>张健航</a>
<nav id="navigation" class="nav-links" aria-label="主导航"><a href="{base}work/">作品</a><a href="{base}about/">关于</a><a href="{base}#contact">联系</a>{ext(SITE["github"], "GitHub", "nav-github")}</nav>
<div class="header-controls"><button class="theme-control" data-theme-toggle aria-label="切换为深色主题" title="切换主题">◐</button><button class="menu-button" data-menu aria-expanded="false" aria-controls="navigation" aria-label="展开导航"><span></span><span></span></button></div>
</div></header>'''

def footer(base):
    return f'''<footer class="contact-footer" id="contact"><div class="footer-curve" aria-hidden="true"></div><div class="container">
<div class="contact-title"><img src="{base}assets/avatar.webp" width="68" height="68" alt="张健航的 GitHub 头像"><h2>在 GitHub<br>找到我。</h2><span class="contact-arrow" aria-hidden="true">↘</span></div>
<div class="contact-line">{ext(SITE["github"], "GitHub", "round-link contact-round")}<span>代码、项目说明和最近的修改，都在这里。</span></div>
<div class="footer-bottom"><p>张健航 © 2026</p><div><button data-copy-url>复制网站链接</button><a href="{base}references.html">参考与来源</a><button data-theme-secondary>切换主题</button></div></div>
</div></footer><div class="toast" role="status" aria-live="polite"></div>'''

def page(title, desc, content, base="./", canonical="", demo=None, page_type="inner"):
    data = f' data-demo="{demo}"' if demo else ""
    demo_css = f'<link rel="stylesheet" href="{base}demos.css?v={VERSION}">' if demo else ""
    demo_js = f'<script defer src="{base}demos.js?v={VERSION}"></script>' if demo else ""
    return f'''<!doctype html>
<html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>{e(title)}</title><meta name="description" content="{e(desc)}"><meta name="theme-color" content="#17191a">
<meta property="og:title" content="{e(title)}"><meta property="og:description" content="{e(desc)}"><meta property="og:type" content="website"><meta property="og:image" content="{SITE["url"]}assets/training-poster.png">
<link rel="canonical" href="{SITE["url"]}{canonical}"><link rel="icon" href="{base}favicon.svg" type="image/svg+xml">
<script>try{{if(localStorage.getItem('jh-theme')==='dark')document.documentElement.dataset.theme='dark'}}catch(e){{}}</script>
{demo_css}<link rel="stylesheet" href="{base}style.css?v={VERSION}"><script defer src="{base}app.js?v={VERSION}"></script>{demo_js}
</head><body data-base="{base}" data-page="{page_type}"{data}>{header(base)}{content}{footer(base)}</body></html>'''

def group(p):
    return "tools" if p["slug"] in ("launch-kit", "notes") else "personal" if p["slug"] in ("boxing", "portfolio") else "ai"

def screen(p):
    return {"zhixu":"zhixu-chat.png","model-atlas":"model-atlas-live.jpg","cash":"cash-dark.png","grok-fat":"grok-app.jpg","boxing":"boxing-analysis.png"}.get(p["slug"])

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
    return f'<div class="media-visual screen-visual media-{slug}"><img src="{base}assets/screens/{screen(p)}" alt="{e(name(p))}实际项目界面" {loading} width="1440" height="900"></div>'

def row(p, base="./"):
    path=f'{base}projects/{p["slug"]}/'
    preview=f' data-preview-src="{base}assets/screens/{screen(p)}"' if screen(p) else ""
    return f'''<article class="work-row" data-project data-group="{group(p)}"{preview}><div class="work-row-main"><h3><a href="{path}" aria-label="了解{e(name(p))}">{e(name(p))}</a></h3><p>{e(p.get("homeBlurb", p["description"]))}</p></div><div class="work-row-meta"><span>{e(p["category"].split(" / ")[0])}</span><div><a href="{path}">介绍</a><a href="{path}#demo">演示 <span aria-hidden="true">↗</span></a></div></div><a class="mobile-work-preview" href="{path}" tabindex="-1" aria-hidden="true">{visual(p,base)}</a></article>'''

def home():
    selected="".join(row(BY_SLUG[s]) for s in ("zhixu","model-atlas","boxing"))
    stills="".join(f'<a class="still-item" href="projects/{s}/">{visual(BY_SLUG[s])}<div><h3>{e(name(BY_SLUG[s]))}</h3><p>{e(BY_SLUG[s].get("homeBlurb", BY_SLUG[s]["description"]))}</p><span aria-hidden="true">↗</span></div></a>' for s in ("cash","grok-fat"))
    content=f'''<main id="main">
<section class="home-hero" aria-labelledby="hero-name">
<div class="training-scene"><video class="hero-video" muted loop playsinline preload="metadata" poster="assets/training-poster.png" aria-label="张健航的拳击训练片段"><source src="assets/training-loop.mp4" type="video/mp4"></video></div>
<div class="hero-side-note"><span>AI 产品经理</span><p>平时练拳，<br>也做一些 AI 项目。</p></div>
<a class="hero-work-link" href="#projects" aria-label="往下查看作品"><span>看看作品</span><span aria-hidden="true">↘</span></a>
<div class="hero-name"><h1 id="hero-name">张健航</h1><span>Jianhang Zhang</span></div>
<button class="motion-control" data-hero-play aria-pressed="false">播放画面</button><span class="hero-scroll-note" aria-hidden="true">向下看看</span>
</section>
<section class="container introduction" aria-label="个人简介"><h2>我叫张健航，25 岁。<br>计算机应用技术专业毕业，<br>现在做 AI 产品。</h2><div><p>这里放了我的个人项目，也有基于现有项目做的改版。知识库、模型资料站，还有一个用来复盘拳击动作的小工具。</p><a class="round-link about-round" href="about/">关于我 <span aria-hidden="true">↗</span></a></div></section>
<section class="container selected-work" id="projects" aria-labelledby="selected-heading"><div class="section-heading"><h2 id="selected-heading">一些项目</h2><a href="work/" class="quiet-link">查看全部 8 个项目 <span aria-hidden="true">↗</span></a></div><div class="work-list">{selected}</div><div class="all-work-link"><a class="outline-link" href="work/">全部项目 <span>8</span></a></div></section>
<section class="project-stills" aria-label="两个桌面项目"><div class="container"><div class="section-heading"><h2>桌面上的两个项目</h2><p>一个做游戏，一个处理日常任务。</p></div><div class="stills-grid">{stills}</div></div></section>
</main><div class="hover-preview" aria-hidden="true"><img alt="" src="assets/screens/zhixu-chat.png"></div>'''
    (ROOT/"index.html").write_text(page("张健航 — AI 产品经理", "张健航，25岁，计算机应用技术专业毕业。个人项目、开源定制、AI产品与拳击动作分析。",content,page_type="home"))

def work():
    cards=[]
    for p in PROJECTS:
        slug=p["slug"]
        cards.append(f'''<article class="work-card" data-project data-group="{group(p)}"><a class="work-card-image" href="../projects/{slug}/" aria-label="了解{e(name(p))}">{visual(p,"../")}</a><div class="work-card-title"><h2><a href="../projects/{slug}/">{e(name(p))}</a></h2><a href="../projects/{slug}/#demo">演示 ↗</a></div><p>{e(p["description"])}</p><div class="work-card-type"><span>{e(p["category"])}</span><span>{e(p["kind"])}</span></div></article>''')
    content=f'''<main id="main" class="container work-page"><div class="page-intro"><p class="page-kicker">作品</p><h1>做过的，<br>也还在改的。</h1><p>每个项目都写了用途、实现和取舍，也放了对应的演示。</p></div><div class="project-controls"><div class="filters" aria-label="筛选项目"><button data-filter="all" aria-pressed="true">全部</button><button data-filter="ai" aria-pressed="false">AI 产品</button><button data-filter="tools" aria-pressed="false">开发与学习</button><button data-filter="personal" aria-pressed="false">个人项目</button></div><p data-project-count role="status">8 个项目</p></div><div class="work-grid">{"".join(cards)}</div></main>'''
    folder=ROOT/"work";folder.mkdir(exist_ok=True)
    (folder/"index.html").write_text(page("作品 — 张健航","八个项目的介绍、实际界面与演示。",content,"../","work/"))

def about():
    content=f'''<main id="main" class="container about-page"><div class="page-intro"><p class="page-kicker">关于</p><h1>我是张健航。<br>做 AI 产品，也练拳。</h1></div><div class="about-layout"><figure class="about-photo"><img src="../assets/training-poster.png" alt="张健航在户外练习拳击" width="320" height="568"><figcaption>一段日常训练的视频截图。</figcaption></figure><div class="about-story"><p class="about-opening">25 岁，计算机应用技术专业毕业，AI 产品经理。</p><p>我把一些想试的东西做成了项目。企业里的资料怎么查，模型信息怎么整理，游戏创意能不能做成能玩的东西，这些都在作品里。</p><p>有从头做的工具，也有基于现有项目的改版。每个项目页里都写了具体用途和原作来源，可以直接看演示，也可以继续去读代码。</p><p>拳击给了我另一个选题。我拍了自己的训练视频，试着提取骨架和重心，再把结果叠回视频，方便逐拳回看。现在还是个二维分析的小原型。</p><div class="about-links"><a class="outline-link" href="../projects/boxing/">看看拳击分析 ↗</a>{ext(SITE["github"],"GitHub","outline-link")}</div><dl class="about-facts"><div><dt>岗位</dt><dd>AI 产品经理</dd></div><div><dt>专业</dt><dd>计算机应用技术</dd></div><div><dt>年龄</dt><dd>25 岁</dd></div></dl></div></div></main>'''
    folder=ROOT/"about";folder.mkdir(exist_ok=True)
    (folder/"index.html").write_text(page("关于张健航","张健航，25岁，计算机应用技术专业毕业，AI产品经理，平时练习拳击。",content,"../","about/"))

def case(p,index):
    nxt=PROJECTS[(index+1)%len(PROJECTS)]
    features="".join(f'<article class="feature-row"><h3>{e(f["title"])}</h3><p>{e(f["detail"])}</p></article>' for f in p["features"])
    decisions="".join(f'<article class="decision"><h3>{e(f["title"])}</h3><p>{e(f["detail"])}</p></article>' for f in p["decisions"])
    evidence="".join(f'<li>{ext(f["url"],e(f["label"]),"source-link")}<p>{e(f["detail"])}</p></li>' for f in p["evidence"])
    content=f'''<main id="main"><section class="container case-head"><nav class="breadcrumb" aria-label="面包屑"><a href="../../work/">全部作品</a><span aria-hidden="true">/</span><span>{e(name(p))}</span></nav><h1>{e(name(p))}</h1><div class="case-intro-grid"><p class="case-summary">{e(p["description"])}</p><div class="case-meta"><span>{e(p["kind"])}</span><span>{e(p["category"])}</span><div class="case-actions"><a class="text-link" href="#demo">查看演示 <span aria-hidden="true">↓</span></a>{ext(p["links"]["repo"],"项目源码")}</div></div></div><div class="case-media">{visual(p,"../../",False)}</div></section>
<div class="container case-layout"><nav class="case-toc" aria-label="项目内容"><a href="#demo">演示</a><a href="#problem">解决什么问题</a><a href="#features">具体功能</a><a href="#decisions">几处取舍</a><a href="#evidence">状态与来源</a></nav><div class="case-content">
<section class="case-section" id="demo"><h2>演示</h2><p>{e(p["demoIntro"])}</p><div id="project-demo" class="demo-shell" aria-label="{e(name(p))}交互演示"><div class="empty-demo">正在载入演示…</div></div><noscript><p class="demo-disclosure">交互演示需要 JavaScript，也可以通过源码链接查看项目。</p></noscript><p class="demo-disclosure">{e(p["demoLimit"])}</p></section>
<section class="case-section" id="problem"><h2>解决什么问题</h2><p>{e(p["summary"])}</p><dl class="problem-details"><div><dt>给谁用</dt><dd>{e(p["audience"])}</dd></div><div><dt>遇到的问题</dt><dd>{e(p["pain"])}</dd></div></dl></section>
<section class="case-section" id="features"><h2>具体做了什么</h2><div class="feature-list">{features}</div></section>
<section class="case-section" id="decisions"><h2>几处取舍</h2><div class="decision-grid">{decisions}</div></section>
<section class="case-section" id="evidence"><h2>当前状态</h2><p>{e(p["status"])}</p><div class="stack"><span>用到的工具</span><p>{e(" / ".join(p["stack"]))}</p></div><details class="project-sources"><summary>查看资料与原作来源 <span aria-hidden="true">+</span></summary><ul class="evidence-list">{evidence}</ul><p class="attribution">{e(p["attribution"])}</p></details></section>
<a class="next-project" href="../{nxt["slug"]}/"><small>下一个项目</small><strong>{e(name(nxt))}</strong><span aria-hidden="true">↗</span></a></div></div></main>'''
    folder=ROOT/"projects"/p["slug"];folder.mkdir(parents=True,exist_ok=True)
    (folder/"index.html").write_text(page(f'{name(p)} — 张健航',p["description"],content,"../../",f'projects/{p["slug"]}/',p["demoType"]))

def references():
    content='''<main id="main" class="container references"><p class="page-kicker">参考与来源</p><h1>这个网站<br>用到了什么。</h1><h2>视觉参考</h2><p>首屏的人物与姓名关系、作品列表和圆形入口，参考了 <a href="https://dennissnellenberg.com/" target="_blank" rel="noopener">Dennis Snellenberg</a> 的个人网站。项目演示的组织参考 <a href="https://screen.studio/" target="_blank" rel="noopener">Screen Studio</a>，围绕具体操作说明功能。</p><h2>照片和界面</h2><p>训练影像来自张健航本人提供的视频。首屏只做网页上的灰度呈现，保留实际人物与动作。项目预览主要采用公开项目中的实际界面、分析图表和示例资料。GitHub 头像用于个人标识。</p><p>八个项目均保留独立介绍、演示与源码链接。基于上游项目的改版，在详情中标明原作归属。原有 AI 生成封面继续保留在素材目录中。</p><h2>演示资料</h2><p>模型全景是可操作的静态网页，资料快照为 2026-11-06。拳击页播放已发布的标注片段。知识库、课堂纪要和开发手册使用固定示例，头像与游戏创作页提供界面或流程预览。各演示的范围在对应页面说明。</p><p><a href="content/SOURCES.md">项目资料与许可</a> · <a href="assets/manifest.json">媒体来源清单</a> · <a href="https://github.com/z2302743489/z2302743489.github.io" target="_blank" rel="noopener">网站源码</a></p></main>'''
    (ROOT/"references.html").write_text(page("参考与来源 — 张健航","网站设计参考、媒体来源与项目许可。",content,canonical="references.html"))

home()
work()
about()
for i,p in enumerate(PROJECTS):case(p,i)
references()
(ROOT/".nojekyll").touch()
(ROOT/"404.html").write_text(page("页面没找到 — 张健航","返回张健航的个人网站。",'<main id="main" class="container references"><p class="page-kicker">404</p><h1>这一页<br>暂时不在这里。</h1><p><a class="outline-link" href="/">回到首页 ↗</a></p></main>',"/","404.html"))
print("Built homepage, work, about, 8 project pages, references and 404.")
