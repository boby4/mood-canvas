import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import Timeline from "../components/Timeline"
import { useMoodStore } from "../store/moodStore"
import type { MoodRecord } from "../core/emotionEngine"

export default function Archive() {
  const navigate = useNavigate()
  const selectRecord = useMoodStore((s) => s.selectRecord)

  const handleItemClick = (record: MoodRecord) => {
    selectRecord(record)
    navigate("/create")
  }

  return (
    <div className="page archive-page">
      <motion.div
        className="glass-card archive-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <button className="btn-back" onClick={() => navigate("/")}>
          ← 返回
        </button>
        <h2 className="archive-title">情绪时间轴</h2>
      </motion.div>

      <motion.div
        className="glass-card timeline-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <p className="timeline-hint">点击任一记录可在画布中回放该情绪</p>
        <Timeline onItemClick={handleItemClick} />
      </motion.div>
    </div>
  )
}
