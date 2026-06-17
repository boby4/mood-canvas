import { FieldParameters } from "./emotionEngine"

export interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  radius: number
  color: string
  alpha: number
  life: number
  maxLife: number
  // per-particle variation
  speedMul: number
  angle: number
}

export class ParticleSystem {
  private particles: Particle[] = []
  private fieldParams: FieldParameters | null = null

  setField(params: FieldParameters): void {
    this.fieldParams = params
  }

  reset(): void {
    this.particles = []
  }

  /** 在情绪场中生成粒子 */
  spawn(cx: number, cy: number, params: FieldParameters): void {
    this.fieldParams = params
    const count = params.particleCount

    for (let i = 0; i < count; i++) {
      this.particles.push(this.createParticle(cx, cy, params))
    }
  }

  /** 每帧少量补充粒子，保持场持续可见 */
  autoRespawn(cx: number, cy: number, frameCount: number): void {
    if (!this.fieldParams) return
    // 每 15 帧补充 2~6 个粒子
    if (frameCount % 15 !== 0) return
    const p = this.fieldParams
    const count = 2 + Math.floor(p.arousal * 4)
    for (let i = 0; i < count; i++) {
      this.particles.push(this.createParticle(cx, cy, p))
    }
  }

  private createParticle(cx: number, cy: number, p: FieldParameters): Particle {
    const angle = Math.random() * Math.PI * 2
    const speedMul = 0.5 + Math.random() * 1.5
    const maxLife = 60 + Math.random() * 180

    return {
      x: cx + (Math.random() - 0.5) * 20,
      y: cy + (Math.random() - 0.5) * 20,
      vx: Math.cos(angle) * p.speed * speedMul,
      vy: Math.sin(angle) * p.speed * speedMul,
      radius: 1 + Math.random() * 3 * (0.5 + p.arousal),
      color: Math.random() > 0.5 ? p.primaryColor : p.secondaryColor,
      alpha: 0.4 + Math.random() * 0.5,
      life: maxLife,
      maxLife,
      speedMul,
      angle,
    }
  }

  /** 物理场力模拟 —— 每帧更新 */
  update(ctx: CanvasRenderingContext2D, w: number, h: number, time: number): void {
    if (!this.fieldParams) return

    const p = this.fieldParams
    // 杀死过期粒子
    this.particles = this.particles.filter((pt) => pt.life > 0)

    for (const pt of this.particles) {
      pt.life -= 1
      const progress = pt.life / pt.maxLife

      // ===== 1. 扩张/收缩力 (valence) =====
      // 作用方向：从画布中心向外
      const dx = pt.x - w / 2
      const dy = pt.y - h / 2
      const dist = Math.sqrt(dx * dx + dy * dy) + 0.01
      const nx = dx / dist
      const ny = dy / dist
      pt.vx += nx * p.expansionForce * (1 + pt.speedMul * 0.3)
      pt.vy += ny * p.expansionForce * (1 + pt.speedMul * 0.3)

      // ===== 2. 重力 (低 arousal) =====
      pt.vy += p.gravity * (1 - progress)

      // ===== 3. 抖动 (tension) =====
      if (p.jitter > 0) {
        const jitterStr = p.jitter * (0.5 + Math.random() * 1.5)
        pt.vx += (Math.random() - 0.5) * jitterStr
        pt.vy += (Math.random() - 0.5) * jitterStr
      }

      // ===== 4. 随机漂移 (low stability) =====
      if (p.randomness > 0) {
        const ran = p.randomness * (0.5 + progress)
        pt.vx += (Math.random() - 0.5) * ran * 2
        pt.vy += (Math.random() - 0.5) * ran * 2
      }

      // ===== 5. 流体力 (steady 场) =====
      if (p.fieldType === "steady") {
        const waveX = Math.sin(time * 0.001 + pt.y * 0.005) * 0.04
        const waveY = Math.cos(time * 0.001 + pt.x * 0.005) * 0.04
        pt.vx += waveX
        pt.vy += waveY
      }

      // 阻尼
      const damping = 0.995 - p.randomness * 0.01
      pt.vx *= damping
      pt.vy *= damping

      pt.x += pt.vx
      pt.y += pt.vy

      // 边界反弹 + 拖尾
      if (pt.x < 0) { pt.x = 0; pt.vx *= -0.5 }
      if (pt.x > w) { pt.x = w; pt.vx *= -0.5 }
      if (pt.y < 0) { pt.y = 0; pt.vy *= -0.5 }
      if (pt.y > h) { pt.y = h; pt.vy *= -0.5 }

      pt.alpha = progress * 0.7
    }
  }

  draw(ctx: CanvasRenderingContext2D): void {
    if (!this.fieldParams) return
    const p = this.fieldParams

    for (const pt of this.particles) {
      ctx.save()
      ctx.globalAlpha = pt.alpha
      ctx.fillStyle = pt.color

      // glow effect
      ctx.shadowColor = pt.color
      ctx.shadowBlur = 3 + p.arousal * 4

      ctx.beginPath()
      ctx.arc(pt.x, pt.y, pt.radius, 0, Math.PI * 2)
      ctx.fill()

      // 拖尾短线
      if (p.speed > 1.5 && pt.alpha > 0.3) {
        ctx.globalAlpha = pt.alpha * 0.5
        ctx.strokeStyle = pt.color
        ctx.lineWidth = pt.radius * 0.6
        ctx.beginPath()
        ctx.moveTo(pt.x, pt.y)
        ctx.lineTo(pt.x - pt.vx * 2, pt.y - pt.vy * 2)
        ctx.stroke()
      }

      ctx.restore()
    }
  }

  getParticleCount(): number {
    return this.particles.length
  }
}
