import { motion } from "framer-motion"
import { Emotion, EMOTION_LABELS, getEmotionDisplay } from "../core/emotionEngine"
import { useMoodStore } from "../store/moodStore"

const emotions: Emotion[] = ["happy", "sad", "angry", "calm", "anxious"]

export default function EmotionSelector() {
  const { currentEmotion, intensity, note, setEmotion, setIntensity, setNote, addRecord } =
    useMoodStore()

  return (
    <div className="emotion-selector">
      <h2 className="section-title">选择今天的情绪</h2>

      <div className="emotion-grid">
        {emotions.map((e) => {
          const display = getEmotionDisplay(e)
          const isActive = currentEmotion === e
          return (
            <motion.button
              key={e}
              className={`emotion-btn ${isActive ? "active" : ""}`}
              style={{
                borderColor: isActive ? display.color : "rgba(255,255,255,0.1)",
                boxShadow: isActive ? `0 0 20px ${display.color}40` : "none",
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setEmotion(e)}
            >
              <span className="emotion-label">{EMOTION_LABELS[e]}</span>
              <span
                className="emotion-dot"
                style={{ background: display.color }}
              />
            </motion.button>
          )
        })}
      </div>

      {currentEmotion && (
        <motion.div
          className="intensity-section"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <label className="intensity-label">
            情绪强度: <strong>{intensity}%</strong>
          </label>
          <input
            type="range"
            min={0}
            max={100}
            value={intensity}
            onChange={(e) => setIntensity(Number(e.target.value))}
            className="intensity-slider"
            style={{
              accentColor: getEmotionDisplay(currentEmotion).color,
            }}
          />

          <textarea
            className="note-input"
            placeholder="写点备注（可选）..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
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
      )}
    </div>
  )
}
