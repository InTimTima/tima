import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { CSS3DObject, CSS3DRenderer } from 'three/addons/renderers/CSS3DRenderer.js'
import { audio } from '../audio'
import { items, navIdFromItem, type Lang } from '../content'
import { closeDetail, getDetail, openDetail, subscribeDetail } from '../detail'
import { applyLang, CARD_COUNT, createCard } from './cards'
import { registerSeeker, setActiveNav, goToIndex } from '../travel'

type SpiralSceneProps = {
  lang: Lang
}

const COUNT = CARD_COUNT
const TURNS = 1.35
const ANGLE_STEP = (Math.PI * 2 * TURNS) / COUNT
const Z_STEP = 340
const SWEET = 2.05

function wrap(value: number, size: number) {
  const half = size / 2
  return ((((value + half) % size) + size) % size) - half
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function smoothstep(edge0: number, edge1: number, x: number) {
  const t = clamp((x - edge0) / (edge1 - edge0), 0, 1)
  return t * t * (3 - 2 * t)
}

function makeSparkleTexture(size: number) {
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  if (!ctx) return new THREE.Texture()
  const glow = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  glow.addColorStop(0, 'rgba(255,255,255,1)')
  glow.addColorStop(0.18, 'rgba(210,230,255,0.9)')
  glow.addColorStop(0.42, 'rgba(140,180,255,0.35)')
  glow.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = glow
  ctx.fillRect(0, 0, size, size)
  const texture = new THREE.CanvasTexture(canvas)
  texture.needsUpdate = true
  return texture
}

export function SpiralScene({ lang }: SpiralSceneProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const langRef = useRef(lang)
  langRef.current = lang

  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const host = root

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const coarse = window.matchMedia('(pointer: coarse)').matches
    const mobile = window.innerWidth < 780 || coarse
    const cores = navigator.hardwareConcurrency || 8
    const mem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory
    const low = mobile || cores <= 4 || (typeof mem === 'number' && mem <= 4)
    document.documentElement.classList.toggle('is-low', low)

    const radius = mobile ? 380 : 620
    const radiusY = mobile ? 0.72 : 0.58
    const RING_COUNT = low ? 14 : 22
    const RING_GAP = 200
    const WARP_COUNT = low ? 120 : 260
    const sparkleCount = low ? 70 : 220

    const scene = new THREE.Scene()
    const cssScene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(54, 1, 1, 20000)
    camera.position.set(0, 12, 0)

    const webgl = new THREE.WebGLRenderer({
      antialias: !low,
      alpha: false,
      powerPreference: low ? 'low-power' : 'high-performance',
    })
    webgl.setPixelRatio(low ? 1 : Math.min(window.devicePixelRatio, 1.25))
    webgl.setClearColor(0x05060c, 1)
    webgl.toneMapping = low ? THREE.NoToneMapping : THREE.ACESFilmicToneMapping
    webgl.toneMappingExposure = 1.05
    webgl.outputColorSpace = THREE.SRGBColorSpace
    webgl.domElement.className = 'spiral__webgl'
    root.appendChild(webgl.domElement)

    const css = new CSS3DRenderer()
    css.domElement.className = 'spiral__css'
    root.appendChild(css.domElement)

    const bgGeo = new THREE.SphereGeometry(14000, low ? 16 : 24, low ? 10 : 16)
    const bgMat = new THREE.ShaderMaterial({
      side: THREE.BackSide,
      depthWrite: false,
      uniforms: { time: { value: 0 } },
      vertexShader: `
        varying vec3 vPos;
        void main() {
          vPos = position;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vPos;
        uniform float time;
        void main() {
          vec3 n = normalize(vPos);
          float h = n.y * 0.5 + 0.5;
          vec3 deep = vec3(0.02, 0.025, 0.07);
          vec3 mid = vec3(0.08, 0.04, 0.18);
          vec3 rim = vec3(0.02, 0.14, 0.18);
          vec3 col = mix(deep, mid, smoothstep(0.1, 0.9, h));
          col = mix(col, rim, pow(max(-n.z * 0.5 + 0.5, 0.0), 2.4));
          col = mix(col, vec3(0.0), exp(-length(n.xy) * 8.0) * 0.85);
          float glow = exp(-length(n.xy) * 3.4);
          float pulse = 0.82 + 0.18 * sin(time * 0.35);
          col += vec3(0.18, 0.22, 0.7) * glow * pulse * 0.28;
          col += vec3(0.45, 0.18, 0.7) * glow * glow * 0.28;
          float theta = atan(n.z, n.x);
          float phi = acos(clamp(n.y, -1.0, 1.0));
          vec2 uv = vec2(theta * 26.0, phi * 14.0);
          vec2 cell = floor(uv);
          vec2 p = fract(uv) - 0.5;
          float rnd = fract(sin(dot(cell, vec2(127.1, 311.7))) * 43758.5453);
          float on = step(0.935, rnd);
          float twinkle = 0.4 + 0.6 * sin(time * (0.55 + rnd * 1.35) + rnd * 18.0);
          float r = length(p);
          float spikes = max(1.0 - abs(p.x) * 22.0, 0.0) * max(1.0 - abs(p.y) * 3.2, 0.0);
          spikes += max(1.0 - abs(p.y) * 22.0, 0.0) * max(1.0 - abs(p.x) * 3.2, 0.0);
          float diag = max(1.0 - abs(p.x + p.y) * 16.0, 0.0) * max(1.0 - abs(p.x - p.y) * 3.6, 0.0);
          diag += max(1.0 - abs(p.x - p.y) * 16.0, 0.0) * max(1.0 - abs(p.x + p.y) * 3.6, 0.0);
          float core = exp(-r * r * 280.0);
          float spark = (core * 1.4 + spikes * 0.7 + diag * 0.28) * on * twinkle;
          col += vec3(0.82, 0.9, 1.0) * spark * 0.9;
          vec2 uv2 = vec2(theta * 12.0, phi * 7.0);
          vec2 cell2 = floor(uv2);
          vec2 p2 = fract(uv2) - 0.5;
          float rnd2 = fract(sin(dot(cell2, vec2(269.5, 183.3))) * 24634.6345);
          float on2 = step(0.972, rnd2);
          float tw2 = 0.45 + 0.55 * sin(time * 0.75 + rnd2 * 9.0);
          float r2 = length(p2);
          float sp2 = max(1.0 - abs(p2.x) * 14.0, 0.0) * max(1.0 - abs(p2.y) * 2.4, 0.0);
          sp2 += max(1.0 - abs(p2.y) * 14.0, 0.0) * max(1.0 - abs(p2.x) * 2.4, 0.0);
          float core2 = exp(-r2 * r2 * 160.0);
          col += vec3(0.92, 0.96, 1.0) * (core2 * 1.5 + sp2 * 0.8) * on2 * tw2 * 0.75;
          gl_FragColor = vec4(col, 1.0);
        }
      `,
    })
    const bg = new THREE.Mesh(bgGeo, bgMat)
    scene.add(bg)

    const hole = new THREE.Group()
    hole.position.z = -1850
    scene.add(hole)

    const horizonGeo = new THREE.SphereGeometry(78, low ? 16 : 24, low ? 16 : 24)
    const horizonMat = new THREE.MeshBasicMaterial({ color: 0x000000 })
    hole.add(new THREE.Mesh(horizonGeo, horizonMat))

    const photonGeo = new THREE.TorusGeometry(92, 2.2, low ? 8 : 10, low ? 40 : 64)
    const photonMat = new THREE.MeshBasicMaterial({
      color: 0xffd7a1,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
    const photon = new THREE.Mesh(photonGeo, photonMat)
    photon.rotation.x = Math.PI * 0.58
    hole.add(photon)

    const diskGeo = new THREE.TorusGeometry(148, 34, low ? 8 : 12, low ? 40 : 64)
    const diskMat = new THREE.ShaderMaterial({
      side: THREE.DoubleSide,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      uniforms: {
        uTime: { value: 0 },
        uWarp: { value: 0 },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform float uWarp;
        varying vec2 vUv;
        void main() {
          float swirl = fract(vUv.x * 4.0 - uTime * (0.12 + uWarp * 2.4));
          float heat = pow(1.0 - abs(vUv.y - 0.5) * 2.0, 1.4);
          vec3 cool = vec3(0.25, 0.4, 1.0);
          vec3 mid = vec3(1.0, 0.38, 0.12);
          vec3 hot = vec3(1.0, 0.82, 0.45);
          vec3 col = mix(cool, mid, swirl);
          col = mix(col, hot, pow(swirl * heat, 1.6));
          gl_FragColor = vec4(col, (0.28 + swirl * 0.5) * heat);
        }
      `,
    })
    const disk = new THREE.Mesh(diskGeo, diskMat)
    disk.rotation.x = Math.PI * 0.58
    hole.add(disk)

    const glowGeo = new THREE.SphereGeometry(210, low ? 12 : 16, low ? 12 : 16)
    const glowMat = new THREE.MeshBasicMaterial({
      color: 0x4c2a88,
      transparent: true,
      opacity: 0.14,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
    hole.add(new THREE.Mesh(glowGeo, glowMat))

    const tunnel = new THREE.Group()
    scene.add(tunnel)
    const ringMats: THREE.LineBasicMaterial[] = []
    const hexPts: THREE.Vector3[] = []
    const hexR = radius * 1.12
    for (let s = 0; s <= 6; s++) {
      const a = (s / 6) * Math.PI * 2 + Math.PI / 6
      hexPts.push(new THREE.Vector3(Math.cos(a) * hexR, Math.sin(a) * hexR * radiusY, 0))
    }
    const hexGeo = new THREE.BufferGeometry().setFromPoints(hexPts)
    const ringColors = [0x7ec8ff, 0xb8e0ff, 0x5eead4]
    for (let i = 0; i < RING_COUNT; i++) {
      const mat = new THREE.LineBasicMaterial({
        color: ringColors[i % 3],
        transparent: true,
        opacity: 0.18,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })
      ringMats.push(mat)
      const line = new THREE.LineLoop(hexGeo, mat)
      line.userData.index = i
      tunnel.add(line)
    }

    const helixPts: THREE.Vector3[] = []
    const helixSteps = low ? 64 : 100
    for (let i = 0; i <= helixSteps; i++) {
      const u = i / helixSteps
      const a = u * Math.PI * 2 * 5
      helixPts.push(
        new THREE.Vector3(
          Math.cos(a) * radius * 1.04,
          Math.sin(a) * radius * radiusY,
          -u * 6400,
        ),
      )
    }
    const helixCurve = new THREE.CatmullRomCurve3(helixPts)
    const tubeGeo = new THREE.TubeGeometry(helixCurve, helixSteps, mobile ? 3 : 4.5, 4, false)
    const tubeMat = new THREE.ShaderMaterial({
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      uniforms: {
        uTime: { value: 0 },
        uVel: { value: 0 },
      },
      vertexShader: `
        varying float vU;
        void main() {
          vU = uv.x;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform float uVel;
        varying float vU;
        void main() {
          float flow = fract(vU * 18.0 - uTime * (0.8 + abs(uVel) * 0.25));
          float pulse = smoothstep(0.0, 0.15, flow) * smoothstep(0.55, 0.2, flow);
          vec3 a = vec3(0.25, 0.55, 1.0);
          vec3 b = vec3(0.85, 0.3, 1.0);
          vec3 c = vec3(0.3, 1.0, 0.85);
          vec3 col = mix(a, b, pulse);
          col = mix(col, c, pow(pulse, 2.0));
          gl_FragColor = vec4(col, 0.16 + pulse * 0.5);
        }
      `,
    })
    const ribbon = new THREE.Mesh(tubeGeo, tubeMat)
    scene.add(ribbon)

    const sparkleTex = makeSparkleTexture(low ? 32 : 48)
    const sparklePos = new Float32Array(sparkleCount * 3)
    const sparkleSeed = new Float32Array(sparkleCount)
    for (let i = 0; i < sparkleCount; i++) {
      const a = Math.random() * Math.PI * 2
      const rr = radius * (0.2 + Math.random() * 1.7)
      sparklePos[i * 3] = Math.cos(a) * rr
      sparklePos[i * 3 + 1] = Math.sin(a) * rr * radiusY
      sparklePos[i * 3 + 2] = -Math.random() * 8200
      sparkleSeed[i] = Math.random()
    }
    const sparkleGeo = new THREE.BufferGeometry()
    sparkleGeo.setAttribute('position', new THREE.BufferAttribute(sparklePos, 3))
    sparkleGeo.setAttribute('aSeed', new THREE.BufferAttribute(sparkleSeed, 1))
    const sparkleMat = new THREE.ShaderMaterial({
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      uniforms: {
        uTime: { value: 0 },
        uVel: { value: 0 },
        uWarp: { value: 0 },
        uMap: { value: sparkleTex },
      },
      vertexShader: `
        attribute float aSeed;
        uniform float uTime;
        uniform float uVel;
        uniform float uWarp;
        varying float vAlpha;
        varying float vSeed;
        void main() {
          vSeed = aSeed;
          vec3 p = position;
          p.z = mod(p.z + uTime * (40.0 + uVel * 90.0) + 8200.0, 8200.0) - 8200.0;
          vec4 mv = modelViewMatrix * vec4(p, 1.0);
          float twinkle = 0.35 + 0.65 * sin(uTime * (2.2 + aSeed * 8.0) + aSeed * 40.0);
          vAlpha = twinkle * (1.0 - uWarp * 0.9);
          gl_PointSize = clamp((3.0 + twinkle * 8.0) * (700.0 / -mv.z), 1.0, 28.0);
          gl_Position = projectionMatrix * mv;
        }
      `,
      fragmentShader: `
        uniform sampler2D uMap;
        varying float vAlpha;
        varying float vSeed;
        void main() {
          vec4 s = texture2D(uMap, gl_PointCoord);
          vec3 col = mix(vec3(0.45, 0.75, 1.0), vec3(0.9, 0.45, 1.0), vSeed);
          gl_FragColor = vec4(col * s.rgb, s.a * vAlpha);
        }
      `,
    })
    const sparkles = new THREE.Points(sparkleGeo, sparkleMat)
    scene.add(sparkles)

    const warpPos = new Float32Array(WARP_COUNT * 6)
    const warpSeed = new Float32Array(WARP_COUNT * 2)
    const warpEnd = new Float32Array(WARP_COUNT * 2)
    for (let i = 0; i < WARP_COUNT; i++) {
      const a = Math.random() * Math.PI * 2
      const rr = 18 + Math.random() * radius * 2.4
      const x = Math.cos(a) * rr
      const y = Math.sin(a) * rr * 0.68
      const z = -Math.random() * 8200
      const seed = Math.random()
      warpPos[i * 6] = x
      warpPos[i * 6 + 1] = y
      warpPos[i * 6 + 2] = z
      warpPos[i * 6 + 3] = x
      warpPos[i * 6 + 4] = y
      warpPos[i * 6 + 5] = z
      warpSeed[i * 2] = seed
      warpSeed[i * 2 + 1] = seed
      warpEnd[i * 2] = 0
      warpEnd[i * 2 + 1] = 1
    }
    const warpGeo = new THREE.BufferGeometry()
    warpGeo.setAttribute('position', new THREE.BufferAttribute(warpPos, 3))
    warpGeo.setAttribute('aSeed', new THREE.BufferAttribute(warpSeed, 1))
    warpGeo.setAttribute('aEnd', new THREE.BufferAttribute(warpEnd, 1))
    const warpMat = new THREE.ShaderMaterial({
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      uniforms: {
        uTime: { value: 0 },
        uVel: { value: 0 },
        uWarp: { value: 0 },
      },
      vertexShader: `
        attribute float aSeed;
        attribute float aEnd;
        uniform float uTime;
        uniform float uVel;
        uniform float uWarp;
        varying float vAlpha;
        varying float vSeed;
        void main() {
          vSeed = aSeed;
          vec3 p = position;
          p.z = mod(p.z + uTime * (80.0 + uVel * 420.0) + 8200.0, 8200.0) - 8200.0;
          float stretch = mix(6.0, 720.0 + aSeed * 980.0, uWarp);
          p.z -= aEnd * stretch;
          p.xy *= 1.0 - aEnd * uWarp * 0.08;
          vec4 mv = modelViewMatrix * vec4(p, 1.0);
          vAlpha = uWarp * (0.15 + aSeed * 0.85) * (1.0 - aEnd * 0.45);
          gl_Position = projectionMatrix * mv;
        }
      `,
      fragmentShader: `
        varying float vAlpha;
        varying float vSeed;
        void main() {
          vec3 col = mix(vec3(0.75, 0.88, 1.0), vec3(0.55, 0.7, 1.0), vSeed);
          gl_FragColor = vec4(col, vAlpha);
        }
      `,
    })
    const warpLines = new THREE.LineSegments(warpGeo, warpMat)
    scene.add(warpLines)

    const dummy = new THREE.Object3D()
    const qWall = new THREE.Quaternion()
    const qCam = new THREE.Quaternion()
    const qTarget = new THREE.Quaternion()
    const nodes = items.map((item) => {
      const el = createCard(item, langRef.current)
      const object = new CSS3DObject(el)
      cssScene.add(object)

      const onActivate = (event: Event) => {
        const target = event.target
        if (target instanceof Element && target.closest('a, button')) return
        event.preventDefault()
        void audio.unlock()
        if (!el.classList.contains('is-focus')) {
          const index = items.findIndex((entry) => entry.id === item.id)
          if (index >= 0) goToIndex(index)
          return
        }
        audio.navPing()
        openDetail(item)
      }
      el.addEventListener('click', onActivate)
      el.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') onActivate(event)
      })

      return { object, el, item, faceS: 0, focused: false, onActivate }
    })

    let width = 0
    let height = 0
    const resize = () => {
      width = root.clientWidth
      height = root.clientHeight
      camera.aspect = width / Math.max(height, 1)
      camera.updateProjectionMatrix()
      webgl.setSize(width, height)
      css.setSize(width, height)
    }
    resize()

    let t = COUNT - SWEET
    let target = t
    let vel = 0
    let user = 0
    let flash = 0
    let raf = 0
    let last = performance.now()
    let touchY = 0
    let touching = false
    let seekTo: number | null = null
    let parked = false
    let detailOpen = false
    let visible = true
    let slowFrames = 0
    const mouse = { x: 0, y: 0, tx: 0, ty: 0 }

    const cancelSeek = () => {
      seekTo = null
      parked = false
    }

    const unsubDetail = subscribeDetail((item) => {
      detailOpen = item !== null
      if (detailOpen) {
        seekTo = null
        parked = true
        vel = 0
        target = t
      } else {
        parked = false
      }
    })

    const onWheel = (event: WheelEvent) => {
      event.preventDefault()
      if (touching || detailOpen) return
      cancelSeek()
      void audio.unlock()
      let dy = event.deltaY
      if (event.deltaMode === 1) dy *= 16
      if (event.deltaMode === 2) dy *= height
      target -= dy * 0.00115
      user = 1
    }
    const onTouchStart = (event: TouchEvent) => {
      touching = true
      touchY = event.touches[0]?.clientY ?? 0
    }
    const onTouchEnd = () => {
      touching = false
    }
    const onTouchMove = (event: TouchEvent) => {
      if (detailOpen) {
        event.preventDefault()
        return
      }
      const y = event.touches[0]?.clientY ?? touchY
      cancelSeek()
      void audio.unlock()
      const delta = coarse ? y - touchY : touchY - y
      target += delta * 0.008
      touchY = y
      user = 1
      event.preventDefault()
    }
    const onKey = (event: KeyboardEvent) => {
      if (detailOpen) return
      if (event.key === 'ArrowDown' || event.key === 'PageDown') {
        cancelSeek()
        target += 0.75
        user = 1
      }
      if (event.key === 'ArrowUp' || event.key === 'PageUp') {
        cancelSeek()
        target -= 0.75
        user = 1
      }
    }
    const onMouse = (event: MouseEvent) => {
      mouse.tx = (event.clientX / window.innerWidth) * 2 - 1
      mouse.ty = (event.clientY / window.innerHeight) * 2 - 1
    }
    const onVisibility = () => {
      visible = !document.hidden
      if (visible) {
        last = performance.now()
        if (!raf) raf = requestAnimationFrame(tick)
      }
    }

    const unbindSeek = registerSeeker((index) => {
      const destMod = ((index - SWEET) % COUNT + COUNT) % COUNT
      const tMod = ((t % COUNT) + COUNT) % COUNT
      let forward = destMod - tMod
      if (forward < 0) forward += COUNT
      const backward = forward - COUNT
      const delta = Math.abs(backward) < forward - 0.4 ? backward : forward
      seekTo = t + delta
      parked = true
      user = 1
      if (Math.abs(delta) > 1.5) {
        vel = Math.sign(delta || 1) * Math.max(Math.abs(vel), 2.8)
      }
    })

    window.addEventListener('wheel', onWheel, { passive: false })
    root.addEventListener('touchstart', onTouchStart, { passive: true })
    root.addEventListener('touchmove', onTouchMove, { passive: false })
    root.addEventListener('touchend', onTouchEnd, { passive: true })
    root.addEventListener('touchcancel', onTouchEnd, { passive: true })
    window.addEventListener('keydown', onKey)
    window.addEventListener('resize', resize)
    window.addEventListener('mousemove', onMouse)
    document.addEventListener('visibilitychange', onVisibility)

    function tick(now: number) {
      if (!visible) {
        raf = 0
        return
      }
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      const time = now * 0.001

      if (dt > 0.033) slowFrames += 1
      else slowFrames = Math.max(0, slowFrames - 1)
      if (slowFrames > 45) {
        sparkles.visible = false
      }

      if (seekTo !== null) {
        const remain = seekTo - t
        const ad = Math.abs(remain)
        if (ad < 0.018 && Math.abs(vel) < 0.18) {
          t = seekTo
          target = t
          vel = 0
          seekTo = null
        } else {
          const cruise = Math.min(6.2, 2.4 + ad * 0.7)
          const maxV = Math.min(cruise, Math.sqrt(Math.max(0.0002, 2 * 8.5 * ad)))
          const want = Math.sign(remain) * maxV
          vel += (want - vel) * Math.min(1, dt * 6.5)
          t += vel * dt
          target = t
        }
        user = 1
      } else if (!detailOpen) {
        if (!reduce && !parked && user < 0.12) target += dt * 0.035
        user *= 0.991
        const prev = t
        t += (target - t) * (1 - Math.exp(-dt * 1.25))
        vel = (t - prev) / Math.max(dt, 0.0001)
      } else {
        vel *= 0.85
        target = t
      }

      const speed = Math.min(Math.abs(vel), 8)
      const warp = smoothstep(0.55, 2.6, speed)
      const slowmo = 1 - warp
      audio.setMotion(speed, warp)

      mouse.x += (mouse.tx - mouse.x) * 0.04
      mouse.y += (mouse.ty - mouse.y) * 0.04

      const fovTarget = 52 + warp * 18
      camera.fov += (fovTarget - camera.fov) * 0.07
      camera.updateProjectionMatrix()
      camera.position.x = Math.sin(t * 0.06 + time * 0.08) * 6 * (1 - warp) + mouse.x * 22
      camera.position.y = 8 + Math.cos(t * 0.05) * 5 * (1 - warp) - mouse.y * 14
      camera.lookAt(mouse.x * 40 * (1 - warp), -mouse.y * 24 * (1 - warp), -1600)

      bgMat.uniforms.time.value = time
      tubeMat.uniforms.uTime.value = time
      tubeMat.uniforms.uVel.value = vel
      sparkleMat.uniforms.uTime.value = time
      sparkleMat.uniforms.uVel.value = vel
      sparkleMat.uniforms.uWarp.value = warp
      warpMat.uniforms.uTime.value = time
      warpMat.uniforms.uVel.value = vel
      warpMat.uniforms.uWarp.value = warp
      diskMat.uniforms.uTime.value = time
      diskMat.uniforms.uWarp.value = warp
      sparkles.rotation.z = t * 0.04
      ribbon.rotation.z = t * ANGLE_STEP * 0.2
      ribbon.position.z = ((t * Z_STEP) % 900) - 200
      disk.rotation.z = time * (0.18 + warp * 3.2)
      photon.rotation.z = time * (0.08 + warp * 1.4)
      hole.scale.setScalar(1 + warp * 0.12)
      warpLines.visible = warp > 0.05

      for (const line of tunnel.children) {
        const idx = line.userData.index as number
        const wrapped = wrap(idx - t * (Z_STEP / RING_GAP), RING_COUNT)
        line.position.z = -120 - wrapped * RING_GAP
        line.rotation.z = t * ANGLE_STEP * 0.85 + idx * 0.22
        const depth = -line.position.z
        const fade =
          smoothstep(40, 520, depth) * (1 - smoothstep(2400, 5200, depth))
        const mat = ringMats[idx]
        if (mat) mat.opacity = (0.05 + fade * 0.22) * (1 - warp * 0.5)
      }

      let bestI = 0
      let bestDist = 99
      for (let i = 0; i < COUNT; i++) {
        const node = nodes[i]
        const offset = wrap(i - t, COUNT)
        const dist = Math.abs(offset - SWEET)
        if (dist < bestDist) {
          bestDist = dist
          bestI = i
        }
        const angle = offset * ANGLE_STEP
        const near = smoothstep(6.2, SWEET + 0.4, offset) * (1 - smoothstep(SWEET - 0.15, -0.55, offset))
        const pass = smoothstep(SWEET - 0.05, -0.7, offset)
        const wrapFade = smoothstep(COUNT * 0.47, COUNT * 0.36, Math.abs(offset))
        const r = THREE.MathUtils.lerp(radius, radius * 0.84, near)
        const x = Math.cos(angle) * r
        const y = Math.sin(angle) * r * radiusY + Math.sin(time * 0.9 + i) * 6 * near
        const z = -offset * Z_STEP - 24

        node.faceS += (near - node.faceS) * 0.045
        const opening = detailOpen && getDetail()?.id === node.item.id
        if (!opening) {
          node.object.position.set(x, y, z)
        }

        const opacity =
          wrapFade *
          (1 - pass) *
          (1 - warp * 0.35) *
          (0.32 + 0.68 * Math.max(node.faceS, 0.28))
        const hidden = opacity < 0.05 && !opening
        const focused = !hidden && node.faceS > 0.58 && warp < 0.45
        if (focused && !node.focused) flash = 1
        node.focused = focused

        const el = node.el
        if (el.dataset.hide !== String(hidden)) {
          el.dataset.hide = String(hidden)
          el.style.visibility = hidden ? 'hidden' : 'visible'
        }

        if (!hidden) {
          dummy.position.copy(node.object.position)
          dummy.lookAt(0, 0, node.object.position.z)
          qWall.copy(dummy.quaternion)
          dummy.lookAt(camera.position)
          qCam.copy(dummy.quaternion)
          qTarget.slerpQuaternions(qWall, qCam, opening ? 1 : node.faceS * 0.72)
          node.object.quaternion.rotateTowards(qTarget, dt * (opening ? 4 : 1.65))
          const scaleBase = THREE.MathUtils.lerp(0.42, 1.02, node.faceS) * (1 - warp * 0.18)
          if (opening) {
            node.object.position.lerp(new THREE.Vector3(0, 0, -320), Math.min(1, dt * 5))
            node.object.scale.setScalar(THREE.MathUtils.lerp(node.object.scale.x, 1.45, Math.min(1, dt * 6)))
            el.style.opacity = '0.12'
          } else {
            node.object.scale.setScalar(scaleBase)
            const nextOpacity = clamp(opacity, 0, 1).toFixed(3)
            if (el.dataset.o !== nextOpacity) {
              el.dataset.o = nextOpacity
              el.style.opacity = nextOpacity
            }
          }
          el.style.pointerEvents = focused && !detailOpen ? 'auto' : 'none'
          el.classList.toggle('is-focus', focused && !detailOpen)
          el.classList.toggle('is-opening', Boolean(opening))
        }
      }
      setActiveNav(navIdFromItem(nodes[bestI].item))

      flash *= 0.9
      host.style.setProperty('--speed', String(speed))
      host.style.setProperty('--slowmo', String(slowmo))
      host.style.setProperty('--flash', String(flash))
      host.style.setProperty('--warp', String(warp))

      webgl.render(scene, camera)
      css.render(cssScene, camera)
      raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(raf)
      raf = 0
      visible = false
      unbindSeek()
      unsubDetail()
      closeDetail()
      window.removeEventListener('wheel', onWheel)
      root.removeEventListener('touchstart', onTouchStart)
      root.removeEventListener('touchmove', onTouchMove)
      root.removeEventListener('touchend', onTouchEnd)
      root.removeEventListener('touchcancel', onTouchEnd)
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', onMouse)
      document.removeEventListener('visibilitychange', onVisibility)
      nodes.forEach(({ object, el, onActivate }) => {
        el.removeEventListener('click', onActivate)
        object.element.remove()
        cssScene.remove(object)
      })
      bgGeo.dispose()
      bgMat.dispose()
      horizonGeo.dispose()
      horizonMat.dispose()
      photonGeo.dispose()
      photonMat.dispose()
      diskGeo.dispose()
      diskMat.dispose()
      glowGeo.dispose()
      glowMat.dispose()
      hexGeo.dispose()
      tubeGeo.dispose()
      tubeMat.dispose()
      sparkleGeo.dispose()
      sparkleMat.dispose()
      sparkleTex.dispose()
      warpGeo.dispose()
      warpMat.dispose()
      ringMats.forEach((mat) => mat.dispose())
      webgl.dispose()
      webgl.domElement.remove()
      css.domElement.remove()
    }
  }, [])

  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    applyLang(root, lang)
  }, [lang])

  return (
    <div ref={rootRef} className="spiral">
      <div className="fx" aria-hidden="true">
        <div className="fx__core" />
        <div className="fx__warp" />
      </div>
    </div>
  )
}
