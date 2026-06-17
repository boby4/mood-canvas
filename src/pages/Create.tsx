import { useRef, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import MoodCanvas from "../components/MoodCanvas"
import ExportPanel from "../components/ExportPanel"
import { useMoodStore } from "../store/moodStore"
import { EMOTION_LABELS, getEmotionDisplay } from "../core/emotionEngine"
import type { Emotion } from "../core/emotionEngine"
import { CanvasEngine } from "../core/canvasEngine"

export default function Create() {
  const navigate = useNavigate()
  const engineRef = useRef<CanvasEngine | null>(null)
  const { currentEmotion, intensity, note, setEmotion, setIntensity, setNote, addRecord } =
    useMoodStore()

  const handleExport = useCallback((): string | undefined => {
    return engineRef.current?.exportFrame()
  }, [])

  return (
    <div className="page create-page">
      <MoodCanvas
        onEngineReady={(engine) => {
          engineRef.current = engine
        }}
      />

      <div className="create-content">
        <motion.div
          className="glass-card create-header"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <button className="btn-back" onClick={() => navigate("/")}>
            ← 返回
          </button>
          <ExportPanel onExport={handleExport} />
        </motion.div>

        {/* quick emotion trigger */}
        {!currentEmotion && (
          <motion.div
            className="glass-card create-selector"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <p className="create-prompt">选择一个情绪来生成可视化画布</p>
            <div className="emotion-grid">
              {(Object.keys(EMOTION_LABELS) as Emotion[]).map((e) => {
                const display = getEmotionDisplay(e)
                return (
                  <motion.button
                    key={e}
                    className={`emotion-btn ${currentEmotion === e ? "active" : ""}`}
                    style={{
                      borderColor: currentEmotion === e ? display.color : "rgba(255,255,255,0.1)",
                      boxShadow:
                        currentEmotion === e ? `0 0 20px ${display.color}40` : "none",
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setEmotion(e)}
                  >
                    <span>{EMOTION_LABELS[e]}</span>
                  </motion.button>
                )
              })}
            </div>

            {currentEmotion && (() => {
              const e = currentEmotion as Emotion
              const display = getEmotionDisplay(e)
              return (
              <motion.div
                className="intensity-section"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <label className="intensity-label">
                  情绪强度: <strong>{intensity}%</strong>
                </label>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={intensity}
                  onChange={(val) => setIntensity(Number(val.target.value))}
                  className="intensity-slider"
                  style={{ accentColor: display.color }}
                />
                <textarea
                  className="note-input"
                  placeholder="写点备注（可选）..."
                  value={note}
                  onChange={(val) => setNote(val.target.value)}
                  rows={2}
                  maxLength={140}
                />
                <motion.button
                  className="btn-primary"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={addRecord}
                >
                  记录情绪
                </motion.button>
              </motion.div>
              )
            })()}
          </motion.div>
        )}

        {currentEmotion && (() => {
          const e = currentEmotion as Emotion
          const display = getEmotionDisplay(e)
          return (
          <motion.div
            className="glass-card current-emotion-display"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              borderColor: display.color + "60",
            }}
          >
            <span className="current-emotion-badge" style={{ color: display.color }}>
              {EMOTION_LABELS[e]}
            </span>
            <span className="current-intensity">强度: {intensity}%</span>
          </motion.div>
          )
        })()}
      </div>
    </div>
  )
}
