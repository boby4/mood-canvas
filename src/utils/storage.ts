import { MoodRecord } from "../core/emotionEngine"

const KEY = "mood_canvas_data"

export function saveMoods(data: MoodRecord[]): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(data))
  } catch {
    // storage full or unavailable
  }
}

export function loadMoods(): MoodRecord[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    return JSON.parse(raw) as MoodRecord[]
  } catch {
    return []
  }
}

export function clearMoods(): void {
  localStorage.removeItem(KEY)
}
