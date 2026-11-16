import {
  AdditiveBlending,
  BufferGeometry,
  Color,
  Float32BufferAttribute,
  Group,
  Mesh,
  PlaneGeometry,
  Texture,
  NormalBlending,
  PerspectiveCamera,
  Points,
  Scene,
  ShaderMaterial,
  WebGLRenderer,
} from 'three'

/**
 * The hologram is a cloud of points drawn with one small shader:
 * scan lines, a sweeping bright band, flicker, depth fade and a soft glow.
 *
 * Two sources for the points:
 *   1. PHOTO     a portrait image (src/assets/portrait.*). Each pixel becomes a
 *                point, pushed forward by its brightness, so the face has relief.
 *   2. FIGURE    a procedural half-figure used until a portrait is added.
 *                It has a jointed right arm, so it can actually wave.
 *
 * To upgrade to a rigged GLB later, replace the Points object with the loaded
 * model and reuse the same material idea (see README, "Hologram upgrade path").
 */

// Part ids used by the shader to animate the waving arm.
const BODY = 0
const UPPER_ARM = 1
const FOREARM = 2
const BASE = 3

const SHOULDER = [0.5, -0.1, 0]
const ELBOW = [0.6, -0.56, 0.02]

const vertexShader = /* glsl */ `
  attribute float aPart;
  attribute float aBright;
  uniform float uTime;
  uniform float uRaise;   // 0 = arm at rest, 1 = arm raised
  uniform float uWave;    // forearm swing, radians
  uniform float uSize;
  uniform float uScale;
  uniform float uCamZ;
  uniform vec3 uShoulder;
  uniform vec3 uElbow;
  varying float vBright;
  varying float vY;
  varying float vDepth;
  varying float vPart;

  vec3 rotZ(vec3 p, vec3 pivot, float a) {
    float c = cos(a), s = sin(a);
    vec3 d = p - pivot;
    return pivot + vec3(c * d.x - s * d.y, s * d.x + c * d.y, d.z);
  }

  void main() {
    vec3 p = position;
    // Elbow first (in the arm's rest frame), then the whole arm from the shoulder.
    if (aPart > 1.5 && aPart < 2.5) p = rotZ(p, uElbow, uRaise * 1.75 + uWave);
    if (aPart > 0.5 && aPart < 2.5) p = rotZ(p, uShoulder, uRaise * 0.75);

    // Occasional horizontal tear, like an unstable projection.
    float tear = step(0.992, sin(uTime * 1.7 + p.y * 3.0) * sin(uTime * 0.31));
    p.x += tear * 0.03 * sin(p.y * 60.0);

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = uSize * uScale * (0.55 + aBright * 0.75) / -mv.z;

    vBright = aBright;
    vY = p.y;
    vDepth = clamp((mv.z + uCamZ + 0.35) / 0.7, 0.0, 1.0); // 1 = near the viewer
    vPart = aPart;
  }
`

const fragmentShader = /* glsl */ `
  uniform float uTime;
  uniform vec3 uColor;
  uniform vec3 uAccent;
  uniform float uOpacity;
  varying float vBright;
  varying float vY;
  varying float vDepth;
  varying float vPart;

  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float d = length(c);
    if (d > 0.5) discard;
    float dotAlpha = smoothstep(0.5, 0.05, d);

    // Fine scan lines drifting upward, plus one slow bright band.
    float lines = 0.62 + 0.38 * sin(vY * 95.0 - uTime * 2.2);
    float sweepY = fract(uTime * 0.09) * 3.2 - 1.5;
    float band = smoothstep(0.12, 0.0, abs(vY - sweepY));
    float flicker = 0.93 + 0.07 * sin(uTime * 23.0) * sin(uTime * 7.3);

    // The figure dissolves towards the bottom; the base ring stays.
    float fade = vPart > 2.5 ? 1.0 : smoothstep(-1.2, -0.72, vY);
    float depth = 0.3 + 0.7 * vDepth;

    float a = dotAlpha * lines * flicker * fade * depth * (0.35 + vBright * 0.65);
    a += dotAlpha * band * 0.4 * fade;
    vec3 col = mix(uColor, uAccent, vPart > 2.5 ? 0.0 : band * 0.35);
    gl_FragColor = vec4(col, a * uOpacity);
  }
`

/* ---------- point sources ---------- */

function buildFigure(count) {
  const pos = []
  const part = []
  const bright = []

  const ellipsoids = [
    { c: [0, 0.62, 0.02], r: [0.215, 0.285, 0.235], w: 0.24 }, // head
    { c: [0, -0.5, 0], r: [0.43, 0.76, 0.22], w: 0.36 }, // torso
    { c: [0, 0.1, 0], r: [0.52, 0.2, 0.2], w: 0.14 }, // shoulders
  ]
  const capsules = [
    { a: [0, 0.34, 0], b: [0, 0.18, 0], r: 0.1, w: 0.03, part: BODY }, // neck
    { a: [-0.5, -0.1, 0], b: [-0.6, -0.56, 0.02], r: 0.085, w: 0.05, part: BODY }, // left upper arm
    { a: [-0.6, -0.56, 0.02], b: [-0.6, -1.02, 0.08], r: 0.07, w: 0.05, part: BODY }, // left forearm
    { a: SHOULDER, b: ELBOW, r: 0.085, w: 0.05, part: UPPER_ARM },
    { a: ELBOW, b: [0.6, -0.98, 0.08], r: 0.07, w: 0.05, part: FOREARM },
  ]
  const hand = { c: [0.6, -1.07, 0.09], r: [0.06, 0.1, 0.035], w: 0.03 }

  const insideEllipsoid = (p, e, shrink = 0.94) =>
    ((p[0] - e.c[0]) / (e.r[0] * shrink)) ** 2 +
      ((p[1] - e.c[1]) / (e.r[1] * shrink)) ** 2 +
      ((p[2] - e.c[2]) / (e.r[2] * shrink)) ** 2 < 1

  const randDir = () => {
    const u = Math.random() * 2 - 1
    const t = Math.random() * Math.PI * 2
    const s = Math.sqrt(1 - u * u)
    return [s * Math.cos(t), u, s * Math.sin(t)]
  }
  const push = (p, id) => {
    pos.push(p[0], p[1], p[2])
    part.push(id)
    bright.push(0.35 + Math.random() * 0.65)
  }

  const n = Math.floor(count * 0.93)
  ellipsoids.forEach((e, i) => {
    const target = Math.floor(n * e.w)
    let made = 0
    let guard = 0
    while (made < target && guard++ < target * 6) {
      const d = randDir()
      const p = [e.c[0] + d[0] * e.r[0], e.c[1] + d[1] * e.r[1], e.c[2] + d[2] * e.r[2]]
      // Keep only the outer shell: drop points buried inside another volume.
      if (ellipsoids.some((o, j) => j !== i && insideEllipsoid(p, o))) continue
      push(p, BODY)
      made++
    }
  })
  capsules.forEach((c) => {
    const target = Math.floor(n * c.w)
    const ax = [c.b[0] - c.a[0], c.b[1] - c.a[1], c.b[2] - c.a[2]]
    for (let i = 0; i < target; i++) {
      const t = Math.random()
      const ang = Math.random() * Math.PI * 2
      // The limbs run close to vertical, so a ring in the xz-plane is close enough.
      const p = [
        c.a[0] + ax[0] * t + Math.cos(ang) * c.r,
        c.a[1] + ax[1] * t,
        c.a[2] + ax[2] * t + Math.sin(ang) * c.r,
      ]
      if (c.part === BODY && ellipsoids.some((o) => insideEllipsoid(p, o))) continue
      push(p, c.part)
    }
  })
  for (let i = 0; i < Math.floor(n * hand.w); i++) {
    const d = randDir()
    push([hand.c[0] + d[0] * hand.r[0], hand.c[1] + d[1] * hand.r[1], hand.c[2] + d[2] * hand.r[2]], FOREARM)
  }

  addBase(pos, part, bright, Math.floor(count * 0.07), -1.3)
  return { pos, part, bright, canWave: true }
}

function buildFromImage(img, count) {
  const aspect = img.naturalWidth / img.naturalHeight
  const H = Math.round(Math.sqrt(count / aspect) * 2.2)
  const W = Math.round(H * aspect)
  const cv = document.createElement('canvas')
  cv.width = W
  cv.height = H
  const cx = cv.getContext('2d', { willReadFrequently: true })
  cx.drawImage(img, 0, 0, W, H)
  const data = cx.getImageData(0, 0, W, H).data

  const pos = []
  const part = []
  const bright = []
  const height = 2.5
  const width = height * aspect
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = (y * W + x) * 4
      if (data[i + 3] < 60) continue // transparent background is skipped
      if (Math.random() > 0.3) continue // the photo itself carries the likeness; points add sparkle
      const lum = (0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2]) / 255
      const nx = x / (W - 1) - 0.5
      const ny = 0.5 - y / (H - 1)
      // Relief: a gentle overall bulge plus brightness (lit areas sit forward).
      const bulge = Math.sqrt(Math.max(0, 1 - (nx * 2) ** 2)) * 0.22
      // A little jitter breaks up the pixel grid so it reads as light, not as a raster.
      const jx = (Math.random() - 0.5) * (width / W) * 0.8
      const jy = (Math.random() - 0.5) * (height / H) * 0.8
      pos.push(nx * width + jx, ny * height - 0.05 + jy, bulge + 0.03 + lum * 0.06)
      part.push(BODY)
      bright.push(0.35 + lum * 0.65)
    }
  }
  addBase(pos, part, bright, Math.floor(count * 0.07), -1.3)
  return { pos, part, bright, canWave: false }
}

// The projector ring under the figure.
function addBase(pos, part, bright, n, y) {
  for (let i = 0; i < n; i++) {
    const ring = i % 3
    const r = [0.62, 0.78, 0.82][ring]
    const a = (i / n) * Math.PI * 2 * 3
    pos.push(Math.cos(a) * r, y, Math.sin(a) * r * 0.9)
    part.push(BASE)
    bright.push(ring === 0 ? 0.9 : 0.4)
  }
}

/* ---------- portrait surface (photo mode) ---------- */
// The cut-out photo drawn as light: tinted, scan-lined, gently curved so it
// has relief when it turns, and dissolving towards the bottom.

const portraitVertex = /* glsl */ `
  varying vec2 vUv;
  varying float vY;
  void main() {
    vUv = uv;
    vec3 p = position;
    float nx = uv.x - 0.5;
    p.z += sqrt(max(0.0, 1.0 - nx * nx * 4.0)) * 0.22;
    vY = p.y;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`

const portraitFragment = /* glsl */ `
  uniform sampler2D uMap;
  uniform float uTime;
  uniform float uLight;   // 0 = dark theme (light on dark), 1 = light theme (ink on paper)
  uniform vec3 uColor;
  uniform vec3 uAccent;
  uniform vec3 uPaper;
  varying vec2 vUv;
  varying float vY;

  void main() {
    // A rare horizontal tear, like an unstable projection.
    float tear = step(0.994, sin(uTime * 1.7 + vY * 3.0) * sin(uTime * 0.31));
    vec2 uv = vUv + vec2(tear * 0.02 * sin(vY * 70.0), 0.0);
    vec4 tex = texture2D(uMap, uv);
    if (tex.a < 0.02) discard;
    float lum = dot(tex.rgb, vec3(0.2126, 0.7152, 0.0722));

    float lines = 0.8 + 0.2 * sin(vY * 210.0 - uTime * 2.4);
    float sweepY = fract(uTime * 0.09) * 3.4 - 1.6;
    float band = smoothstep(0.14, 0.0, abs(vY - sweepY));
    float flicker = 0.95 + 0.05 * sin(uTime * 23.0) * sin(uTime * 7.3);
    float fade = smoothstep(-1.28, -0.78, vY);

    // Dark theme: glowing blue light, with a floor so a dark suit keeps its shape.
    vec3 glow = uColor * (0.2 + pow(lum, 0.85) * 1.15) + uAccent * band * 0.25;
    // Light theme: an ink-blue duotone print of the photo.
    vec3 ink = mix(uColor, uPaper, clamp(pow(lum, 0.8) * 1.05, 0.0, 1.0)) + uAccent * band * 0.12;

    vec3 col = mix(glow, ink, uLight);
    float a = tex.a * fade * flicker * mix(lines, 0.86 + 0.14 * lines, uLight);
    gl_FragColor = vec4(col, a * mix(0.92, 0.96, uLight));
  }
`

function buildPortrait(img) {
  const aspect = img.naturalWidth / img.naturalHeight
  const height = 2.5
  const texture = new Texture(img)
  texture.needsUpdate = true
  const material = new ShaderMaterial({
    vertexShader: portraitVertex,
    fragmentShader: portraitFragment,
    transparent: true,
    depthWrite: false,
    uniforms: {
      uMap: { value: texture },
      uTime: { value: 0 },
      uLight: { value: 0 },
      uColor: { value: new Color() },
      uAccent: { value: new Color() },
      uPaper: { value: new Color('#e9e5d8') },
    },
  })
  const mesh = new Mesh(new PlaneGeometry(height * aspect, height, 40, 60), material)
  mesh.position.y = -0.05
  return { mesh, material, texture }
}

/* ---------- scene ---------- */

const THEME = {
  dark: { color: '#8fc0f2', accent: '#f18d46', blending: AdditiveBlending, opacity: 0.95, light: 0 },
  light: { color: '#1f4f86', accent: '#c4621b', blending: NormalBlending, opacity: 1, light: 1 },
}

export function createHologram(canvas, { theme = 'dark', image = null, reducedMotion = false } = {}) {
  const small = window.matchMedia('(max-width: 760px)').matches
  const lowPower = small || (navigator.hardwareConcurrency || 8) <= 4
  const count = lowPower ? 6000 : 16000

  const renderer = new WebGLRenderer({ canvas, alpha: true, antialias: false, powerPreference: 'low-power' })
  const dpr = Math.min(window.devicePixelRatio || 1, lowPower ? 1.5 : 2)
  renderer.setPixelRatio(dpr)

  const scene = new Scene()
  const camera = new PerspectiveCamera(32, 1, 0.1, 20)
  camera.position.set(0, -0.1, 6.2)

  const src = image ? buildFromImage(image, count) : buildFigure(count)
  const geometry = new BufferGeometry()
  geometry.setAttribute('position', new Float32BufferAttribute(src.pos, 3))
  geometry.setAttribute('aPart', new Float32BufferAttribute(src.part, 1))
  geometry.setAttribute('aBright', new Float32BufferAttribute(src.bright, 1))

  const material = new ShaderMaterial({
    vertexShader,
    fragmentShader,
    transparent: true,
    depthWrite: false,
    uniforms: {
      uTime: { value: 0 },
      uRaise: { value: 0 },
      uWave: { value: 0 },
      uSize: { value: image ? 20 : 25 },
      uScale: { value: 1 },
      uCamZ: { value: 6.2 },
      uColor: { value: new Color() },
      uAccent: { value: new Color() },
      uOpacity: { value: 1 },
      uShoulder: { value: SHOULDER },
      uElbow: { value: ELBOW },
    },
  })

  const group = new Group()
  const portrait = image ? buildPortrait(image) : null
  if (portrait) {
    group.add(portrait.mesh)
    group.scale.setScalar(1.2) // the photo figure fills the stage
  }
  group.add(new Points(geometry, material))
  scene.add(group)

  const setTheme = (name) => {
    const t = THEME[name] || THEME.dark
    material.uniforms.uColor.value.set(t.color)
    material.uniforms.uAccent.value.set(t.accent)
    material.uniforms.uOpacity.value = t.opacity
    material.blending = t.blending
    material.needsUpdate = true
    if (portrait) {
      const u = portrait.material.uniforms
      u.uColor.value.set(name === 'light' ? '#15263b' : t.color)
      u.uAccent.value.set(t.accent)
      u.uLight.value = t.light
      portrait.material.blending = t.blending
      portrait.material.needsUpdate = true
    }
    if (reducedMotion) renderFrame(0)
  }

  const resize = () => {
    const w = canvas.clientWidth
    const h = canvas.clientHeight
    if (!w || !h) return
    renderer.setSize(w, h, false)
    camera.aspect = w / h
    // Pull back on narrow canvases so the raised arm never clips.
    camera.position.z = camera.aspect < 0.8 ? 6.2 + (0.8 - camera.aspect) * 5 : 6.2
    camera.updateProjectionMatrix()
    material.uniforms.uCamZ.value = camera.position.z
    material.uniforms.uScale.value = (h * dpr) / 1000
    if (reducedMotion) renderFrame(0)
  }

  const pointer = { x: 0, y: 0, tx: 0, ty: 0 }
  const onMove = (e) => {
    pointer.tx = e.clientX / window.innerWidth - 0.5
    pointer.ty = e.clientY / window.innerHeight - 0.5
  }

  let waveStart = -1
  const WAVE_LEN = 3.1
  const wave = () => {
    if (!src.canWave || reducedMotion) return
    waveStart = material.uniforms.uTime.value
  }

  const ease = (x) => x * x * (3 - 2 * x)
  function renderFrame(t) {
    const u = material.uniforms
    u.uTime.value = t
    if (portrait) portrait.material.uniforms.uTime.value = t
    if (waveStart >= 0) {
      const p = (t - waveStart) / WAVE_LEN
      if (p >= 1) {
        waveStart = -1
        u.uRaise.value = 0
        u.uWave.value = 0
      } else {
        // Raise, wave a few times with a soft start and finish, lower.
        const raise = ease(Math.min(1, p / 0.2)) * ease(Math.min(1, (1 - p) / 0.22))
        const swing = Math.sin((t - waveStart) * 7.2) * 0.34 * ease(Math.min(1, Math.max(0, (p - 0.12) / 0.15)))
        u.uRaise.value = raise
        u.uWave.value = swing * raise
      }
    }
    pointer.x += (pointer.tx - pointer.x) * 0.04
    pointer.y += (pointer.ty - pointer.y) * 0.04
    group.rotation.y = Math.sin(t * 0.32) * (src.canWave ? 0.3 : 0.12) + pointer.x * (src.canWave ? 0.5 : 0.3)
    group.rotation.x = pointer.y * 0.16
    group.position.y = Math.sin(t * 0.9) * 0.035 + 0.16
    group.position.x = src.canWave ? -0.12 : 0
    renderer.render(scene, camera)
  }

  let raf = 0
  let visible = true
  const start = performance.now()
  const loop = (now) => {
    raf = requestAnimationFrame(loop)
    renderFrame((now - start) / 1000)
  }
  const run = () => {
    cancelAnimationFrame(raf)
    if (visible && !document.hidden && !reducedMotion) raf = requestAnimationFrame(loop)
  }

  // Only render while the hero is on screen and the tab is visible.
  const io = new IntersectionObserver(([e]) => {
    visible = e.isIntersecting
    run()
  })
  io.observe(canvas)
  const ro = new ResizeObserver(resize)
  ro.observe(canvas)
  document.addEventListener('visibilitychange', run)
  window.addEventListener('pointermove', onMove, { passive: true })

  setTheme(theme)
  resize()
  if (reducedMotion) renderFrame(0)
  else run()

  return {
    setTheme,
    wave,
    canWave: src.canWave,
    dispose() {
      cancelAnimationFrame(raf)
      io.disconnect()
      ro.disconnect()
      document.removeEventListener('visibilitychange', run)
      window.removeEventListener('pointermove', onMove)
      geometry.dispose()
      if (portrait) {
        portrait.mesh.geometry.dispose()
        portrait.material.dispose()
        portrait.texture.dispose()
      }
      material.dispose()
      renderer.dispose()
    },
  }
}
