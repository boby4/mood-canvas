import { create } from "zustand"
import { Emotion, MoodRecord, generateMoodId, getTodayDate } from "../core/emotionEngine"
import { loadMoods, saveMoods } from "../utils/storage"

export type Page = "home" | "create" | "archive"

interface MoodState {
  currentEmotion: Emotion | null
  intensity: number
  note: string
  history: MoodRecord[]
  page: Page
  isExporting: boolean

  setEmotion: (e: Emotion | null) => void
  setIntensity: (v: number) => void
  setNote: (n: string) => void
  addRecord: () => void
  selectRecord: (r: MoodRecord) => void
  navigate: (p: Page) => void
  loadHistory: () => void
  setExporting: (v: boolean) => void
}

export const useMoodStore = create<MoodState>((set, get) => ({
  currentEmotion: null,
  intensity: 50,
  note: "",
  history: [],
  page: "home",
  isExporting: false,

  setEmotion: (emotion) => set({ currentEmotion: emotion }),
  setIntensity: (intensity) => set({ intensity }),
  setNote: (note) => set({ note }),

  addRecord: () => {
    const { currentEmotion, intensity, note, history } = get()
    if (!currentEmotion) return

    const record: MoodRecord = {
      id: generateMoodId(),
      emotion: currentEmotion,
      intensity,
      note,
      timestamp: Date.now(),
      date: getTodayDate(),
    }

    const updated = [record, ...history]
    set({
      history: updated,
      // 保留当前情绪，让画布能立即显示
      note: "",
      page: "create",
    })
    saveMoods(updated)
  },

  navigate: (page) => set({ page }),

  selectRecord: (record) =>
    set({
      currentEmotion: record.emotion,
      intensity: record.intensity,
      note: record.note,
      page: "create",
    }),

  loadHistory: () => {
    const data = loadMoods()
    set({ history: data })
  },

  setExporting: (isExporting) => set({ isExporting }),
}))
