const projects = {
  assistant: {title:'AI 助手：从问题到解决方案',intro:'产品设计案例的展示模板。可在这里加入你的真实项目背景、负责范围与设计过程。',sections:[['01 / 场景与问题','谁会使用这款产品？他们在什么情境下遇到了什么问题？补充访谈、观察或其他真实证据。'],['02 / 产品与体验','描述核心流程、关键交互，以及 AI 在其中承担的角色。可以加入原型、设计决策和取舍。'],['03 / 验证与复盘','展示真实的验证方法与结果，再记录收获、局限，以及下一步迭代。']]},
  workflow: {title:'智能工作流：让协作更顺畅',intro:'工作流案例的展示模板。可用真实项目说明如何把一个复杂任务拆解成可执行的步骤。',sections:[['01 / 原有流程','记录现有任务的参与者、操作步骤和主要阻力，说明为什么值得改进。'],['02 / 人机协作','标明 AI 可以完成的任务、需要人工确认的节点，以及失败时的处理方式。'],['03 / 实际效果','用真实反馈或有依据的数据比较改进前后的体验，保留未解决的问题。']]},
  research: {title:'关于 AI 产品的观察笔记',intro:'研究文章的展示模板。可在这里整理产品体验、案例分析或学习记录。',sections:[['01 / 提出问题','选择一个具体问题，并说明观察范围、背景与研究动机。'],['02 / 收集证据','记录实际体验、公开资料和观察结果，区分事实、推测与个人判断。'],['03 / 形成观点','把证据组织成可讨论的结论，同时写下局限和仍待验证的问题。']]}
};
const dialog = document.querySelector('#project-dialog');
document.querySelectorAll('.filter').forEach(button=>button.addEventListener('click',()=>{
  document.querySelectorAll('.filter').forEach(item=>{const active=item===button;item.classList.toggle('active',active);item.setAttribute('aria-pressed',String(active));});
  document.querySelectorAll('.project').forEach(card=>card.hidden=button.dataset.filter!=='all'&&card.dataset.category!==button.dataset.filter);
}));
document.querySelectorAll('[data-project]').forEach(button=>button.addEventListener('click',()=>{
  const project=projects[button.dataset.project];
  document.querySelector('#dialog-title').textContent=project.title;
  document.querySelector('#dialog-intro').textContent=project.intro;
  const body=document.querySelector('#dialog-body');body.replaceChildren();
  project.sections.forEach(([title,content])=>{const block=document.createElement('section');block.className='dialog-block';const h=document.createElement('h3');h.textContent=title;const p=document.createElement('p');p.textContent=content;block.append(h,p);body.append(block);});
  dialog.showModal();
}));
document.querySelector('.dialog-close').addEventListener('click',()=>dialog.close());
document.querySelector('.dialog-done').addEventListener('click',()=>dialog.close());
dialog.addEventListener('click',event=>{const rect=dialog.getBoundingClientRect();if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)dialog.close();});
let toastTimer;
function showToast(message){const toast=document.querySelector('#toast');toast.textContent=message;toast.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>toast.classList.remove('show'),3500);}
document.querySelector('#copy-card').addEventListener('click',async()=>{
  const card='张健航｜AI 产品经理\n'+location.origin+location.pathname;
  try{await navigator.clipboard.writeText(card);showToast('已复制名片：张健航 · AI 产品经理');}
  catch{showToast('暂时无法复制，请从浏览器地址栏复制网站链接。');}
});
