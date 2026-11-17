/* Native Wander ground wind: local brand textures, world-space depth, no extra clock. */
(function (global) {
 'use strict';
 const VERSION='2.0.0',SHADER='WanderToolWindV2',instances=new WeakMap();
 const IDS=['openai','claude','gemini','deepseek','qwen','kimi','doubao','zhipu','hunyuan','wenxin','minimax','grok','meta','mistral','cohere','perplexity','yi','spark','stepfun','baichuan','ollama','githubcopilot','codex','claudecode','python','typescript','nextjs','fastapi','figma','pi-agent'];
 const DEFAULT_LOGOS=IDS.map(id=>({id,src:'assets/tool-logos-v2/'+id+'.png',aspect:1}));
 const LANES=[{id:'near',z:-.58,depthJitter:.12,foot:.025,px:[44,59],mobilePx:[33,43],opacity:.88},{id:'middle',z:-2.25,depthJitter:.35,foot:.055,px:[33,45],mobilePx:[27,35],opacity:.78},{id:'far',z:-4.25,depthJitter:.55,foot:.085,px:[25,34],mobilePx:[22,29],opacity:.68}];
 const clamp=(x,a,b)=>Math.max(a,Math.min(b,x)),number=(x,f)=>Number.isFinite(Number(x))?Number(x):f;
 const smooth=(a,b,x)=>{const t=clamp((x-a)/(b-a),0,1);return t*t*(3-2*t);};
 const sync=(scene,key,fallback)=>{try{return number(scene.getSync?.(key),fallback);}catch(_){return fallback;}};
 const VS='varying vec2 vToolUv;\nvarying float vToolNdcHeight;\nvoid main(){vToolUv=uv;vec4 clip=projectionMatrix*modelViewMatrix*vec4(position,1.0);vToolNdcHeight=1.0-(clip.y/clip.w*.5+.5);gl_Position=clip;}';
 const FS='uniform sampler2D tToolLogo;\nuniform vec3 uToolInk;\nuniform float uToolOpacity;\nuniform float uToolClipBottom;\nuniform float uToolClipTop;\nvarying vec2 vToolUv;\nvarying float vToolNdcHeight;\nvoid main(){if(vToolNdcHeight<uToolClipBottom||vToolNdcHeight>uToolClipTop)discard;float alpha=texture2D(tToolLogo,vToolUv).a*uToolOpacity;if(alpha<.015)discard;gl_FragColor=vec4(uToolInk,alpha);}';
 function describeAssets(input){const supplied=Array.isArray(input)?input:input?.logos;return(supplied?.length?supplied:DEFAULT_LOGOS).slice(0,64).map((logo,i)=>{if(typeof logo==='string')logo={src:logo};if(!logo?.src||typeof logo.src!=='string'||/^(?:https?:)?\/\//i.test(logo.src))throw new TypeError('Wind logos require local src');return{id:logo.id||IDS[i]||'tool-'+i,src:logo.src,aspect:clamp(number(logo.aspect,1),.45,2.2)};});}
 /** Same integration API as v1; update receives the existing Wander Render.DELTA in ms. */
 function mount(scene,context,options){
  if(!scene?.group?.add)throw new TypeError('Wander scene.group is required');
  if(instances.has(scene))return instances.get(scene);
  context=context||{};options=options||{};
  const{Mesh,PlaneGeometry,Group,Shader,Shaders,Utils3D,Color}=context;
  if(![Mesh,PlaneGeometry,Group,Shader,Color].every(x=>typeof x==='function')||!Shaders||!Utils3D?.getTexture)throw new TypeError('Native Mesh/PlaneGeometry/Group/Shader/Shaders/Utils3D/Color required');
  Shaders[SHADER+'.vs']=VS;Shaders[SHADER+'.fs']=FS;
  const logos=describeAssets(options.logos),group=new Group(),items=[],textures=[],motion=global.matchMedia?.('(prefers-reduced-motion: reduce)');
  group.name='wander-tool-wind-v2';group.visible=false;scene.group.add(group);
  let dimensions,ready=false,destroyed=false,running=true,clock=0,cursor=0,generation=0;
  function camera(){const c=options.getCamera?.()||context.Global?.CAMERA?.camera||context.Global?.CAMERA?.worldCamera||scene.parentCamera?.camera||scene.parentCamera?.worldCamera;return c?.camera||c;}
  function measure(){
   const cam=camera(),stage=context.Stage||global.Stage,heightPx=Math.max(1,number(stage?.height,global.innerHeight||900)),widthPx=Math.max(1,number(stage?.width,global.innerWidth||1440));
   const aspect=number(cam?.aspect,widthPx/heightPx),screenHeight=Math.max(.1,sync(scene,'Story/screenHeightWorld',6)),height=Math.max(screenHeight,number(scene.heightWorld,screenHeight*2.5)),cameraZ=number(cam?.position?.z,8);
   return{screenHeight,height,heightPx,widthPx,aspect,narrow:widthPx/heightPx<1,atDepth(z){let h=screenHeight;if(cam&&Utils3D.getHeightFromCamera)h=number(Utils3D.getHeightFromCamera(cam,Math.max(.2,cameraZ-z)),screenHeight);h=Math.max(.1,h);return{height:h,width:Math.max(.1,h*aspect)};}};
  }
  function targetCount(){return Math.min(items.filter(i=>i.loaded).length,Math.floor(clamp(number(dimensions.narrow?options.mobileVisible:options.desktopVisible,number(options.maxVisible,dimensions.narrow?7:12)),dimensions.narrow?5:8,dimensions.narrow?7:12)));}
  function configure(item){
   const lane=LANES[item.band],m=dimensions;item.z=lane.z-item.seed*lane.depthJitter;const plane=m.atDepth(item.z),range=m.narrow?lane.mobilePx:lane.px;
   item.sizePx=range[0]+(range[1]-range[0])*item.seed;item.size=item.sizePx/m.heightPx*plane.height;
   item.left=-plane.width*.5-item.size*.55;item.right=plane.width*.5+item.size*.55;item.span=item.right-item.left;
   item.baseSpeed=item.span/item.duration;item.floor=-m.height*.5+lane.foot*m.screenHeight+item.size*.5;
   item.mesh.scale.set(item.size*item.logo.aspect,item.size,1);
  }
  function pose(item){
   const x=item.left+item.distance,hop=Math.sin(item.angle*.56+item.phase)**2;
   item.mesh.position.set(x,item.floor+item.size*.07*hop,item.z+item.size*.012*Math.sin(clock*.37+item.phase));
   item.mesh.rotation.set(.035*Math.sin(clock*.43+item.phase),.065*Math.sin(clock*.29+item.phase),item.angle+.025*Math.sin(clock*.63+item.phase));
   const p=item.distance/item.span,edge=smooth(0,.02,p)*(1-smooth(.98,1,p)),width=dimensions.atDepth(item.z).width;
   // Near symbols stay below the feet and fade through the center. Further
   // bands sit behind the original character and the foreground paper meshes.
   const centerClear=smooth(.025,.085,Math.abs(x)/width),minimum=item.band===0?0:item.band===1?.2:.38;
   item.shader.uniforms.uToolOpacity.value=edge*(minimum+(1-minimum)*centerClear)*LANES[item.band].opacity;
  }
  function nextAvailable(){for(let n=0;n<items.length;n++){const item=items[cursor++%items.length];if(item.loaded&&!item.active&&item.availableAt<=clock)return item;}return null;}
  function startItem(progress,preferredBand){
   const item=nextAvailable();if(!item)return false;
   if(preferredBand===undefined){let best=Infinity,bestBand=0;for(let band=0;band<3;band++){const list=items.filter(i=>i.active&&i.band===band),nearest=list.length?Math.min(...list.map(i=>i.distance/i.span)):1,score=list.length+(nearest<.16?2:0)+band*.012;if(score<best){best=score;bestBand=band;}}item.band=bestBand;}else item.band=preferredBand;
   configure(item);item.active=true;item.generation=++generation;item.distance=item.span*clamp(number(progress,0),0,1);item.angle=item.phase-item.distance/Math.max(.01,item.size*2.6);item.mesh.visible=true;pose(item);return true;
  }
  function rebalance(){
   if(!ready)return;const count=targetCount(),active=items.filter(i=>i.active);
   if(active.length>count)for(const item of active.slice(count)){item.active=false;item.mesh.visible=false;item.shader.uniforms.uToolOpacity.value=0;item.availableAt=clock+.25;}
   const missing=count-items.filter(i=>i.active).length;
   for(let i=0;i<missing;i++){
    let band=0,best=Infinity;for(let k=0;k<3;k++){const occupancy=items.filter(x=>x.active&&x.band===k).length;if(occupancy<best){best=occupancy;band=k;}}
    const ps=[.025,...items.filter(x=>x.active&&x.band===band).map(x=>x.distance/x.span),.975].sort((a,b)=>a-b);let gap=-1,progress=.5;
    for(let j=1;j<ps.length;j++)if(ps[j]-ps[j-1]>gap){gap=ps[j]-ps[j-1];progress=(ps[j]+ps[j-1])*.5;}
    if(!startItem(progress,band))break;
   }
  }
  function resize(){
   if(destroyed)return;dimensions=measure();for(const item of items){const p=item.span?item.distance/item.span:0;configure(item);item.distance=p*item.span;if(item.active)pose(item);}rebalance();
  }
  function visible(){return running&&ready&&scene.visible!==false&&scene.group.visible!==false&&scene.group.hidden!==true&&!global.document?.hidden;}
  function update(deltaMs){
   if(destroyed)return;group.visible=visible();if(!group.visible)return;
   const y=sync(scene,'Story/scrollY',0),h=dimensions.screenHeight,clipBottom=(number(scene.worldBottom,0)+y)/h,clipTop=(number(scene.worldTop,dimensions.height)+y)/h;
   for(const item of items){item.shader.uniforms.uToolClipBottom.value=clipBottom;item.shader.uniforms.uToolClipTop.value=clipTop;}
   if(motion?.matches)return;
   const dt=clamp(number(deltaMs,1000/60),0,50)/1000;clock+=dt;
   const gust=1+.09*Math.sin(clock*.17)+.045*Math.sin(clock*.063+.9);
   for(const item of items)if(item.active){
    let nearest=Infinity;for(const other of items)if(other!==item&&other.active&&other.band===item.band&&other.distance>item.distance)nearest=Math.min(nearest,other.distance-item.distance);
    const spacing=.55+.45*smooth(item.size*1.4,item.size*4.2,nearest),dx=item.baseSpeed*gust*(1+.035*Math.sin(clock*.23+item.phase))*spacing*dt;
    item.distance+=dx;item.angle-=dx/Math.max(.01,item.size*2.6);
    if(item.distance>item.span){item.active=false;item.mesh.visible=false;item.shader.uniforms.uToolOpacity.value=0;item.availableAt=clock+.25;}else pose(item);
   }
   const missing=targetCount()-items.filter(i=>i.active).length;for(let i=0;i<missing;i++)if(!startItem(0))break;
  }
  function screenPosition(item){
   const p=item.mesh.position,cam=camera(),world=scene.group.matrixWorld?.elements,view=cam?.matrixWorldInverse?.elements,projection=cam?.projectionMatrix?.elements;
   const mult=(m,q)=>[0,1,2,3].map(r=>m[r]*q[0]+m[r+4]*q[1]+m[r+8]*q[2]+m[r+12]*q[3]);
   if(world&&view&&projection){const clip=mult(projection,mult(view,mult(world,[p.x,p.y,p.z,1])));return{x:(clip[0]/clip[3]+1)*.5,y:(1-clip[1]/clip[3])*.5,method:'native camera/group matrices'};}
   const plane=dimensions.atDepth(item.z),gy=number(scene.group.position?.y,0),gx=number(scene.group.position?.x,0);
   return{x:.5+(p.x+gx-number(cam?.position?.x,0))/plane.width,y:.5-(p.y+gy-number(cam?.position?.y,0))/plane.height,method:'native camera dimensions and scene translation'};
  }
  function stats(){
   const states=items.filter(i=>i.active).map(item=>{const screen=screenPosition(item),o=item.shader.uniforms.uToolOpacity.value,halfY=item.sizePx/dimensions.heightPx*.5,halfX=item.sizePx*item.logo.aspect/dimensions.widthPx*.5,clipBottom=item.shader.uniforms.uToolClipBottom.value,clipTop=item.shader.uniforms.uToolClipTop.value;const onScreen=screen.x+halfX>0&&screen.x-halfX<1&&screen.y+halfY>0&&screen.y-halfY<1&&screen.y+halfY>=clipBottom&&screen.y-halfY<=clipTop;return{id:item.logo.id,instanceId:item.index,generation:item.generation,band:LANES[item.band].id,progress:item.distance/item.span,opacity:o,onScreen,effective:group.visible&&onScreen&&o>.07,screen,position:{x:item.mesh.position.x,y:item.mesh.position.y,z:item.mesh.position.z},angle:item.angle,sizePx:item.sizePx,size:item.size,floor:item.floor,duration:item.duration};});
   return{version:VERSION,ready,destroyed,visible:group.visible,elapsed:clock,loaded:items.filter(i=>i.loaded).length,assetCount:logos.length,maxVisible:targetCount(),targetVisible:targetCount(),active:states.map(i=>i.id),effectiveVisible:states.filter(i=>i.effective).length,items:states,bands:LANES.map(l=>l.id),narrow:dimensions.narrow,errors:items.filter(i=>i.error).map(i=>({id:i.logo.id,message:i.error})),densityQualification:'Projected quad bounds/scene clip and opacity; native depth occlusion is retained and requires render inspection.'};
  }
  function destroy(){if(destroyed)return;destroyed=true;group.visible=false;for(const item of items)item.mesh.destroy?.();for(const texture of textures)texture.destroy?.();group._parent?.remove?.(group);group.destroy?.();instances.delete(scene);}
  const controller={version:VERSION,group,update,resize,destroy,stats,setEnabled(value){running=Boolean(value);if(!running)group.visible=false;}};
  instances.set(scene,controller);dimensions=measure();
  for(let i=0;i<logos.length;i++){
   const logo=logos[i],seed=((i*37+11)%101)/100,geometry=new PlaneGeometry(1,1),texture=Utils3D.getTexture(logo.src,{premultiplyAlpha:false});textures.push(texture);
   const shader=new Shader(SHADER,{tToolLogo:{value:texture},uToolInk:{value:new Color(options.ink||'#171613')},uToolOpacity:{value:0},uToolClipBottom:{value:-10},uToolClipTop:{value:10}});
   shader.transparent=true;shader.depthWrite=false;shader.depthTest=true;shader.side=Shader.DOUBLE_SIDE;
   const mesh=new Mesh(geometry,shader);mesh.name='tool-wind-v2-'+logo.id;mesh.visible=false;mesh.frustumCulled=false;group.add(mesh);
   const item={index:i,logo,mesh,shader,seed,band:i%3,z:0,duration:27+seed*10,phase:i*2.399,active:false,loaded:false,distance:0,angle:0,generation:0,availableAt:0};items.push(item);configure(item);
   item.promise=Promise.resolve(texture.promise).then(()=>{if(!destroyed){item.loaded=true;mesh.upload?.();}},error=>{item.error=String(error?.message||error||'texture load failed');});
  }
  controller.ready=Promise.all(items.map(i=>i.promise)).then(()=>{if(destroyed)return controller;ready=true;const count=targetCount();for(let i=0;i<count;i++)startItem((i+.5)/count,i%3);return controller;});
  return controller;
 }
 const api={version:VERSION,mount,defaultLogos:DEFAULT_LOGOS};global.NotturnoToolWind=api;global.NotturnoToolWindV2=api;
})(globalThis);
