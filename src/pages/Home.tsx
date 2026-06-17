import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import EmotionSelector from "../components/EmotionSelector"
import { useMoodStore } from "../store/moodStore"

export default function Home() {
  const navigate = useNavigate()
  const { history } = useMoodStore()

  return (
    <div className="page home-page">
      <motion.div
        className="glass-card hero-card"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="hero-title">MoodCanvas</h1>
        <p className="hero-subtitle">用视觉记录情绪，而不是文字</p>
      </motion.div>

      <motion.div
        className="glass-card"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.15 }}
      >
        <EmotionSelector />
      </motion.div>

      <motion.div
        className="nav-row"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <button className="btn-nav" onClick={() => navigate("/create")}>
          🎨 查看画布
        </button>
        <button className="btn-nav" onClick={() => navigate("/archive")}>
          {history.length > 0 ? `📅 情绪时间轴 (${history.length})` : "📅 情绪时间轴"}
        </button>
      </motion.div>
    </div>
  )
}
