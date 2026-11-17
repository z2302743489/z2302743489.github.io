# 张健航 · AI 产品经理

个人网站：https://z2302743489.github.io/

当前首页采用已确认的版画 WebGL 落地页版本，保留 AIPM 标识、张健航 / PERSONAL PROFILE 标题、原版主角、中文叙事、模型图标风滚草、连续飞纸以及剧场圆门的流动效果。

## 运行与部署

GitHub Pages 从 `main` 分支根目录发布，`.nojekyll` 保证下划线目录和二进制资源原样部署。此首页是静态文件，不需要安装依赖或构建。

```sh
python3 -m http.server 4173 --bind 127.0.0.1
```

浏览器打开 http://127.0.0.1:4173/，需支持 WebGL 2 和硬件加速。滚动推进故事，按住提示区域完成互动。

本次只替换首页并新增体验所需资源，既有 `work/`、`about/`、`play/`、`projects/`、`demos/` 以及旧版样式和素材均保留。GitHub Profile README 的个人网站链接已经指向此地址。

## 后续维护

- 当前首页入口为 `index.html`，当前运行时为 `assets/js/app.personal-brand-v5.1782836328290.js`。
- 原始落地页源版本为 `83717d4f291c81d382178f340d464f9863d30d98`，迁移时仅调整站点地址、页面语言和分享元信息。
- `assets/product-gate-v4/manifest-air-v4.1.json` 中的「观戏」入口暂时保持用户原有本机地址 `http://127.0.0.1:7107/`，正式对外演示产品时需替换为公网地址；当前页面的视觉展示不依赖该服务。
- `tools/build.py` 维护作品列表及项目页，默认保留当前 `index.html`。只有显式使用 `--include-home` 才会生成旧版作品首页。
- 视觉参考及原客户端素材来源为 https://santionispirits.com/，保留原创作署名。模型与工具图标来源见 `assets/tool-logos-v2/manifest.json`。

## Toonflow 作品同步（2026-11-17）

- `/work/` 中的“个人作品集”已替换为 Toonflow Skills，保持八个项目。
- `/projects/toonflow/` 提供独立介绍，说明用途、42 个 Skill 的分组、运行条件及上游来源。
- 演示可切换《末班车》的三个场次、四个角色/场景对象，以及五个安装分组；支持复制与下载，不调用模型或媒体服务。
- `/play/` 增加 Toonflow 演示入口，项目搜索同步更新。
- 旧 `/projects/portfolio/` 入口跳转到 Toonflow；其余七个项目及固定示例保留。
- 新封面复用 GitHub 上已确认的原图，按原始 1672×941 比例完整展示。

## 保留的原站点说明

个人网站：https://z2302743489.github.io/

按照用户指定的 Seán Halpin 个人网站结构，替换为张健航的个人介绍、实际项目截图与八个项目详情。保留浅色渐变、居中导航、宽窄交错项目卡片、关于页、项目搜索和时段主题刻度。原站商业字体使用可公开部署的 OFL 字体替代。

## 页面

- work/：八个项目卡片，按原站宽窄网格排列；首页仍为单独维护的 WebGL 页面。
- about/：个人背景、训练画面与项目条目。
- play/：头像、拳击视频及游戏玩法演示入口。
- projects/：八个独立介绍页，保留用途、功能、取舍、来源和演示。
- references.html：页面参考、字体和素材来源。

## 演示

知序引用问答、开发手册六阶段、模型全景网页、六款 Fat 头像、游戏创作流程和接星星示意、拳击标注视频、课堂笔记双模式，以及 Toonflow 的文字试跑和安装导览。各页面注明预置示例、视频和实际软件的范围。

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
