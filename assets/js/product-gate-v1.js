/* Xiabian product entry, mounted only inside the retained native Approach scene. */
(function(global){
  'use strict';
  const VERSION='1.1.0',NAME='ApproachProductGateV1',instances=new WeakMap();
  if(global.NotturnoProductGate?.version===VERSION)return;
  const VS=`varying vec2 vProductUv;
uniform float uPaperTime;
uniform float uPaperStrength;
uniform float uPaperPhase;
void main(){
 vProductUv=uv;
 vec3 p=position;
 float edge=pow(clamp(position.y+0.5,0.0,1.0),2.0);
 p.z+=sin(position.y*4.0+uPaperTime*0.55+uPaperPhase)*0.028*edge*uPaperStrength;
 gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.0);
}`;
  const FS=`varying vec2 vProductUv;
uniform sampler2D tProductArt;
uniform float uProductOpacity;
uniform float uProductHover;
uniform float uSceneBottom;
uniform float uSceneTop;
void main(){
 float screenHeight=1.0-gl_FragCoord.y/resolution.y;
 if(screenHeight<uSceneBottom||screenHeight>uSceneTop)discard;
 vec4 art=texture2D(tProductArt,vProductUv);
 if(art.a<0.01)discard;
 art.rgb=mix(art.rgb,vec3(0.75,0.16,0.14),uProductHover*0.08);
 gl_FragColor=vec4(art.rgb,art.a*uProductOpacity);
}`;
  const HIT_FS='void main(){discard;}';
  const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
  function assert(x,message){if(!x)throw Error('NotturnoProductGate: '+message);}

  function mount(scene,context,options={}){
    if(instances.has(scene))return instances.get(scene);
    assert(scene?.fragName==='ApproachScene','only ApproachScene may own this entry');
    const{Mesh,PlaneGeometry,CircleGeometry,Group,Shader,Shaders,Utils3D,Vector3,Global,Stage,Interaction3D}=context||{};
    assert([Mesh,PlaneGeometry,CircleGeometry,Group,Shader,Vector3].every(x=>typeof x==='function'),'native mesh/geometry/shader/vector classes required');
    assert(Shaders&&Utils3D?.getTexture&&Global?.CAMERA&&Stage&&Interaction3D?.find,'native scene context required');
    assert(scene.sceneRoot?.add&&scene.layers?.portal?.add&&scene.layers?.steps,'mount after original Approach layers enter sceneRoot');
    const document=options.document||global.document;
    const uiRoot=scene.ui?.element?.div;
    assert(document?.createElement&&uiRoot?.appendChild,'ApproachUI root required; never fall back to a fixed global link');
    Shaders[NAME+'.vs']=VS;Shaders[NAME+'.fs']=FS;
    Shaders[NAME+'Hit.vs']='void main(){gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}';
    Shaders[NAME+'Hit.fs']=HIT_FS;
    const portal=scene.layers.portal,paperGroup=new Group,faceGroup=new Group;
    paperGroup.name='xiabian-workflow-papers';faceGroup.name='xiabian-gate-face';
    scene.sceneRoot.add(paperGroup);portal.add(faceGroup);
    // Original circle.bin is XZ. Its source Euler/scale align this XY face with
    // the exact existing circular opening and adjacent stone front.
    faceGroup.rotation.x=-Math.PI/2;faceGroup.position.y=.03;
    paperGroup.visible=faceGroup.visible=false;
    const uniforms={bottom:{value:2},top:{value:1}},meshes=[],textures=[],papers=[];
    const interaction=Interaction3D.find(Global.CAMERA.camera);
    const anchor=document.createElement('a');anchor.textContent='进入作品：虾蝙·剧本蒸馏';
    anchor.setAttribute('class','prevent_interaction3d');
    anchor.setAttribute('aria-label','进入虾蝙·剧本蒸馏，从视频素材到可用剧本（新窗口）');
    anchor.target='_blank';anchor.rel='noopener noreferrer';anchor.hidden=true;
    Object.assign(anchor.style,{position:'absolute',display:'none',pointerEvents:'auto',color:'transparent',background:'transparent',fontSize:'1px',lineHeight:'1',textDecoration:'none',cursor:'pointer',borderRadius:'2px',zIndex:'2'});
    uiRoot.appendChild(anchor);
    let destroyed=false,ready=false,clock=0,manifest=null,titleMesh=null,enterMesh=null,hitMesh=null,interactive=false,hover=0,hoverTarget=0,pendingAvoidance=true;
    const media=global.matchMedia?.('(prefers-reduced-motion: reduce)');
    const camera=()=>Global.CAMERA.camera||Global.CAMERA;
    function linkVisible(value){anchor.hidden=!value;anchor.style.display=value?'block':'none';}
    function setHover(value){hoverTarget=value?1:0;}
    const onFocus=()=>{anchor.style.outline='2px solid #c82924';anchor.style.outlineOffset='3px';setHover(true);};
    const onBlur=()=>{anchor.style.outline='';setHover(false);};
    const onEnter=()=>setHover(true),onLeave=()=>setHover(false);
    anchor.addEventListener('focus',onFocus);anchor.addEventListener('blur',onBlur);
    anchor.addEventListener('pointerenter',onEnter);anchor.addEventListener('pointerleave',onLeave);

    function makeArt(src,parent,name,paper=false){
      const texture=Utils3D.getTexture(src,{premultiplyAlpha:false});textures.push(texture);
      const shader=new Shader(NAME,{tProductArt:{value:texture},uProductOpacity:{value:1},uProductHover:{value:0},uSceneBottom:uniforms.bottom,uSceneTop:uniforms.top,uPaperTime:{value:0},uPaperStrength:{value:paper?1:0},uPaperPhase:{value:papers.length*1.37}});
      shader.transparent=true;shader.depthWrite=false;shader.depthTest=true;shader.side=Shader.DOUBLE_SIDE;
      // Shader construction may copy param records; bind these exact live range objects.
      shader.uniforms.uSceneBottom=uniforms.bottom;shader.uniforms.uSceneTop=uniforms.top;
      const mesh=new Mesh(new PlaneGeometry(1,1,paper?4:1,paper?5:1),shader);
      mesh.name=name;mesh.visible=false;mesh.frustumCulled=false;parent.add(mesh);meshes.push(mesh);
      mesh.productLoad=Promise.resolve(texture.promise).then(()=>{if(!destroyed)mesh.upload?.();});
      return mesh;
    }
    function openProduct(event){if(destroyed||!ready||!interactive||event?.mesh===enterMesh&&anchor.hidden)return;const open=options.open||global.open;assert(typeof open==='function','window.open unavailable');open.call(global,anchor.href,'_blank','noopener,noreferrer');}
    function hoverProduct(e){setHover(e.action==='over');}
    function range(){
      const h=Number(scene.getSync?.('Story/screenHeightWorld'));
      const y=Number(scene.getSync?.('Story/scrollY')||0);
      if(!(h>0)||!Number.isFinite(scene.worldBottom)||!Number.isFinite(scene.worldTop)){uniforms.bottom.value=2;uniforms.top.value=1;return false;}
      uniforms.bottom.value=(scene.worldBottom+y)/h;uniforms.top.value=(scene.worldTop+y)/h;return true;
    }
    function projected(local,mesh){return new Vector3(...local).applyMatrix4(mesh.matrixWorld).project(camera());}
    function box(mesh,half=0.5){
      const points=[[-half,-half,0],[half,-half,0],[half,half,0],[-half,half,0]].map(p=>projected(p,mesh));
      const xs=points.map(p=>(p.x*.5+.5)*Stage.width),ys=points.map(p=>(1-(p.y*.5+.5))*Stage.height);
      return{left:Math.min(...xs),right:Math.max(...xs),top:Math.min(...ys),bottom:Math.max(...ys)};
    }
    function avoidDoor(){
      scene.group?.updateMatrixWorld?.(true);
      // The original narrow-screen monolith partly leaves the viewport. Keep
      // the new lettering and equivalent link readable without moving that rock.
      for(const mesh of [titleMesh,enterMesh])for(let i=0;i<5;i++){
        const r=box(mesh),delta=r.right>Stage.width-8?Stage.width-8-r.right:r.left<8?8-r.left:0;
        if(Math.abs(delta)<.1)break;
        const a=(projected([0,0,0],mesh).x*.5+.5)*Stage.width;
        mesh.position.x+=1;scene.group?.updateMatrixWorld?.(true);
        const b=(projected([0,0,0],mesh).x*.5+.5)*Stage.width;
        mesh.position.x-=1;
        if(Math.abs(b-a)<1e-5)break;
        mesh.position.x+=delta/(b-a);scene.group?.updateMatrixWorld?.(true);
      }
      // Workflow stations are independently calibrated to real tread
      // intersections. Never shove several papers to one shared door edge.
      scene.group?.updateMatrixWorld?.(true);pendingAvoidance=false;
    }
    function updateLink(){
      if(!ready||destroyed||!scene.visible||!faceGroup.visible){linkVisible(false);interactive=false;if(hitMesh)hitMesh.visible=false;return;}
      scene.group?.updateMatrixWorld?.(true);
      const center=projected([0,0,0],faceGroup),cy=1-(center.y*.5+.5);
      interactive=center.z>=-1&&center.z<=1&&Math.abs(center.x)<1&&cy>=0&&cy<=1&&cy>=uniforms.bottom.value&&cy<=uniforms.top.value;
      hitMesh.visible=interactive;
      const corners=[[-.5,-.5,0],[.5,-.5,0],[.5,.5,0],[-.5,.5,0]].map(p=>projected(p,enterMesh));
      const xs=corners.map(p=>(p.x*.5+.5)*Stage.width),ys=corners.map(p=>(1-(p.y*.5+.5))*Stage.height);
      const left=Math.min(...xs),right=Math.max(...xs),top=Math.min(...ys),bottom=Math.max(...ys),height=(top+bottom)/2/Stage.height;
      const shown=interactive&&right>0&&left<Stage.width&&bottom>0&&top<Stage.height&&height>=uniforms.bottom.value&&height<=uniforms.top.value;
      linkVisible(shown);
      if(shown){const rect=uiRoot.getBoundingClientRect();Object.assign(anchor.style,{left:(left-rect.left)+'px',top:(top-rect.top)+'px',width:(right-left)+'px',height:(bottom-top)+'px'});}
    }
    function resize(){
      if(!ready||destroyed)return;
      const mobile=Stage.width/Stage.height<1,anchors=manifest.anchors[mobile?'mobile':'desktop'];
      const titleScale=mobile?clamp(Stage.width/480,.65,.9):1;
      titleMesh.position.set(...manifest.portal.titleLocal);titleMesh.scale.set(manifest.portal.titleSize[0]*titleScale,manifest.portal.titleSize[1]*titleScale,1);
      const cta=mobile?manifest.portal.enterMobile:manifest.portal.enterDesktop;
      enterMesh.position.set(...cta);enterMesh.scale.set(manifest.portal.enterSize[0],manifest.portal.enterSize[1],1);
      for(let i=0;i<papers.length;i++){
        const item=papers[i],a=anchors[i],height=a.width*600/480,pitch=-.45;
        item.base={x:a.point[0],y:a.point[1]+height*.5*Math.cos(pitch)+.035,z:a.point[2]-height*.5*Math.sin(-pitch),pitch,roll:(i%2?-.12:.10)};
        item.mesh.scale.set(a.width,height,1);item.mesh.position.set(item.base.x,item.base.y,item.base.z);item.mesh.rotation.set(pitch,0,item.base.roll);
      }
      pendingAvoidance=true;
      range();updateLink();
    }
    function update(deltaMs=16.7){
      if(destroyed||!ready)return;
      const visible=Boolean(scene.visible)&&!document.hidden&&range();
      faceGroup.visible=paperGroup.visible=visible;
      if(!visible){linkVisible(false);interactive=false;hitMesh.visible=false;return;}
      if(pendingAvoidance)avoidDoor();
      const dt=clamp(Number(deltaMs)||0,0,50)/1000;
      if(!media?.matches)clock+=dt;
      hover+=(hoverTarget-hover)*(1-Math.exp(-8*dt));
      for(const mesh of meshes){mesh.visible=true;mesh.shader.uniforms.uPaperTime.value=clock;mesh.shader.uniforms.uProductHover.value=mesh===enterMesh?hover:0;}
      for(let i=0;i<papers.length;i++){
        const item=papers[i],phase=i*1.37,motion=media?.matches?0:1;
        item.mesh.rotation.x=item.base.pitch+Math.sin(clock*.55+phase)*.025*motion;
        item.mesh.rotation.z=item.base.roll+Math.sin(clock*.7+phase)*.045*motion;
        item.mesh.position.y=item.base.y+Math.sin(clock*.61+phase)*.025*motion;
      }
      updateLink();
    }
    function destroy(){
      if(destroyed)return;destroyed=true;interactive=false;linkVisible(false);
      if(hitMesh)interaction.remove?.([hitMesh,enterMesh]);
      for(const[type,fn]of [['focus',onFocus],['blur',onBlur],['pointerenter',onEnter],['pointerleave',onLeave]])anchor.removeEventListener(type,fn);
      anchor.remove();
      for(const mesh of meshes)if(!mesh.deleted)mesh.destroy?.();
      if(hitMesh&&!hitMesh.deleted)hitMesh.destroy?.();
      for(const texture of textures)if(!texture.deleted)texture.destroy?.();
      for(const group of [faceGroup,paperGroup]){group._parent?.remove?.(group);if(!group.deleted)group.destroy?.();}
      instances.delete(scene);
    }
    const controller={version:VERSION,faceGroup,paperGroup,anchor,update,resize,destroy,
      stats(){return{version:VERSION,ready,destroyed,interactive,elapsed:clock,paperCount:papers.length,artMeshCount:meshes.length,href:anchor.href,domParentIsApproachUi:anchor.parentNode===uiRoot,sceneClip:[uniforms.bottom.value,uniforms.top.value]};}
    };
    instances.set(scene,controller);
    // Camera and UI scrolling are finalized by the original Story/update event.
    // This binding belongs to the scene and is released by its normal lifecycle.
    scene.listen?.('Story/update',()=>{if(ready&&!destroyed){range();updateLink();}});
    controller.ready=(async()=>{
      const source=options.manifest||await(async()=>{const response=await global.fetch(options.manifestUrl||'assets/product-gate/manifest-v2.json');assert(response.ok,'product manifest not found');return response.json();})();
      if(destroyed)return controller;
      manifest=source;assert(manifest.version===1&&manifest.papers.length===5,'unsupported manifest');
      const href=new URL(options.href||manifest.product.href,global.location?.href||'https://local.invalid/');
      assert(href.protocol==='http:'||href.protocol==='https:','product link must be HTTP(S)');anchor.href=href.href;
      titleMesh=makeArt(manifest.textures.title,faceGroup,'xiabian-product-title');titleMesh.position.set(...manifest.portal.titleLocal);titleMesh.scale.set(...manifest.portal.titleSize,1);
      const art=makeArt(manifest.textures.portal,faceGroup,'xiabian-curtain-script');art.position.z=.025;art.scale.set(...manifest.portal.artSize,1);
      enterMesh=makeArt(manifest.textures.enter,faceGroup,'xiabian-enter-work');
      for(const paper of manifest.papers){const mesh=makeArt(paper.src,paperGroup,'xiabian-step-'+paper.id,true);papers.push({mesh,label:paper.label});}
      const hitShader=new Shader(NAME+'Hit');hitShader.transparent=true;hitShader.depthWrite=false;hitShader.neverRender=true;
      hitMesh=new Mesh(new CircleGeometry(.98,48),hitShader);hitMesh.name='xiabian-circle-link';hitMesh.isHitMesh=true;hitMesh.position.z=.07;hitMesh.visible=false;faceGroup.add(hitMesh);
      interaction.add([hitMesh,enterMesh],hoverProduct,openProduct);
      await Promise.all(meshes.map(x=>x.productLoad));
      if(destroyed)return controller;
      ready=true;resize();update(0);return controller;
    })();
    return controller;
  }
  global.NotturnoProductGate=Object.freeze({version:VERSION,mount});
})(globalThis);
