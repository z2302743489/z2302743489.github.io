# 张健航 · AI 产品经理

个人网站：https://z2302743489.github.io/

按照用户指定的 Seán Halpin 个人网站结构，替换为张健航的个人介绍、实际项目截图与八个项目详情。保留浅色渐变、居中导航、宽窄交错项目卡片、关于页、项目搜索和时段主题刻度。原站商业字体使用可公开部署的 OFL 字体替代。

## 页面

- 首页与 work/：八个项目卡片，按原站宽窄网格排列。
- about/：个人背景、训练画面与项目条目。
- play/：头像、拳击视频及游戏玩法演示入口。
- projects/：八个独立介绍页，保留用途、功能、取舍、来源和演示。
- references.html：页面参考、字体和素材来源。

## 演示

知序引用问答、开发手册六阶段、模型全景网页、六款 Fat 头像、游戏创作流程和接星星示意、拳击标注视频、课堂笔记双模式，以及网站宽度和主题预览，均保留。各页面注明预置示例、视频和实际软件的范围。

模型全景资料快照为 2026-11-06。项目原作归属及许可见各详情页和 content/SOURCES.md。

## 本地预览

无需安装第三方依赖。

    python3 tools/build.py
    python3 -m http.server 4173

访问 http://localhost:4173/。按 / 搜索项目，页脚刻度切换背景时段。

## 内容维护

- site.json：基本资料。
- content/projects.json：八个项目内容。
- content/fixtures.json：保留的固定演示素材。
- tools/build.py：静态页面生成。
- style.css / app.js：排版、导航、联系窗口、搜索与主题背景。
- demos.css / demos.js：项目演示。
- assets/fonts/：本地字体及 OFL 许可。
- assets/manifest.json：媒体和字体来源、文件哈希。
- DESIGN.md：原站测量参数、内容映射与验证边界。

GitHub Pages 使用 main 分支根目录和 .nojekyll。GitHub Profile README 及像素动画位于另一个仓库，本次不修改。
