/* Wander-only native WebGL tool tumbleweeds. No DOM, timers or global render loop. */
(function (global) {
  'use strict';
  const VERSION = '1.0.0';
  const SHADER = 'WanderToolWindV1';
  const IDS = ['claude-code', 'codex', 'python', 'typescript', 'nextjs', 'fastapi', 'figma', 'grok-bot', 'pi-agent', 'deepseek-harness'];
  const DEFAULT_LOGOS = IDS.map(id => ({ id, src: 'assets/tool-logos/' + id + '.png', aspect: 1 }));
  const instances = new WeakMap();
  const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
  const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
  const VS = [
    'varying vec2 vToolUv;',
    'varying float vToolNdcHeight;',
    'void main() {',
    '  vToolUv = uv;',
    '  vec4 clip = projectionMatrix * modelViewMatrix * vec4(position, 1.0);',
    '  vToolNdcHeight = 1.0 - (clip.y / clip.w * 0.5 + 0.5);',
    '  gl_Position = clip;',
    '}'
  ].join('\n');
  const FS = [
    'uniform sampler2D tToolLogo;',
    'uniform vec3 uToolInk;',
    'uniform float uToolOpacity;',
    'uniform float uToolClipBottom;',
    'uniform float uToolClipTop;',
    'varying vec2 vToolUv;',
    'varying float vToolNdcHeight;',
    'void main() {',
    '  if (vToolNdcHeight < uToolClipBottom || vToolNdcHeight > uToolClipTop) discard;',
    '  float alpha = texture2D(tToolLogo, vToolUv).a * uToolOpacity;',
    '  if (alpha < 0.015) discard;',
    '  gl_FragColor = vec4(uToolInk, alpha);',
    '}'
  ].join('\n');

  function number(value, fallback) { return Number.isFinite(Number(value)) ? Number(value) : fallback; }
  function sync(scene, key, fallback) { try { return number(scene.getSync?.(key), fallback); } catch (_) { return fallback; } }
  function describeAssets(input) {
    const logos = Array.isArray(input) ? input : input?.logos;
    return (logos?.length ? logos : DEFAULT_LOGOS).slice(0, 10).map((logo, i) => {
      if (typeof logo === 'string') logo = { src: logo };
      if (!logo?.src || typeof logo.src !== 'string') throw new TypeError('Tool logo requires a local src');
      return { id: logo.id || IDS[i] || 'tool-' + i, src: logo.src, aspect: clamp(number(logo.aspect, 1), .45, 2.2) };
    });
  }

  /**
   * mount(scene, {Mesh, PlaneGeometry, Group, Shader, Shaders, Utils3D,
   *                Color, Global, Stage}, {logos?, ink?, maxVisible?})
   * Call after Wander init has assigned heightWorld and added its original meshes.
   * Drive controller.update(Render.DELTA) from the existing Wander loop; DELTA is ms.
   */
  function mount(scene, context, options) {
    if (!scene?.group?.add) throw new TypeError('Wander scene.group is required');
    if (instances.has(scene)) return instances.get(scene);
    options = options || {};
    context = context || {};
    const { Mesh, PlaneGeometry, Group, Shader, Shaders, Utils3D, Color } = context;
    if (![Mesh, PlaneGeometry, Group, Shader, Color].every(x => typeof x === 'function') || !Shaders || !Utils3D?.getTexture) {
      throw new TypeError('Native Mesh/PlaneGeometry/Group/Shader/Shaders/Utils3D/Color context is required');
    }
    // This registers a new shader name; retained source shaders are untouched.
    Shaders[SHADER + '.vs'] = VS;
    Shaders[SHADER + '.fs'] = FS;
    const logos = describeAssets(options.logos);
    const maxVisible = clamp(Math.floor(number(options.maxVisible, 3)), 2, 4);
    const group = new Group();
    group.name = 'wander-tool-wind-v1';
    group.visible = false;
    scene.group.add(group);
    const items = [], textures = [];
    let destroyed = false, ready = false, running = true, clock = 0, nextLaunch = 7.6, cursor = 0;
    let dimensions = null;
    const mobileQuery = global.matchMedia?.('(prefers-reduced-motion: reduce)');

    function camera() {
      const candidate = options.getCamera?.() || context.Global?.CAMERA?.camera || context.Global?.CAMERA?.worldCamera || scene.parentCamera?.camera || scene.parentCamera?.worldCamera;
      return candidate?.camera || candidate;
    }
    function measure() {
      const cam = camera(), stage = context.Stage || global.Stage;
      const pixelHeight = Math.max(1, number(stage?.height, global.innerHeight || 900));
      const aspect = number(cam?.aspect, number(stage?.width, global.innerWidth || 1440) / pixelHeight);
      const screenHeight = Math.max(.1, sync(scene, 'Story/screenHeightWorld', 6));
      const height = Math.max(screenHeight, number(scene.heightWorld, screenHeight * 2.5));
      const cameraZ = number(cam?.position?.z, 8);
      function atDepth(z) {
        let h = screenHeight;
        if (cam && Utils3D.getHeightFromCamera) h = number(Utils3D.getHeightFromCamera(cam, Math.max(.2, cameraZ - z)), screenHeight);
        return { height: Math.max(.1, h), width: Math.max(.1, h * aspect) };
      }
      return { screenHeight, height, pixelHeight, aspect, atDepth };
    }
    function configure(item) {
      // PNGs include a 24px transparent inset; ink stays about 20–30 / 36–60px.
      const m = dimensions, plane = m.atDepth(item.z), px = item.far ? 26 + item.seed * 9 : 46 + item.seed * 24;
      item.size = px / m.pixelHeight * plane.height;
      item.left = -.5 * plane.width - item.size * 1.5;
      item.right = .5 * plane.width + item.size * 1.5;
      item.span = item.right - item.left;
      item.baseSpeed = item.span / item.duration;
      item.floor = -.5 * m.height + .048 * m.screenHeight + item.size * .5;
      item.mesh.scale.set(item.size * item.logo.aspect, item.size, 1);
    }
    function startItem(progress) {
      let selected = null;
      for (let n = 0; n < items.length; n++) {
        const item = items[cursor++ % items.length];
        if (item.loaded && !item.active) { selected = item; break; }
      }
      if (!selected) return;
      selected.active = true;
      selected.distance = selected.span * clamp(progress || 0, 0, 1);
      selected.angle = -selected.distance / Math.max(.01, selected.size * 2.6) + selected.phase;
      selected.mesh.visible = true;
      pose(selected);
    }
    function opacityAt(item, x) {
      const edge = smooth(0, .06, item.distance / item.span) * (1 - smooth(.94, 1, item.distance / item.span));
      // Tools pass along the ground and through the two side spaces. Close to
      // the central feet they recede, preserving the original walking figure.
      const keepFigureClear = .28 + .72 * smooth(.035, .14, Math.abs(x) / dimensions.atDepth(item.z).width);
      return edge * keepFigureClear * (item.far ? .65 : .88);
    }
    function pose(item) {
      const x = item.left + item.distance;
      const hop = Math.sin(item.angle * .62 + item.phase) ** 2;
      item.mesh.position.set(x, item.floor + item.size * .065 * hop, item.z + .025 * item.size * Math.sin(clock * .41 + item.phase));
      item.mesh.rotation.set(.035 * Math.sin(clock * .53 + item.phase), .085 * Math.sin(clock * .31 + item.phase), item.angle + .035 * Math.sin(clock * .72 + item.phase));
      item.shader.uniforms.uToolOpacity.value = opacityAt(item, x);
    }
    function resize() {
      if (destroyed) return;
      dimensions = measure();
      for (const item of items) {
        const progress = item.span ? item.distance / item.span : 0;
        configure(item);
        item.distance = progress * item.span;
        if (item.active) pose(item);
      }
    }
    function visible() {
      return running && ready && scene.visible !== false && scene.group.visible !== false && scene.group.hidden !== true && !global.document?.hidden;
    }
    function update(deltaMs) {
      if (destroyed) return;
      group.visible = visible();
      if (!group.visible) return; // Hidden scenes do not accumulate elapsed time.
      const scrollY = sync(scene, 'Story/scrollY', 0), h = dimensions.screenHeight;
      const clipBottom = (number(scene.worldBottom, 0) + scrollY) / h;
      const clipTop = (number(scene.worldTop, dimensions.height) + scrollY) / h;
      for (const item of items) {
        item.shader.uniforms.uToolClipBottom.value = clipBottom;
        item.shader.uniforms.uToolClipTop.value = clipTop;
      }
      if (mobileQuery?.matches) { for (const item of items) if (item.active) pose(item); return; }
      const dt = clamp(number(deltaMs, 1000 / 60), 0, 50) / 1000;
      clock += dt;
      const gust = 1 + .105 * Math.sin(clock * .19) + .045 * Math.sin(clock * .071 + .8);
      for (const item of items) if (item.active) {
        const dx = item.baseSpeed * gust * (1 + .055 * Math.sin(clock * .29 + item.phase)) * dt;
        item.distance += dx;
        item.angle -= dx / Math.max(.01, item.size * 2.6);
        if (item.distance > item.span) { item.active = false; item.mesh.visible = false; item.shader.uniforms.uToolOpacity.value = 0; }
        else pose(item);
      }
      if (clock >= nextLaunch) {
        if (items.filter(x => x.active).length < maxVisible) startItem(0);
        nextLaunch = clock + 7.5 + 1.2 * Math.sin(clock * .113);
      }
      if (items.filter(x => x.active).length < Math.min(2, items.filter(x => x.loaded).length)) startItem(0);
    }
    function destroy() {
      if (destroyed) return;
      destroyed = true; group.visible = false;
      // Every mesh owns its own small quad/shader; the texture cache is refcounted.
      for (const item of items) item.mesh.destroy?.();
      for (const texture of textures) texture.destroy?.();
      group._parent?.remove?.(group);
      group.destroy?.();
      instances.delete(scene);
    }
    const controller = {
      version: VERSION, group, update, resize, destroy,
      setEnabled(value) { running = Boolean(value); if (!running) group.visible = false; },
      stats() { return { version: VERSION, ready, destroyed, visible: group.visible, elapsed: clock, active: items.filter(x => x.active).map(x => x.logo.id), loaded: items.filter(x => x.loaded).length, maxVisible, errors: items.filter(x => x.error).map(x => ({ id: x.logo.id, message: x.error })) }; }
    };
    instances.set(scene, controller);
    dimensions = measure();
    for (let i = 0; i < logos.length; i++) {
      const logo = logos[i], seed = ((i * 37 + 11) % 101) / 100, far = i % 3 !== 0;
      const geometry = new PlaneGeometry(1, 1), texture = Utils3D.getTexture(logo.src, { premultiplyAlpha: false });
      textures.push(texture);
      const shader = new Shader(SHADER, {
        tToolLogo: { value: texture }, uToolInk: { value: new Color(options.ink || '#171613') },
        uToolOpacity: { value: 0 }, uToolClipBottom: { value: -10 }, uToolClipTop: { value: 10 }
      });
      shader.transparent = true; shader.depthWrite = false; shader.depthTest = true; shader.side = Shader.DOUBLE_SIDE;
      const mesh = new Mesh(geometry, shader);
      mesh.name = 'tool-wind-' + logo.id; mesh.visible = false; mesh.frustumCulled = false;
      // No render-order override: original foreground paper panels retain depth.
      group.add(mesh);
      const item = { logo, mesh, shader, seed, far, z: far ? -3.1 - seed * .9 : -.35 + seed * .18, duration: 24 + seed * 12, phase: i * 2.399, active: false, loaded: false, distance: 0, angle: 0 };
      items.push(item); configure(item);
      item.promise = Promise.resolve(texture.promise).then(() => { if (!destroyed) { item.loaded = true; mesh.upload?.(); } }, error => { item.error = String(error?.message || error || 'texture load failed'); });
    }
    controller.ready = Promise.all(items.map(x => x.promise)).then(() => {
      if (destroyed) return controller;
      ready = true;
      startItem(.14); startItem(.48); if (maxVisible >= 3) startItem(.79);
      for (const item of items) if (item.active) pose(item);
      return controller;
    });
    return controller;
  }
  global.NotturnoToolWind = { version: VERSION, mount, defaultLogos: DEFAULT_LOGOS };
})(globalThis);
