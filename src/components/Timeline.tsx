import { motion, AnimatePresence } from "framer-motion"
import { getEmotionDisplay } from "../core/emotionEngine"
import { useMoodStore } from "../store/moodStore"
import type { Emotion, MoodRecord } from "../core/emotionEngine"

interface Props {
  onItemClick?: (record: MoodRecord) => void
}

export default function Timeline({ onItemClick }: Props) {
  const { history } = useMoodStore()

  if (history.length === 0) {
    return (
      <div className="timeline-empty">
        <p className="empty-icon">📝</p>
        <p>还没有情绪记录</p>
        <p className="empty-hint">回到首页记录你的第一份情绪日记</p>
      </div>
    )
  }

  // group by date
  const grouped: Record<string, typeof history> = {}
  for (const record of history) {
    if (!grouped[record.date]) grouped[record.date] = []
    grouped[record.date].push(record)
  }

  const dates = Object.keys(grouped).sort().reverse()

  return (
    <div className="timeline">
      <AnimatePresence>
        {dates.map((date) => (
          <motion.div
            key={date}
            className="timeline-group"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <h3 className="timeline-date">{date}</h3>
            <div className="timeline-items">
              {grouped[date].map((record) => {
                const display = getEmotionDisplay(record.emotion as Emotion)
                const time = new Date(record.timestamp).toLocaleTimeString("zh-CN", {
                  hour: "2-digit",
                  minute: "2-digit",
                })
                return (
                  <motion.div
                    key={record.id}
                    className="timeline-item"
                    style={{
                      borderLeftColor: display.color,
                    }}
                    whileHover={{ x: 6, backgroundColor: "rgba(255,255,255,0.08)" }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onItemClick?.(record)}
                  >
                    <div className="timeline-item-header">
                      <span
                        className="timeline-emotion-badge"
                        style={{ background: display.color }}
                      >
                        {record.emotion}
                      </span>
                      <span className="timeline-time">{time}</span>
                      <span className="timeline-intensity">
                        强度: {record.intensity}%
                      </span>
                    </div>
                    {record.note && (
                      <p className="timeline-note">{record.note}</p>
                    )}
                    <div className="timeline-bar-wrapper">
                      <div
                        className="timeline-intensity-bar"
                        style={{
                          width: `${record.intensity}%`,
                          background: display.color,
                        }}
                      />
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
