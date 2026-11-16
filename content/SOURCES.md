# 内容、演示与许可

个人简介由张健航提供，项目介绍依据各公开仓库的 README 与示例文件整理。每个项目页保留源码、当前状态和上游归属；这里的资料记录于 2026-11-16。

## 项目来源

- [知序](https://github.com/z2302743489/zhixu-knowledge-platform)：问答固定样例来自 examples/employee-policy.md，原文为虚构员工制度。
- [想法到上线](https://github.com/z2302743489/idea-to-launch-kit)：阶段导览根据操作手册整理，原始 PRD 模板保留原文及 hubooooooo 的 MIT 署名。模板中的预算和额度示例使用前需按实际情况调整。
- [模型全景](https://github.com/z2302743489/ai-model-atlas)：嵌入 a37035b84fc2d8b6d88acbe7f97dc4d0b602206a 的静态构建，资料快照日期为 2026-11-06。原 LICENSE、LobeHub 图标许可与第三方声明保留在 demos/model-atlas 中。
- [Grok fat](https://github.com/z2302743489/Grok-fat)：基于 milind-soni/OpenMausBot 0.1.143 的个人定制版，核心沿用 Apache-2.0。头像为项目实际素材，桌面界面为隔离测试截图。
- [cash.ai](https://github.com/z2302743489/cash.ai)：基于 Innate-Labs 项目进行品牌与体验调整。保留上游归属；上游暂无明确许可证。本网站不额外授予其代码的再分发或商业使用权。
- [拳击动作与重心分析](https://github.com/z2302743489/boxing-pose-analysis)：视频片段与图表取自项目公开的单段训练样例；基础组件和方法归各原作者。
- [课堂纪要拆解](https://github.com/z2302743489/class-notes-digest)：演示输入来自 examples/sample-transcript.txt。标准版和精简复习版均为本站整理示例；原 sample-output 实际为考试复习版，全文保留在 fixtures.json。
- [个人网站](https://github.com/z2302743489/z2302743489.github.io)：项目卡片、独立详情页及本地交互演示的源码。

## 演示素材

fixtures.json 中的 knowledge、notes 和 launch 均为固定素材，不调用模型。每段知识库引用和课堂整理均保留来源行号与 URL。Git blob SHA 用于定位固定样本内容；若仓库后续更新，分支链接的行号可能变化。

知识库引用年假 L7–8、设备 L12、学习支持 L16–17。课堂材料未讲解的 fork 作业答案保留为待补充；不将整理示例当作考试频率预测。

游戏页的接星星示意由本站单独实现，不是 cash.ai 的实时生成结果。项目功能介绍不等同于独立运行或性能测试报告。

媒体来源、转换方式和文件哈希见 ../assets/manifest.json。AI 生成封面为项目视觉，不能当作实际产品界面或本人照片。

## 原始 PRD 模板许可

content/prd-template.md 保留上游原始字节，完整许可如下。

```text
MIT License

Copyright (c) 2025 hubooooooo

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```
