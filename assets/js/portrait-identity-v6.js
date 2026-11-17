/* Approved identity painted on a fitted 3D hood-removal head. No screen/DOM overlay. */
(function(global){
 'use strict';
 const VERSION='6.0.0',NAMES={source:'WanderPortraitFaceV4',derived:'WanderPortraitIdentityV6'},instances=new WeakMap();
 const STATE=['side','blending','colorMask','polygonOffset','polygonOffsetFactor','polygonOffsetUnits','depthTest','depthWrite','depthFunc','stencilTest','stencilMask','stencilFunc','stencilOp','wireframe','transparent','visible','persists','precision','receiveLight','receiveShadow','_parentnuke'];
 function check(value,message){if(!value)throw Error('PortraitIdentityV6: '+message);}
 function stage(Shaders,type){const key=NAMES.source+'.'+type;const code=Shaders.getShader?Shaders.getShader(key):Shaders[key];check(typeof code==='string'&&code.includes('void main'),'base stage unavailable '+key);return code;}
 function insertMain(code,decl,body){const re=/void\s+main\s*\(\s*\)\s*\{/g;check([...code.matchAll(re)].length===1,'one main expected');return decl+'\n'+code.replace(re,x=>x+'\n'+body+'\n');}
 function register(Shaders){
  const vs=insertMain(stage(Shaders,'vs'),'attribute vec3 portraitQ;\nattribute float portraitWeight;\nvarying vec3 vPortraitQ;\nvarying float vPortraitWeight;','vPortraitQ=portraitQ;\nvPortraitWeight=portraitWeight;');
  let fs=insertMain(stage(Shaders,'fs'),'uniform sampler2D tPortraitPaint;\nuniform float uPortraitStrength;\nvarying vec3 vPortraitQ;\nvarying float vPortraitWeight;','');
  const anchor='color = max(vec3(18.0 / 255.0), color);';check(fs.split(anchor).length===2,'base final color anchor');
  fs=fs.replace(anchor,anchor+`
    // This UV is attached to the reconstructed vertices, not gl_FragCoord.
    vec2 identityUv = vPortraitQ.xy / max(vPortraitQ.z, 0.000001);
    vec3 identityInk = texture2D(tPortraitPaint, identityUv).rgb;
    float identityWeight = clamp(vPortraitWeight * uPortraitStrength, 0.0, 1.0);
    identityWeight *= float(gl_FrontFacing);
    color = mix(color, identityInk * outline, identityWeight);
`);
  for(const[type,code]of[['vs',vs],['fs',fs]]){const key=NAMES.derived+'.'+type;if(Shaders[key]!==undefined)check(Shaders[key]===code,'stage name collision');Shaders[key]=code;}
  return NAMES;
 }
 async function mount(mesh,ctx,options){
  const{Shader,Shaders,Geometry,GeometryAttribute,Utils3D}=ctx||{};
  check([Shader,Geometry,GeometryAttribute].every(x=>typeof x==='function')&&Shaders&&Utils3D?.getTexture,'native classes required');
  if(Shaders.ready)await Shaders.ready();
  const original=mesh?.shader;check(original?.vsName===NAMES.source&&original.fsName===NAMES.source,'select the explicitly prepared hood2 portrait');
  check(typeof original.copyUniformsTo==='function','native linked uniforms required');
  const sourceGeometry=mesh.geometry;
  check(sourceGeometry.attributes.position.count===7456,'hood2 vertex count');
  const assetUrl=options.assetUrl||'assets/persona/portrait-identity-v6.json';
  const response=await global.fetch(assetUrl);check(response.ok,'identity geometry asset missing');
  const asset=await response.json();check(asset.version===6&&asset.sourceVertexCount===7456,'identity asset contract');
  const g=asset.geometry;check(g&&Array.isArray(g.position)&&g.position.length%3===0,'position array');
  const count=g.position.length/3,newGeometry=new Geometry;
  const sizes={position:3,normal:3,uv:2,uv2:2,colorid:1,portraitQ:3,portraitWeight:1};
  for(const[name,size]of Object.entries(sizes)){
   check(Array.isArray(g[name])&&g[name].length===count*size&&g[name].every(Number.isFinite),'attribute '+name);
   const a=new GeometryAttribute(new Float32Array(g[name]),size);a.destroyDataAfterUpload=false;newGeometry.addAttribute(name,a);
  }
  check(Array.isArray(g.index)&&g.index.length%3===0&&g.index.every(x=>Number.isInteger(x)&&x>=0&&x<count),'triangle indices');
  newGeometry.setIndex(new Uint32Array(g.index));newGeometry._src=assetUrl;
  newGeometry.computeBoundingBox?.();newGeometry.computeBoundingSphere?.();
  register(Shaders);
  const texture=Utils3D.getTexture(options.paintUrl||asset.paintUrl||'assets/persona/portrait-identity-v6.png',{premultiplyAlpha:false});
  if(texture.promise)await texture.promise;
  const params={customCompile:'PortraitIdentityV6',precision:original.precision||'high',tPortraitPaint:{value:texture,ignoreUIL:true},uPortraitStrength:{value:1,ignoreUIL:true}};
  for(const key of['defines','receiveLight','receiveShadow'])if(original[key]!==undefined)params[key]=original[key];
  const shader=new Shader(NAMES.derived,NAMES.derived,params,original.onBeforeBuild);
  original.copyUniformsTo(shader,true);for(const key of STATE)if(original[key]!==undefined)shader[key]=original[key];
  shader.mesh=mesh;mesh.shader=shader;mesh.geometry=newGeometry;mesh.upload?.();
  return Object.freeze({version:VERSION,mesh,shader,original,sourceGeometry,geometry:newGeometry,
   stats(){return{version:VERSION,vertices:count,triangles:g.index.length/3,paintedVertices:g.portraitWeight.filter(x=>x>0).length,sourceGeometryRetained:true,windowGeometryUntouched:true};}
  });
 }
 function apply(mesh,context,options={}){check(mesh&&typeof mesh==='object','mesh required');if(instances.has(mesh))return instances.get(mesh);const p=mount(mesh,context,options).catch(e=>{instances.delete(mesh);throw e;});instances.set(mesh,p);return p;}
 global.NotturnoPortraitIdentityV6=Object.freeze({version:VERSION,apply,register,shaderNames:Object.freeze(NAMES)});
})(globalThis);
