import { FieldParameters } from "./emotionEngine"

// ==========================================
// Layer 1: 基础场 — 背景渐变 + 环境光
// ==========================================

export function drawFieldBackground(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  params: FieldParameters,
  time: number
): void {
  const { primaryColor, arousal, fieldType } = params

  // 径向渐变 — 提高 alpha 让背景颜色更明显
  const gradient = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w * 0.75)
  gradient.addColorStop(0, primaryColor + toHex(0.15 + arousal * 0.25))
  gradient.addColorStop(0.4, primaryColor + toHex(0.06 + arousal * 0.10))
  gradient.addColorStop(1, "transparent")
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, w, h)

  // 稳态场：额外呼吸光晕
  if (fieldType === "steady") {
    const breathe = 0.5 + 0.5 * Math.sin(time * 0.0008)
    const halo = ctx.createRadialGradient(w / 2, h / 2, w * 0.15, w / 2, h / 2, w * 0.5)
    halo.addColorStop(0, primaryColor + toHex(0.04 * breathe))
    halo.addColorStop(1, "transparent")
    ctx.fillStyle = halo
    ctx.fillRect(0, 0, w, h)
  }

  // 爆裂场：中心亮斑
  if (fieldType === "explosion") {
    const pulse = 0.5 + 0.5 * Math.sin(time * 0.005)
    const core = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w * 0.25)
    core.addColorStop(0, `rgba(255, 255, 255, ${0.15 * pulse})`)
    core.addColorStop(1, "transparent")
    ctx.fillStyle = core
    ctx.fillRect(0, 0, w, h)
  }
}

function toHex(alpha: number): string {
  const a = Math.round(Math.max(0, Math.min(1, alpha)) * 255)
  return a.toString(16).padStart(2, "0")
}

// ==========================================
// Layer 3: 干扰层 — 噪声 / 模糊 / glitch / 抖动
// ==========================================

/** 全局干扰后处理，按场参数驱动 */
export function applyDisturbanceLayer(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  fieldType: string,
  jitter: number,
  blurAmount: number,
  time: number
): void {
  // ---- 噪声 (tension → jitter) ----
  if (jitter > 0.3) {
    applyNoise(ctx, w, h, jitter)
  }

  // ---- 模糊 (低 clarity / 低 stability) ----
  if (blurAmount > 0.3) {
    applyBlur(ctx, blurAmount)
  }

  // ---- glitch 闪烁 (chaos 场) ----
  if (fieldType === "chaos") {
    applyGlitch(ctx, w, h, time)
  }

  // ---- 屏幕震动 (explosion 场) ----
  if (fieldType === "explosion") {
    applyScreenShake(ctx, w, h, time)
  }
}

function applyNoise(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  jitter: number
): void {
  // 降低采样密度保证性能（最多 ~400 次 rect 调用）
  const step = Math.max(20, Math.floor(40 - jitter * 8))
  const amt = jitter * 8

  for (let y = 0; y < h; y += step) {
    for (let x = 0; x < w; x += step) {
      if (Math.random() > 0.5) continue
      const offset = (Math.random() - 0.5) * amt
      ctx.fillStyle = `rgba(${Math.random() > 0.5 ? 255 : 0},${Math.random() > 0.5 ? 255 : 0},${Math.random() > 0.5 ? 255 : 0},${(Math.random() * 0.06 * jitter) / 3})`
      ctx.fillRect(x + offset, y + offset, step, step)
    }
  }
}

function applyBlur(ctx: CanvasRenderingContext2D, amount: number): void {
  // 用 CSS filter 风格的叠加模拟
  const blurLevel = Math.min(amount, 4)
  const alpha = blurLevel * 0.02

  // 简单位移叠加模拟模糊
  ctx.save()
  ctx.globalAlpha = alpha
  ctx.globalCompositeOperation = "lighter"
  // 不做真正的 getImageData，用暗色覆盖降低对比度来模拟模糊感
  ctx.fillStyle = `rgba(11, 11, 16, ${alpha * 2})`
  ctx.fillRect(0, 0, 3000, 3000)
  ctx.restore()
}

function applyGlitch(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  time: number
): void {
  // 周期性 slice 位移
  const glitchInterval = 300 + Math.sin(time * 0.003) * 200
  if (Math.floor(time / glitchInterval) % 3 === 0) return

  const slices = Math.floor(1 + Math.random() * 4)
  for (let i = 0; i < slices; i++) {
    const sy = Math.random() * h
    const sh = 2 + Math.random() * 6
    const offset = (Math.random() - 0.5) * 20

    // 读取一行像素并位移绘制
    try {
      const imageData = ctx.getImageData(0, sy, w, sh)
      ctx.putImageData(imageData, offset, sy)
    } catch {
      // 跨域或性能问题，忽略
    }
  }
}

function applyScreenShake(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  time: number
): void {
  // 低频震动
  const shakeInterval = 800
  const phase = Math.floor(time / shakeInterval) % 4
  if (phase === 0) return

  const shakeX = (Math.random() - 0.5) * 6
  const shakeY = (Math.random() - 0.5) * 6

  // 通过 translate + drawImage 模拟整屏震动
  ctx.save()
  ctx.translate(shakeX, shakeY)
  // canvas content will be drawn with offset by canvasEngine
  ctx.restore()
  // 实际震动在 canvasEngine 中通过 translate 实现
}

/** 返回当前帧的震动偏移 */
export function getShakeOffset(fieldType: string, time: number): { x: number; y: number } {
  if (fieldType !== "explosion") return { x: 0, y: 0 }

  const shakeInterval = 800
  const phase = Math.floor(time / shakeInterval) % 4
  if (phase === 0) return { x: 0, y: 0 }

  return {
    x: (Math.random() - 0.5) * 6,
    y: (Math.random() - 0.5) * 6,
  }
}

// ==========================================
// 环境漂浮粒子 (Layer 2 的背景层)
// ==========================================

export interface AmbientParticle {
  x: number
  y: number
  r: number
  speed: number
  alpha: number
  phase: number
}

export function createAmbientParticles(w: number, h: number, count: number): AmbientParticle[] {
  const particles: AmbientParticle[] = []
  for (let i = 0; i < count; i++) {
    particles.push({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 1.5 + 0.5,
      speed: Math.random() * 0.3 + 0.05,
      alpha: Math.random() * 0.3 + 0.05,
      phase: Math.random() * Math.PI * 2,
    })
  }
  return particles
}

export function drawAmbientParticles(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  particles: AmbientParticle[],
  time: number
): void {
  for (const p of particles) {
    ctx.save()
    ctx.globalAlpha = p.alpha * (0.5 + 0.5 * Math.sin(time * 0.0008 + p.phase))
    ctx.fillStyle = "#ffffff"
    ctx.beginPath()
    ctx.arc(
      p.x,
      p.y + Math.sin(time * 0.0004 + p.phase) * 12,
      p.r,
      0,
      Math.PI * 2
    )
    ctx.fill()
    ctx.restore()

    p.y -= p.speed
    if (p.y < -10) {
      p.y = h + 10
      p.x = Math.random() * w
    }
  }
}
