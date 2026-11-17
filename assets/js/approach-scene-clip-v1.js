/* Approach-only scene clipping. Original shader stages and resources stay intact. */
(function (global) {
  'use strict';
  const VERSION = '1.0.1';
  if (global.NotturnoApproachClip?.version === VERSION) return;

  const NAMES = Object.freeze({
    front: { source: 'StaticCharacterBaseShader', derived: 'ApproachCharacterSceneClipV1' },
    inverse: { source: 'StaticCharacterBaseShaderInverse', derived: 'ApproachCharacterInverseSceneClipV1' }
  });
  const STATE_KEYS = [
    'side', 'blending', 'colorMask', 'polygonOffset', 'polygonOffsetFactor',
    'polygonOffsetUnits', 'depthTest', 'depthWrite', 'depthFunc', 'stencilTest',
    'stencilMask', 'stencilFunc', 'stencilOp', 'wireframe', 'transparent',
    'visible', 'persists', 'precision', 'receiveLight', 'receiveShadow', '_parentnuke'
  ];
  const instances = new WeakMap();

  function assert(value, message) {
    if (!value) throw new Error('NotturnoApproachClip: ' + message);
  }

  function getStage(Shaders, name, type) {
    const key = name + '.' + type;
    const code = typeof Shaders.getShader === 'function' ? Shaders.getShader(key) : Shaders[key];
    assert(typeof code === 'string' && code.includes('void main'), 'original stage is not ready: ' + key);
    return code;
  }

  function clippedFragment(source) {
    const main = /void\s+main\s*\(\s*\)\s*\{/g;
    const matches = [...source.matchAll(main)];
    assert(matches.length === 1, 'expected exactly one original fragment main');
    const start = matches[0].index;
    let declarations = '\n// APPROACH_CLIP_DECLARATIONS_V1_BEGIN\n';
    if (!/uniform\s+float\s+uDiscardBottom\s*;/.test(source)) declarations += 'uniform float uDiscardBottom;\n';
    if (!/uniform\s+float\s+uDiscardTop\s*;/.test(source)) declarations += 'uniform float uDiscardTop;\n';
    declarations += '// APPROACH_CLIP_DECLARATIONS_V1_END\n';
    const test = '\n// APPROACH_CLIP_TEST_V1_BEGIN\n' +
      '    float approachScenePixelHeight = 1.0 - gl_FragCoord.y / resolution.y;\n' +
      '    if (approachScenePixelHeight < uDiscardBottom || approachScenePixelHeight > uDiscardTop) discard;\n' +
      '// APPROACH_CLIP_TEST_V1_END\n';
    return source.slice(0, start) + declarations +
      source.slice(start).replace(main, match => match + test);
  }

  function register(Shaders, kind) {
    const names = NAMES[kind];
    assert(names, 'unknown material kind: ' + kind);
    const originalVertex = getStage(Shaders, names.source, 'vs');
    const originalFragment = getStage(Shaders, names.source, 'fs');
    const vertexKey = names.derived + '.vs';
    const fragmentKey = names.derived + '.fs';
    const fragment = clippedFragment(originalFragment);
    if (Shaders[vertexKey] !== undefined) assert(Shaders[vertexKey] === originalVertex, 'derived vertex name collision');
    if (Shaders[fragmentKey] !== undefined) assert(Shaders[fragmentKey] === fragment, 'derived fragment name collision');
    Shaders[vertexKey] = originalVertex;
    Shaders[fragmentKey] = fragment;
    return names;
  }

  function controllerReady(shader) {
    const u = shader?.uniforms;
    return Boolean(u && ['uDiscardBottom', 'uDiscardTop', 'tAtlas', 'tTrim',
      'uWindAxisAngle', 'uWindParams', 'uBreathe', 'uBend'].every(key => u[key] !== undefined));
  }

  function createClippedShader(original, kind, context) {
    const { Shader, Shaders } = context || {};
    assert(typeof Shader === 'function' && Shaders, 'native Shader and Shaders context required');
    assert(original?.uniforms && typeof original.copyUniformsTo === 'function', 'native original shader required');
    const names = register(Shaders, kind);
    assert(original.vsName === names.source && original.fsName === names.source,
      'refusing an unexpected original material: ' + original.vsName + '/' + original.fsName);
    const shader = new Shader(names.derived, { customCompile: 'ApproachSceneClipV1' });
    // Linked objects retain original textures, animations and controller updates.
    original.copyUniformsTo(shader, true);
    for (const key of STATE_KEYS) if (original[key] !== undefined) shader[key] = original[key];
    return shader;
  }

  async function applyToScene(scene, context) {
    const { Shaders } = context || {};
    assert(scene?.fragName === 'ApproachScene', 'apply is restricted to ApproachScene');
    assert(Shaders, 'native Shaders context required');
    if (typeof Shaders.ready === 'function') await Shaders.ready();
    const character = scene.layers?.character;
    const inverse = character?.inverseMesh;
    assert(character?.shader && inverse?.shader,
      'call after ApproachScene.init assigns character.inverseMesh');
    const originalFront = character.shader;
    const originalInverse = inverse.shader;
    if (!controllerReady(originalFront)) {
      assert(typeof scene.wait === 'function', 'front controller is not ready and native scene.wait is unavailable');
      await scene.wait(() => controllerReady(originalFront));
    }
    assert(controllerReady(originalFront), 'original front material controller did not initialize');
    assert(originalInverse.uniforms?.uWindAxisAngle && originalInverse.uniforms?.uBreathe,
      'original inverse material has not received its original animation uniforms');

    const front = createClippedShader(originalFront, 'front', context);
    const outline = createClippedShader(originalInverse, 'inverse', context);
    // Original copyUniformsTo(inverse) copied scalar values, not their objects.
    // Link both passes to the live front-controller clipping range explicitly.
    outline.uniforms.uDiscardBottom = front.uniforms.uDiscardBottom;
    outline.uniforms.uDiscardTop = front.uniforms.uDiscardTop;
    front.mesh = character;
    outline.mesh = inverse;
    character.shader = front;
    inverse.shader = outline;
    // Native Mesh.shader does not invalidate the previous program's VAO.
    // Reassign the same geometry through its public setter, then let native
    // upload bind each new program. Geometry objects and CPU arrays stay intact.
    for (const mesh of [character, inverse]) {
      mesh.geometry = mesh.geometry;
      mesh.upload?.();
    }

    // Keep the original controller alive; its Story/scrollY binding updates the
    // linked range. Mesh.shader assignment does not destroy that controller.
    const controller = {
      version: VERSION,
      character,
      inverse,
      originalFront,
      originalInverse,
      front,
      outline,
      stats() {
        return {
          version: VERSION,
          scene: scene.fragName,
          front: front.vsName,
          outline: outline.vsName,
          linkedBottom: front.uniforms.uDiscardBottom === originalFront.uniforms.uDiscardBottom &&
            outline.uniforms.uDiscardBottom === originalFront.uniforms.uDiscardBottom,
          linkedTop: front.uniforms.uDiscardTop === originalFront.uniforms.uDiscardTop &&
            outline.uniforms.uDiscardTop === originalFront.uniforms.uDiscardTop,
          bottom: front.uniforms.uDiscardBottom.value,
          top: front.uniforms.uDiscardTop.value
        };
      }
    };
    return controller;
  }

  function apply(scene, context) {
    if (instances.has(scene)) return instances.get(scene);
    const pending = applyToScene(scene, context).catch(error => {
      instances.delete(scene);
      throw error;
    });
    instances.set(scene, pending);
    return pending;
  }

  global.NotturnoApproachClip = Object.freeze({
    version: VERSION,
    apply,
    createClippedShader,
    shaderNames: NAMES
  });
})(globalThis);
