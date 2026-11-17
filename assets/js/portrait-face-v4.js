/* Opt-in Wander portrait material. Original shaders, geometry and controllers are retained. */
(function (global) {
  'use strict';
  const VERSION = '4.0.0';
  if (global.NotturnoPortraitFace?.version === VERSION) return;
  const NAMES = Object.freeze({ source: 'FloatingFrameBaseShader', derived: 'WanderPortraitFaceV4' });
  const DEFAULTS = Object.freeze({ hatchReduction: .4, edgeReduction: .4 });
  const REGION = Object.freeze({ atlasSize: 1024, left: 140, top: 120, right: 370, bottom: 365, feather: 18 });
  const STATE_KEYS = [
    'side', 'blending', 'colorMask', 'polygonOffset', 'polygonOffsetFactor',
    'polygonOffsetUnits', 'depthTest', 'depthWrite', 'depthFunc', 'stencilTest',
    'stencilMask', 'stencilFunc', 'stencilOp', 'wireframe', 'transparent',
    'visible', 'persists', 'precision', 'receiveLight', 'receiveShadow', '_parentnuke'
  ];
  const instances = new WeakMap();
  function assert(value, message) {
    if (!value) throw new Error('NotturnoPortraitFace: ' + message);
  }
  function strength(value) {
    assert(typeof value === 'number' && Number.isFinite(value), 'reduction must be finite');
    return Math.max(0, Math.min(.5, value));
  }
  function stage(Shaders, name, type) {
    const key = name + '.' + type;
    const code = typeof Shaders.getShader === 'function' ? Shaders.getShader(key) : Shaders[key];
    assert(typeof code === 'string' && code.includes('void main'), 'original stage is not ready: ' + key);
    return code;
  }
  function afterOnce(source, anchor, addition) {
    assert(source.split(anchor).length === 2, 'unexpected original fragment contract: ' + anchor);
    return source.replace(anchor, anchor + addition);
  }
  function softenedFragment(source) {
    const main = /void\s+main\s*\(\s*\)\s*\{/g;
    const matches = [...source.matchAll(main)];
    assert(matches.length === 1, 'expected exactly one fragment main');
    const declarations = `
// PORTRAIT_FACE_V4_DECLARATIONS_BEGIN
uniform float uPortraitFaceHatchReduction;
uniform float uPortraitFaceEdgeReduction;
float portraitFaceRegionV4(vec2 atlasUv) {
    // Atlas artwork uses top-left pixels; native uv2 is bottom-left normalized.
    vec2 px = vec2(atlasUv.x, 1.0 - atlasUv.y) * 1024.0;
    float region = smoothstep(140.0, 158.0, px.x);
    region *= 1.0 - smoothstep(352.0, 370.0, px.x);
    region *= smoothstep(120.0, 138.0, px.y);
    region *= 1.0 - smoothstep(347.0, 365.0, px.y);
    return region;
}
// PORTRAIT_FACE_V4_DECLARATIONS_END
`;
    const face = `
// PORTRAIT_FACE_V4_REGION_BEGIN
    float portraitFaceMaskV4 = portraitFaceRegionV4(vUv2);
    portraitFaceMaskV4 *= 1.0 - clamp(vBackgroundMask, 0.0, 1.0);
    portraitFaceMaskV4 *= 1.0 - clamp(vEyeMask, 0.0, 1.0);
    portraitFaceMaskV4 *= 1.0 - clamp(vIrisMask, 0.0, 1.0);
// PORTRAIT_FACE_V4_REGION_END
`;
    let code = source.slice(0, matches[0].index) + declarations + source.slice(matches[0].index);
    code = code.replace(main, match => match + face);
    code = afterOnce(code, 'maskedLines = aastep(0.01, maskedLines);', `
// PORTRAIT_FACE_V4_HATCH_BEGIN
    maskedLines = mix(maskedLines, 1.0, portraitFaceMaskV4 * clamp(uPortraitFaceHatchReduction, 0.0, 0.5));
// PORTRAIT_FACE_V4_HATCH_END
`);
    return afterOnce(code, 'fresnel = aastep(0.01, fresnel + noise * 0.01);', `
// PORTRAIT_FACE_V4_EDGE_BEGIN
    fresnel = mix(fresnel, 1.0, portraitFaceMaskV4 * clamp(uPortraitFaceEdgeReduction, 0.0, 0.5));
// PORTRAIT_FACE_V4_EDGE_END
`);
  }
  function register(Shaders) {
    const vs = stage(Shaders, NAMES.source, 'vs');
    const fs = softenedFragment(stage(Shaders, NAMES.source, 'fs'));
    for (const [type, code] of [['vs', vs], ['fs', fs]]) {
      const key = NAMES.derived + '.' + type;
      if (Shaders[key] !== undefined) assert(Shaders[key] === code, 'derived stage name collision: ' + key);
      Shaders[key] = code;
    }
  }
  async function applyToMesh(mesh, context) {
    const { Shader, Shaders } = context || {};
    assert(typeof Shader === 'function' && Shaders, 'native Shader and Shaders context required');
    if (typeof Shaders.ready === 'function') await Shaders.ready();
    const original = mesh?.shader;
    assert(original?.vsName === NAMES.source && original.fsName === NAMES.source,
      'only an explicitly selected FloatingFrameBaseShader portrait is supported');
    assert(mesh.geometry?.attributes?.uv2, 'original portrait uv2 is required');
    assert(typeof original.copyUniformsTo === 'function', 'native copyUniformsTo is required');
    for (const key of ['tAtlas', 'tTrim', 'tLines', 'tNoise', 'uTransition', 'uHover', 'uPoint1', 'uPoint2', 'uPoint3', 'uPoint4', 'uCenter']) {
      assert(original.uniforms?.[key] !== undefined, 'call after FloatingFrame initializes: ' + key);
    }
    register(Shaders);
    const params = {
      customCompile: 'PortraitFaceV4/' + (original.customCompile || ''),
      precision: original.precision || 'high',
      uPortraitFaceHatchReduction: { value: strength(context.hatchReduction ?? DEFAULTS.hatchReduction), ignoreUIL: true },
      uPortraitFaceEdgeReduction: { value: strength(context.edgeReduction ?? DEFAULTS.edgeReduction), ignoreUIL: true }
    };
    // Preprocessing must see the same defines/lighting flags, not receive them late.
    for (const key of ['defines', 'receiveLight', 'receiveShadow']) if (original[key] !== undefined) params[key] = original[key];
    const shader = new Shader(NAMES.derived, NAMES.derived, params, original.onBeforeBuild);
    // Hover closure and Story callbacks retain their original live uniform objects.
    original.copyUniformsTo(shader, true);
    for (const key of STATE_KEYS) if (original[key] !== undefined) shader[key] = original[key];
    shader.mesh = mesh;
    mesh.shader = shader;
    // Native Mesh.shader only assigns _shader; its previous VAO can otherwise
    // retain locations from the old program. The public geometry setter resets
    // geomInit without replacing geometry/data, then native upload binds the new VAO.
    mesh.geometry = mesh.geometry;
    mesh.upload?.();
    // No original material/controller is destroyed, and no global scene is scanned.
    return Object.freeze({
      version: VERSION, mesh, original, shader,
      setStrength(values = {}) {
        if (values.hatchReduction !== undefined) shader.uniforms.uPortraitFaceHatchReduction.value = strength(values.hatchReduction);
        if (values.edgeReduction !== undefined) shader.uniforms.uPortraitFaceEdgeReduction.value = strength(values.edgeReduction);
      },
      stats() {
        return { version: VERSION, source: NAMES.source, derived: NAMES.derived,
          hatchReduction: shader.uniforms.uPortraitFaceHatchReduction.value,
          edgeReduction: shader.uniforms.uPortraitFaceEdgeReduction.value,
          atlasLinked: shader.uniforms.tAtlas === original.uniforms.tAtlas,
          transitionLinked: shader.uniforms.uTransition === original.uniforms.uTransition };
      }
    });
  }
  function apply(mesh, context) {
    assert(mesh && typeof mesh === 'object', 'portrait mesh is required');
    if (instances.has(mesh)) return instances.get(mesh);
    const pending = applyToMesh(mesh, context).catch(error => { instances.delete(mesh); throw error; });
    instances.set(mesh, pending);
    return pending;
  }
  global.NotturnoPortraitFace = Object.freeze({ version: VERSION, apply, defaults: DEFAULTS, region: REGION, shaderNames: NAMES });
})(globalThis);
