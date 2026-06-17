import { Emotion, PRESET_VECTORS, computeFieldParams, blendVector, EMOTION_LABELS } from "./emotionEngine"
import type { FieldParameters } from "./emotionEngine"
import { ParticleSystem } from "./particleSystem"
import {
  drawFieldBackground,
  applyDisturbanceLayer,
  createAmbientParticles,
  drawAmbientParticles,
  getShakeOffset,
} from "./motionEngine"
import type { AmbientParticle } from "./motionEngine"

export class CanvasEngine {
  private ctx: CanvasRenderingContext2D | null = null
  private w = 0
  private h = 0
  private animationId = 0
  private startTime = 0
  private frameCount = 0
  private particleSystem: ParticleSystem
  private fieldParams: FieldParameters | null = null
  private isRunning = false
  private ambientParticles: AmbientParticle[] = []
  private currentEmotionLabel = ""

  constructor() {
    this.particleSystem = new ParticleSystem()
  }

  // ========== 生命周期 ==========

  mount(canvas: HTMLCanvasElement): void {
    this.ctx = canvas.getContext("2d")!
    this.resize(canvas)
    this.startTime = Date.now()
    this.ambientParticles = createAmbientParticles(this.w, this.h, 40)
    this.isRunning = true
    this.loop()
  }

  unmount(): void {
    this.isRunning = false
    cancelAnimationFrame(this.animationId)
    this.particleSystem.reset()
  }

  // ========== 情绪场触发 ==========

  triggerEmotionField(emotion: Emotion, intensity: number): void {
    const baseVector = PRESET_VECTORS[emotion]
    const vector = blendVector(baseVector, intensity)
    const params = computeFieldParams(vector, emotion)

    this.fieldParams = params
    this.currentEmotionLabel = EMOTION_LABELS[emotion]
    this.particleSystem.setField(params)
    this.particleSystem.reset()

    const cx = this.w / 2
    const cy = this.h / 2
    this.particleSystem.spawn(cx, cy, params)
  }

  // ========== Canvas 尺寸 ==========

  private resize(canvas: HTMLCanvasElement): void {
    const dpr = window.devicePixelRatio || 1
    this.w = window.innerWidth
    this.h = window.innerHeight
    canvas.width = this.w * dpr
    canvas.height = this.h * dpr
    canvas.style.width = this.w + "px"
    canvas.style.height = this.h + "px"
    if (this.ctx) {
      this.ctx.scale(dpr, dpr)
    }
  }

  // ========== 共享渲染核心 ==========

  /** 渲染一帧到指定 context（用于 live loop 和导出） */
  private renderFrame(
    ctx: CanvasRenderingContext2D,
    renderW: number,
    renderH: number,
    time: number,
    skipUpdate: boolean = false,
  ): void {
    // 暗底
    ctx.fillStyle = "#0b0b10"
    ctx.fillRect(0, 0, renderW, renderH)

    // Layer 1: 基础场
    if (this.fieldParams) {
      drawFieldBackground(ctx, renderW, renderH, this.fieldParams, time)
    }

    // Layer 2a: 环境粒子
    drawAmbientParticles(ctx, renderW, renderH, this.ambientParticles, time)

    // Layer 2b: 情绪粒子（仅 live 循环做物理更新，导出跳过避免改状态）
    if (this.fieldParams) {
      if (!skipUpdate) {
        this.particleSystem.update(ctx, renderW, renderH, time)
      }
      this.particleSystem.draw(ctx)
    }

    // Layer 3: 干扰层
    if (this.fieldParams) {
      applyDisturbanceLayer(
        ctx, renderW, renderH,
        this.fieldParams.fieldType,
        this.fieldParams.jitter,
        this.fieldParams.blurAmount,
        time,
      )
    }

    // 情绪标签
    if (this.currentEmotionLabel && this.fieldParams) {
      ctx.save()
      ctx.globalAlpha = 0.25 + 0.08 * Math.sin(time * 0.001)
      ctx.fillStyle = this.fieldParams.primaryColor
      ctx.font = `bold ${Math.min(36, renderW * 0.04)}px "PingFang SC", "Microsoft YaHei", sans-serif`
      ctx.textAlign = "center"
      ctx.shadowColor = this.fieldParams.primaryColor
      ctx.shadowBlur = 12
      ctx.fillText(this.currentEmotionLabel, renderW / 2, renderH * 0.85)
      ctx.restore()
    }
  }

  // ========== 主循环 ==========

  private loop(): void {
    if (!this.isRunning) return

    const ctx = this.ctx!
    const time = Date.now() - this.startTime
    this.frameCount++

    // 持续补充粒子
    if (this.fieldParams) {
      this.particleSystem.autoRespawn(this.w / 2, this.h / 2, this.frameCount)
    }

    // 震动偏移
    const shake = this.fieldParams
      ? getShakeOffset(this.fieldParams.fieldType, time)
      : { x: 0, y: 0 }

    ctx.save()
    if (shake.x !== 0 || shake.y !== 0) {
      ctx.translate(shake.x, shake.y)
    }
    ctx.clearRect(-10, -10, this.w + 20, this.h + 20)

    this.renderFrame(ctx, this.w, this.h, time, false)

    ctx.restore()

    this.animationId = requestAnimationFrame(() => this.loop())
  }

  // ========== 导出 ==========

  /** 导出当前帧 PNG，1:1 逻辑分辨率，颜色/粒子与屏幕完全一致 */
  exportFrame(): string {
    const logicalW = this.w
    const logicalH = this.h

    const offscreen = document.createElement("canvas")
    offscreen.width = logicalW
    offscreen.height = logicalH
    const octx = offscreen.getContext("2d")!

    const time = Date.now() - this.startTime

    // 跳过粒子物理更新，只绘当前状态
    this.renderFrame(octx, logicalW, logicalH, time, true)

    return offscreen.toDataURL("image/png")
  }
}
