import { useEffect, useRef, useCallback } from "react"
import { CanvasEngine } from "../core/canvasEngine"
import { useMoodStore } from "../store/moodStore"

interface Props {
  onCanvasReady?: (canvas: HTMLCanvasElement) => void
  onEngineReady?: (engine: CanvasEngine) => void
}

export default function MoodCanvas({ onCanvasReady, onEngineReady }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const engineRef = useRef<CanvasEngine | null>(null)
  const { currentEmotion, intensity } = useMoodStore()

  const handleResize = useCallback(() => {
    if (canvasRef.current && engineRef.current) {
      engineRef.current.unmount()
      engineRef.current = new CanvasEngine()
      engineRef.current.mount(canvasRef.current)
      onEngineReady?.(engineRef.current)
    }
  }, [onEngineReady])

  useEffect(() => {
    if (!canvasRef.current) return

    const engine = new CanvasEngine()
    engineRef.current = engine
    engine.mount(canvasRef.current)

    if (onCanvasReady) {
      onCanvasReady(canvasRef.current)
    }
    if (onEngineReady) {
      onEngineReady(engine)
    }

    window.addEventListener("resize", handleResize)

    return () => {
      engine.unmount()
      window.removeEventListener("resize", handleResize)
    }
  }, [handleResize, onCanvasReady, onEngineReady])

  // 情绪变化 → 立即触发画布（每次变化都重设场）
  useEffect(() => {
    if (!engineRef.current || !currentEmotion) return
    engineRef.current.triggerEmotionField(currentEmotion, intensity)
  }, [currentEmotion, intensity])

  return (
    <canvas
      ref={canvasRef}
      className="mood-canvas"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 0,
        pointerEvents: "none",
      }}
    />
  )
}
