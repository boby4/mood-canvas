import { BrowserRouter, Routes, Route } from "react-router-dom"
import { useEffect } from "react"
import Home from "./pages/Home"
import Create from "./pages/Create"
import Archive from "./pages/Archive"
import { useMoodStore } from "./store/moodStore"

export default function App() {
  const loadHistory = useMoodStore((s) => s.loadHistory)

  useEffect(() => {
    loadHistory()
  }, [loadHistory])

  return (
    <BrowserRouter>
      <div className="app-container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/create" element={<Create />} />
          <Route path="/archive" element={<Archive />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}
