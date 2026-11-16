# 张健航 · AI 产品经理

个人网站：https://z2302743489.github.io/

本人训练影像、大号姓名与项目列表组成首页。视觉参考 Dennis Snellenberg 的个人网站，使用自己的影像、文字与项目素材重新实现。

## 页面

- 首页：个人介绍、三个精选项目、两个桌面项目及 GitHub 入口。
- work/：全部八个项目，可按类型筛选。
- about/：个人背景与拳击分析项目的来由。
- projects/：八个独立介绍页，保留功能、取舍、来源与演示。
- references.html：设计参考、素材与演示说明。

## 演示

知序的引用问答、开发手册六阶段、模型全景静态网页、六款 Fat 头像、游戏创作流程与接星星示意、拳击标注片段、课堂笔记双模式，以及网站宽度和主题预览，均保留。预置示例会在各页面说明，不连接真实模型或桌面应用。

模型全景资料快照为 2026-11-06。上游归属及第三方许可见各详情页和 content/SOURCES.md。

## 本地预览

无需第三方依赖，Python 3 即可生成和预览。

    python3 tools/build.py
    python3 -m http.server 4173

访问 http://localhost:4173/。

## 内容维护

- site.json：基本资料。
- content/projects.json：项目内容、首页短名与短句。
- content/fixtures.json：演示固定素材，本次未修改。
- tools/build.py：静态页面生成。
- style.css / app.js：首页及项目排版、导航、主题和首屏视频。
- demos.css / demos.js：原有项目演示。
- assets/manifest.json：媒体来源、转换方式和文件哈希。

GitHub Pages 使用 main 分支根目录和 .nojekyll。GitHub Profile README 及像素动画位于另一个仓库，本次未修改。
