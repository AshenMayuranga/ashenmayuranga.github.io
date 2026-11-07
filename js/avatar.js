import * as THREE from 'three';

export function initAvatar() {
  const canvas = document.querySelector('#avatar-canvas');
  const stage = document.querySelector('#avatar-stage');
  const fallback = document.querySelector('#avatar-fallback');
  const controls = document.querySelector('#avatar-controls');
  const waveButton = document.querySelector('#wave-button');
  const motionButton = document.querySelector('#motion-button');
  const status = document.querySelector('#avatar-status');
  const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'low-power' });
  } catch {
    return;
  }

  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.3;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(33, 1, 0.1, 30);
  camera.position.set(0, 2.25, 7.6);
  camera.lookAt(0, 1.55, 0);
  scene.add(new THREE.HemisphereLight(0xf8fff0, 0x9cae89, 3));
  const key = new THREE.DirectionalLight(0xfff5e6, 5);
  key.position.set(-3, 6, 5);
  scene.add(key);
  const fill = new THREE.DirectionalLight(0xbad8c2, 2);
  fill.position.set(4, 2, -2);
  scene.add(fill);

  const material = (color, roughness = 0.5, metalness = 0) => new THREE.MeshStandardMaterial({ color, roughness, metalness });
  const cream = material(0xf3f0df, 0.35);
  const green = material(0x245f47, 0.6);
  const dark = material(0x193a2d, 0.5);
  const silver = material(0xb8c6b5, 0.35, 0.35);
  const screen = material(0x152d26, 0.23);
  const light = new THREE.MeshStandardMaterial({ color: 0xbbe99a, emissive: 0x8cce69, emissiveIntensity: 0.45, roughness: 0.4 });

  function roundedBox(w, h, d, radius = 0.12) {
    radius = Math.min(radius, w / 2, h / 2, d / 2);
    const geometry = new THREE.BoxGeometry(w, h, d, 8, 8, 8);
    const positions = geometry.attributes.position;
    const point = new THREE.Vector3();
    const core = new THREE.Vector3();
    for (let index = 0; index < positions.count; index += 1) {
      point.fromBufferAttribute(positions, index);
      core.set(
        THREE.MathUtils.clamp(point.x, -w / 2 + radius, w / 2 - radius),
        THREE.MathUtils.clamp(point.y, -h / 2 + radius, h / 2 - radius),
        THREE.MathUtils.clamp(point.z, -d / 2 + radius, d / 2 - radius),
      );
      point.sub(core).normalize().multiplyScalar(radius).add(core);
      positions.setXYZ(index, point.x, point.y, point.z);
    }
    geometry.computeVertexNormals();
    return geometry;
  }

  function mesh(geometry, mat, parent, x = 0, y = 0, z = 0) {
    const object = new THREE.Mesh(geometry, mat);
    object.position.set(x, y, z);
    parent.add(object);
    return object;
  }
  function box(w, h, d, radius, mat, parent, x = 0, y = 0, z = 0) {
    return mesh(roundedBox(w, h, d, radius), mat, parent, x, y, z);
  }
  function sphere(radius, mat, parent, x, y, z) {
    return mesh(new THREE.SphereGeometry(radius, 24, 16), mat, parent, x, y, z);
  }

  // This companion is made from original geometry; no downloaded character model.
  const robot = new THREE.Group();
  robot.rotation.y = -0.12;
  scene.add(robot);

  const platform = mesh(new THREE.CylinderGeometry(1.17, 1.21, 0.12, 64), material(0xd6e0cb, 0.8), scene, 0, 0.03, 0);
  const rim = mesh(new THREE.TorusGeometry(1.16, 0.015, 8, 64), material(0xaebfa2), platform, 0, 0.07, 0);
  rim.rotation.x = Math.PI / 2;
  const shadow = mesh(new THREE.CircleGeometry(0.74, 48), new THREE.MeshBasicMaterial({ color: 0x294b31, transparent: true, opacity: 0.08, depthWrite: false }), scene, 0, 0.1, 0.03);
  shadow.rotation.x = -Math.PI / 2;
  shadow.scale.set(1, 0.65, 1);

  const leftLeg = new THREE.Group();
  leftLeg.position.set(-0.27, 0.61, 0);
  robot.add(leftLeg);
  const rightLeg = new THREE.Group();
  rightLeg.position.set(0.27, 0.61, 0);
  robot.add(rightLeg);
  for (const leg of [leftLeg, rightLeg]) {
    box(0.31, 0.61, 0.36, 0.11, dark, leg, 0, -0.07);
    box(0.41, 0.25, 0.6, 0.1, cream, leg, 0, -0.37, 0.1);
    box(0.43, 0.07, 0.61, 0.025, silver, leg, 0, -0.475, 0.1);
    box(0.19, 0.035, 0.025, 0.01, green, leg, 0, -0.32, 0.405);
  }
  const torso = new THREE.Group();
  torso.position.set(0, 1.32, 0);
  robot.add(torso);
  box(1.01, 1.04, 0.68, 0.22, green, torso);
  box(0.52, 0.38, 0.08, 0.08, dark, torso, 0, -0.17, 0.34);
  box(0.26, 0.035, 0.025, 0.01, light, torso, 0, -0.17, 0.395);
  box(0.033, 0.18, 0.025, 0.01, light, torso, 0, -0.17, 0.395);
  sphere(0.045, light, torso, 0.29, 0.26, 0.31);
  box(0.65, 0.67, 0.24, 0.1, dark, torso, 0, 0.04, -0.41);
  mesh(new THREE.CylinderGeometry(0.18, 0.2, 0.22, 24), silver, robot, 0, 1.92, 0);

  const head = new THREE.Group();
  head.position.set(0, 2.44, 0);
  robot.add(head);
  box(1.46, 1.16, 1.0, 0.27, cream, head);
  box(1.15, 0.69, 0.14, 0.16, screen, head, 0, -0.015, 0.485);
  const eyeGeometry = new THREE.CapsuleGeometry(0.055, 0.12, 5, 10);
  const leftEye = mesh(eyeGeometry, light, head, -0.24, 0.045, 0.575);
  const rightEye = mesh(eyeGeometry, light, head, 0.24, 0.045, 0.575);
  leftEye.scale.z = rightEye.scale.z = 0.5;
  const smileCurve = new THREE.QuadraticBezierCurve3(new THREE.Vector3(-0.13, -0.15, 0.577), new THREE.Vector3(0, -0.245, 0.597), new THREE.Vector3(0.13, -0.15, 0.577));
  mesh(new THREE.TubeGeometry(smileCurve, 18, 0.016, 6, false), light, head);
  for (const side of [-1, 1]) {
    const ear = mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.14, 24), silver, head, side * 0.76, -0.03, 0);
    ear.rotation.z = Math.PI / 2;
    sphere(0.08, green, head, side * 0.85, -0.03, 0);
  }
  mesh(new THREE.CylinderGeometry(0.025, 0.035, 0.2, 12), silver, head, 0, 0.64, 0);
  sphere(0.09, light, head, 0, 0.78, 0);

  function createArm(side) {
    const arm = new THREE.Group();
    arm.position.set(side * 0.64, 1.64, 0);
    robot.add(arm);
    sphere(0.18, dark, arm, 0, 0, 0);
    box(0.31, 0.54, 0.34, 0.13, green, arm, 0, -0.24);
    const forearm = new THREE.Group();
    forearm.position.y = -0.52;
    arm.add(forearm);
    sphere(0.125, silver, forearm, 0, 0, 0);
    box(0.27, 0.39, 0.29, 0.1, cream, forearm, 0, -0.18);
    const hand = box(0.32, 0.28, 0.2, 0.09, cream, forearm, 0, -0.46, 0.015);
    for (let index = 0; index < 3; index += 1) {
      box(0.042, 0.08, 0.035, 0.015, silver, hand, (index - 1) * 0.075, -0.095, 0.095);
    }
    arm.rotation.z = side * 0.12;
    return { arm, forearm };
  }
  const leftArm = createArm(-1);
  const rightArm = createArm(1);
  const pointer = new THREE.Vector2();
  const raycaster = new THREE.Raycaster();
  let trackingX = 0;
  let trackingY = 0;
  let paused = motionPreference.matches;
  let visible = true;
  let contextLost = false;
  let waveStart = -10;
  let reactionStart = -10;
  let frameId = 0;
  let statusTimer;
  let previousTime = performance.now();
  let elapsed = 0;
  const baseline = { headY: 2.44, torsoY: 1.32 };

  function render() { renderer.render(scene, camera); }
  function resize() {
    const { width, height } = stage.getBoundingClientRect();
    if (!width || !height) return;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
    render();
  }
  function announce(message) {
    clearTimeout(statusTimer);
    status.textContent = message;
    statusTimer = setTimeout(() => { status.textContent = paused ? 'Taking a little breather.' : 'Move your cursor. I’m following along.'; }, 3200);
  }
  function setMotionUI() {
    motionButton.setAttribute('aria-pressed', String(paused));
    motionButton.setAttribute('aria-label', paused ? 'Resume character animation' : 'Pause character animation');
    motionButton.firstElementChild.textContent = paused ? '▶' : 'Ⅱ';
    waveButton.disabled = paused;
    waveButton.title = paused ? 'Resume animation to say hello' : 'Wave to the character';
  }
  function resetPose() {
    head.position.y = baseline.headY;
    torso.position.y = baseline.torsoY;
    head.rotation.set(0, 0, 0);
    robot.position.y = 0;
    robot.rotation.y = -0.12;
    leftArm.arm.rotation.z = -0.12;
    rightArm.arm.rotation.z = 0.12;
    rightArm.forearm.rotation.z = 0;
    leftEye.scale.y = rightEye.scale.y = 1;
  }
  function tick(now) {
    frameId = 0;
    if (paused || !visible || document.hidden || contextLost) return;
    const dt = Math.min((now - previousTime) / 1000, 0.05);
    previousTime = now;
    elapsed += dt;
    const breathe = Math.sin(elapsed * 1.8) * 0.022;
    head.position.y = baseline.headY + breathe;
    torso.position.y = baseline.torsoY + breathe * 0.5;
    const smoothing = 1 - Math.exp(-dt * 5);
    head.rotation.y = THREE.MathUtils.lerp(head.rotation.y, trackingX * 0.32, smoothing);
    head.rotation.x = THREE.MathUtils.lerp(head.rotation.x, -trackingY * 0.15, smoothing);
    head.rotation.z = Math.sin(elapsed * 0.9) * 0.018;
    robot.rotation.y = THREE.MathUtils.lerp(robot.rotation.y, -0.12 + trackingX * 0.08, smoothing);
    const waveAge = elapsed - waveStart;
    const waving = waveAge < 2.4;
    const waveAmount = waving ? Math.min(waveAge * 4, 1, (2.4 - waveAge) * 4) : 0;
    rightArm.arm.rotation.z = 0.12 + waveAmount * (2.28 + Math.sin(waveAge * 11) * 0.22);
    rightArm.forearm.rotation.z = waveAmount * 0.25;
    leftArm.arm.rotation.z = -0.12 + Math.sin(elapsed * 1.4) * 0.025;
    const reactionAge = elapsed - reactionStart;
    robot.position.y = reactionAge < 0.8 ? Math.sin(reactionAge / 0.8 * Math.PI) * 0.16 : 0;
    const blinkPhase = elapsed % 4.7;
    const blink = blinkPhase > 4.5 ? Math.max(0.08, Math.abs((blinkPhase - 4.6) * 10)) : 1;
    leftEye.scale.y = rightEye.scale.y = blink;
    render();
    frameId = requestAnimationFrame(tick);
  }
  function startLoop() {
    if (frameId || paused || !visible || document.hidden || contextLost) return;
    previousTime = performance.now();
    frameId = requestAnimationFrame(tick);
  }
  function stopLoop() {
    cancelAnimationFrame(frameId);
    frameId = 0;
  }
  function setPaused(value) {
    paused = value;
    setMotionUI();
    if (paused) {
      stopLoop();
      resetPose();
      render();
    } else startLoop();
  }
  function wave() {
    if (paused) return;
    waveStart = elapsed;
    announce('Hey there! Thanks for stopping by.');
  }
  waveButton.addEventListener('click', wave);
  motionButton.addEventListener('click', () => {
    setPaused(!paused);
    announce(paused ? 'Animation paused.' : 'Back to building.');
  });
  motionPreference.addEventListener('change', (event) => {
    setPaused(event.matches);
    announce(event.matches ? 'Animation paused for reduced motion.' : 'Animation resumed.');
  });
  document.addEventListener('pointermove', (event) => {
    if (paused || !visible || event.pointerType === 'touch') return;
    const rect = stage.getBoundingClientRect();
    trackingX = THREE.MathUtils.clamp((event.clientX - rect.left - rect.width / 2) / (rect.width / 2), -1, 1);
    trackingY = THREE.MathUtils.clamp(-(event.clientY - rect.top - rect.height / 2) / (rect.height / 2), -1, 1);
  }, { passive: true });
  stage.addEventListener('pointerleave', () => { trackingX = 0; trackingY = 0; });
  canvas.addEventListener('click', (event) => {
    if (paused) return;
    const rect = canvas.getBoundingClientRect();
    pointer.set((event.clientX - rect.left) / rect.width * 2 - 1, -(event.clientY - rect.top) / rect.height * 2 + 1);
    raycaster.setFromCamera(pointer, camera);
    if (raycaster.intersectObject(robot, true).length) {
      reactionStart = elapsed;
      wave();
    }
  });
  canvas.addEventListener('webglcontextlost', (event) => {
    event.preventDefault();
    contextLost = true;
    stopLoop();
    canvas.hidden = true;
    fallback.hidden = false;
    controls.hidden = true;
    stage.classList.remove('is-interactive');
    status.textContent = 'Meet my little co-builder.';
    clearTimeout(statusTimer);
  });
  // Recover automatically if the browser restores GPU resources.
  canvas.addEventListener('webglcontextrestored', () => {
    contextLost = false;
    resetPose();
    render();
    canvas.hidden = false;
    fallback.hidden = true;
    controls.hidden = false;
    stage.classList.add('is-interactive');
    setMotionUI();
    startLoop();
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stopLoop();
    else startLoop();
  });
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(stage);
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) startLoop();
      else stopLoop();
    }, { rootMargin: '100px' });
    observer.observe(stage);
  }
  resize();
  render();
  canvas.hidden = false;
  fallback.hidden = true;
  controls.hidden = false;
  stage.classList.add('is-interactive');
  setMotionUI();
  if (!paused) { waveStart = 0; startLoop(); }
  else status.textContent = 'A quiet hello. Motion is paused.';
}
