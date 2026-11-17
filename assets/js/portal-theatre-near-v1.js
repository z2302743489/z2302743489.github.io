/* NearScene only: a complete theatre image on its existing living circle material. */
(function(global){
 'use strict';
 const VERSION='1.1.0',BASE='PortalShader',NAME='NearPortalTheatreV11',instances=new WeakMap();
 const STATES=['side','blending','colorMask','polygonOffset','polygonOffsetFactor','polygonOffsetUnits','depthTest','depthWrite','depthFunc','stencilTest','stencilMask','stencilFunc','stencilOp','wireframe','transparent','visible','precision','receiveLight','receiveShadow','_parentnuke'];
 const check=(v,m)=>{if(!v)throw Error('NearTheatre: '+m);},clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
 function stage(Shaders,type){const key=BASE+'.'+type,code=Shaders.getShader?Shaders.getShader(key):Shaders[key];check(typeof code==='string'&&code.includes('void main'),'source shader missing '+key);return code;}
 function deriveStages(vs,fs){
  const main=/void\s+main\s*\(\s*\)\s*\{/g;check([...vs.matchAll(main)].length===1&&[...fs.matchAll(main)].length===1,'one original main per stage required');
  const vertex='varying vec2 vNearTheatreUv;\n'+vs.replace(main,m=>m+'\n// NEAR_THEATRE_V1_UV_BEGIN\nvNearTheatreUv=vec2(position.x,-position.z)*0.5+0.5;\n// NEAR_THEATRE_V1_UV_END\n');
  const declarations='varying vec2 vNearTheatreUv;\nuniform sampler2D tNearTheatre;\nuniform vec2 uNearTheatreSize;\nuniform float uNearTheatreWarp;\nuniform float uNearTheatreFluidBound;\n';
  const art=`
// NEAR_THEATRE_V1_ART_BEGIN
    // Deform the native coordinate before BOTH support mask and image lookup.
    // Thus the actual image edge moves through the same original time/noise/
    // fluid field; it is not a fixed rectangle with a moving picture inside.
    vec2 nearTheatreLocal=(vNearTheatreUv-0.5)/uNearTheatreSize;
    float nearTheatreEdgeDrive=smoothstep(0.12,0.46,max(abs(nearTheatreLocal.x),abs(nearTheatreLocal.y)));
    float nearTheatreRadius=length(vNearTheatreUv-0.5);
    float nearTheatreRadialWave=sin(nearTheatreRadius*17.0-steppedTime*0.9+n1*2.0);
    vec2 nearTheatreWave=vec2(sin(nearTheatreLocal.y*5.2+steppedTime*0.83+n1*2.2),cos(nearTheatreLocal.x*4.8-steppedTime*0.71+n2*2.0));
    vec2 nearTheatreFlow=(vec2(n1,n2)-0.5)*1.12+nearTheatreWave*0.30;
    nearTheatreFlow+=(vNearTheatreUv-0.5)*nearTheatreRadialWave*0.22;
    nearTheatreFlow+=uNearTheatreFluidBound*(clamp(fluid.xy*0.01,vec2(-1.0),vec2(1.0))*0.22+nearTheatreWave*clamp(abs(fluid.z),0.0,1.0)*0.10);
    nearTheatreFlow/=max(1.0,length(nearTheatreFlow));
    vec2 nearTheatreDisplacement=nearTheatreFlow*uNearTheatreWarp*mix(0.45,1.0,nearTheatreEdgeDrive);
    vec2 nearTheatreFlowUv=vNearTheatreUv+nearTheatreDisplacement;
    vec2 nearTheatreUv=(nearTheatreFlowUv-0.5)/uNearTheatreSize+0.5;
    float nearTheatreInside=step(0.0,nearTheatreUv.x)*step(0.0,nearTheatreUv.y)*step(nearTheatreUv.x,1.0)*step(nearTheatreUv.y,1.0);
    float nearTheatreEdge=min(min(nearTheatreUv.x,nearTheatreUv.y),min(1.0-nearTheatreUv.x,1.0-nearTheatreUv.y));
    nearTheatreInside*=smoothstep(0.0,0.012,nearTheatreEdge);
    vec3 nearTheatreColor=texture2D(tNearTheatre,clamp(nearTheatreUv,vec2(0.0),vec2(1.0))).rgb;
    nearTheatreColor*=0.94+0.06*value;
    color=mix(color,nearTheatreColor,nearTheatreInside);
// NEAR_THEATRE_V1_ART_END
`;
  const output='gl_FragColor = vec4(color, alpha);';check(fs.split(output).length===2,'retained PortalShader output anchor');
  return{vertex,fragment:declarations+fs.replace(output,art+output)};
 }
 function maskStages(vs,fs){const d=deriveStages(vs,fs);return{vertex:d.vertex,fragment:d.fragment.replace('gl_FragColor = vec4(color, alpha);','gl_FragColor = vec4(vec3(nearTheatreInside * alpha), 1.0);')};}
 function mount(scene,context,options={}){
  check(scene?.fragName==='NearScene','only NearScene is supported');if(instances.has(scene))return instances.get(scene);
  const{Shader,Shaders,Utils3D,Vector2,Tests}=context||{};check(typeof Shader==='function'&&Shaders&&Utils3D?.getTexture&&typeof Vector2==='function','native Shader/Shaders/Utils3D/Vector2 required');
  const source='assets/product-gate-v3/theatre-source.png',aspect=2444/1050,width=clamp(Number.isFinite(options.width)?options.width:.72,.1,.72),uvSize=[width,width/aspect],nativeWarp=clamp(Number.isFinite(options.warp)?options.warp:.018,0,.022);
  let mesh=null,original=null,derived=null,geometry=null,texture=null,installed=false,destroyed=false,restored=false,error=null,textureLoaded=false,fluidPolicy='unknown',releaseCanceled;
  const canceled=new Promise(resolve=>{releaseCanceled=resolve;});
  const previousDestroy=scene.onDestroy;
  const sourceUniformsReady=()=>original?.uniforms&&['uSteppedTime','uLinesTile','uStep','tNoise','tLines','uDiscardBottom','uDiscardTop'].every(k=>original.uniforms[k]!==undefined);
  const hasFluid=()=>Boolean(original?.uniforms?.tFluid?.value&&original?.uniforms?.tFluidMask?.value);
  function syncUniforms(){
   if(!derived||destroyed)return;
   // A late MouseFluid.applyTo installs wrappers after the component itself is
   // ready. Keep those exact wrappers, including the velocity FBO swap object.
   for(const[key,value]of Object.entries(original.uniforms))if(value!==undefined&&derived.uniforms[key]!==value)derived.uniforms[key]=value;
   derived.uniforms.uNearTheatreFluidBound.value=hasFluid()?1:0;
  }
  function refresh(shader){if(mesh?.shader!==shader){mesh.shader=shader;mesh.geometry=geometry;mesh.upload?.();}}
  function destroy(){
   if(destroyed)return;destroyed=true;releaseCanceled();
   if(mesh?.shader===derived){refresh(original);restored=true;}
   installed=false;derived?.destroy?.();texture?.destroy?.();
   if(scene.onDestroy===destroyHook)scene.onDestroy=previousDestroy;
   instances.delete(scene);
  }
  function destroyHook(...args){destroy();return previousDestroy?.apply(this,args);}
  async function waitFor(predicate,message){if(predicate()||destroyed)return;check(typeof scene.wait==='function','native scene.wait required for '+message);await Promise.race([scene.wait(()=>destroyed||predicate()),canceled]);}
  const controller={version:VERSION,ready:null,update:syncUniforms,resize:syncUniforms,destroy,restore:destroy,
   stats(){return{version:VERSION,scene:'NearScene',sourceShader:BASE,derivedShader:NAME,applied:installed,ready:installed,restored,destroyed,error,sourceImage:source,imageAspect:aspect,uvSize:uvSize.slice(),sourceCircleRadius:1,cornerRadiusUv:Math.hypot(...uvSize)*.5,maximumNativeWarp:nativeWarp,warpSpace:'native normalized XZ, shared by image and support mask',originalAlphaRetained:true,fluidPolicy,fluidBound:hasFluid(),textureLoaded,linkedUniforms:derived&&original?Object.keys(original.uniforms).filter(k=>derived.uniforms[k]===original.uniforms[k]).length:0};}
  };
  instances.set(scene,controller);scene.onDestroy=destroyHook;
  controller.ready=(async()=>{
   if(Shaders.ready)await Promise.race([Shaders.ready(),canceled]);if(destroyed)return controller;
   mesh=options.mesh||scene.layers?.portal||scene._layers?.portal;
   if(!mesh&&scene.layout?.getAllLayers){const layers=await Promise.race([scene.layout.getAllLayers(),canceled]);if(destroyed)return controller;mesh=layers?.portal;}
   if(destroyed)return controller;check(mesh?.shader&&mesh?.geometry,'NearScene portal mesh unavailable');original=mesh.shader;geometry=mesh.geometry;
   check((!original.vsName||original.vsName===BASE)&&(!original.fsName||original.fsName===BASE),'only the original NearScene PortalShader may be derived');
   await waitFor(sourceUniformsReady,'PortalShader controller');if(destroyed)return controller;
   check(typeof original.copyUniformsTo==='function','native linked uniform API required');
   if(typeof options.fluidEnabled==='boolean')fluidPolicy=options.fluidEnabled;else if(Tests?.useFluid)fluidPolicy=Boolean(Tests.useFluid());
   if(fluidPolicy===true)await waitFor(hasFluid,'original asynchronous MouseFluid');if(destroyed)return controller;
   texture=Utils3D.getTexture(source,{premultiplyAlpha:false});await Promise.race([Promise.resolve(texture.promise),canceled]);if(destroyed)return controller;textureLoaded=true;
   const stages=deriveStages(stage(Shaders,'vs'),stage(Shaders,'fs'));
   for(const[type,code]of[['vs',stages.vertex],['fs',stages.fragment]]){const key=NAME+'.'+type;check(Shaders[key]===undefined||Shaders[key]===code,'derived shader registry collision');Shaders[key]=code;}
   const params={customCompile:NAME,precision:original.precision||'high',tNearTheatre:{value:texture,ignoreUIL:true},uNearTheatreSize:{value:new Vector2(...uvSize),ignoreUIL:true},uNearTheatreWarp:{value:nativeWarp,ignoreUIL:true},uNearTheatreFluidBound:{value:0,ignoreUIL:true}};
   for(const key of['defines','receiveLight','receiveShadow'])if(original[key]!==undefined)params[key]=original[key];
   derived=new Shader(NAME,NAME,params,original.onBeforeBuild);original.copyUniformsTo(derived,true);
   for(const key of STATES)if(original[key]!==undefined)derived[key]=original[key];
   // The new program is owned by this controller even when its source persists.
   derived.persists=false;syncUniforms();check(mesh.shader===original,'portal material changed during asynchronous readiness');
   derived.mesh=mesh;refresh(derived);installed=true;return controller;
  })().catch(reason=>{error=String(reason?.message||reason);destroy();return controller;});
  return controller;
 }
 function apply(scene,context,options){return mount(scene,context,options).ready;}
 global.NotturnoNearTheatre=Object.freeze({version:VERSION,apply,mount,deriveStages,portalStages:deriveStages,maskStages,shaderName:NAME,defaultNativeWarp:.018,maximumNativeWarp:.022,defaultTheatreUvSize:Object.freeze([.72,.72/(2444/1050)]),defaultImage:'assets/product-gate-v3/theatre-source.png'});
})(globalThis);
