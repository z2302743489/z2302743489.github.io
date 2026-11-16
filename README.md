# 张健航 · AI 产品经理

个人作品网站：[z2302743489.github.io](https://z2302743489.github.io/)

介绍个人背景、产品思考与八个公开项目。每个项目提供独立页面，说明用途、用户问题、功能、设计取舍、当前状态和原作归属。

## 演示

- 知序：固定示例问答、来源原文与项目界面。
- 想法到上线：六阶段手册导览、人工核对清单和原始 PRD 模板下载。
- 模型全景：项目实际静态网页，资料快照为 2026-11-06。
- Grok fat：六款真实头像与动态风格预览。
- cash.ai：桌面界面、创作流程和单独实现的接星星玩法示意。
- 拳击动作分析：项目已发布的标注训练片段与分析图表。
- 课堂纪要：同一份公开转写的标准纪要、复习示例与复制操作。
- 个人网站：响应式宽度和全站主题预览。

固定示例不连接真实模型或桌面应用。所有项目保留源码入口，上游归属和第三方许可见各详情页及 [资料说明](content/SOURCES.md)。

## 本地预览

无需 npm 或第三方依赖。Python 3 可重新生成页面并启动服务器：

    python3 tools/build.py
    python3 -m http.server 4173

然后访问 http://localhost:4173/。

## 维护

- 个人信息、主题原则：site.json
- 项目内容：content/projects.json
- 演示固定素材：content/fixtures.json
- 页面生成：tools/build.py
- 样式、通用交互、演示：style.css / app.js / demos.js
- 媒体来源与哈希：assets/manifest.json
- 嵌入模型全景：demos/model-atlas/，保留原许可和来源日期

仓库根目录的 HTML 可直接发布。GitHub Pages 继续使用 main 分支根目录与 .nojekyll，不需要构建工作流。GitHub Profile README 及像素动画位于另一个仓库，网站重建未修改它们。

设计参考与素材说明见 [references.html](https://z2302743489.github.io/references.html)。
