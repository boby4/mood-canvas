import { motion } from "framer-motion"
import { useMoodStore } from "../store/moodStore"

interface Props {
  onExport: () => string | undefined
}

export default function ExportPanel({ onExport }: Props) {
  const { isExporting, setExporting } = useMoodStore()

  const handleExport = () => {
    const dataUrl = onExport()
    if (!dataUrl) return

    const link = document.createElement("a")
    link.download = `mood-canvas-${Date.now()}.png`
    link.href = dataUrl
    link.click()
  }

  const handleShare = async () => {
    const dataUrl = onExport()
    if (!dataUrl) return

    const response = await fetch(dataUrl)
    const blob = await response.blob()
    const file = new File([blob], `mood-canvas-${Date.now()}.png`, {
      type: "image/png",
    })

    if (navigator.share && navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({
          title: "MoodCanvas - 情绪可视化日记",
          text: "看看我的情绪画布！",
          files: [file],
        })
      } catch {
        // user cancelled
      }
    } else {
      handleExport()
    }
  }

  return (
    <div className="export-section">
      <motion.button
        className="btn-export"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setExporting(!isExporting)}
      >
        {isExporting ? "关闭导出" : "导出 / 分享"}
      </motion.button>

      {isExporting && (
        <motion.div
          className="export-options"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <button className="btn-option" onClick={handleExport}>
            <span className="option-icon">🖼️</span>
            <span>保存 PNG</span>
          </button>
          <button className="btn-option" onClick={handleShare}>
            <span className="option-icon">🔗</span>
            <span>分享</span>
          </button>
        </motion.div>
      )}
    </div>
  )
}
