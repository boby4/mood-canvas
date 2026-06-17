// ===== 情绪向量系统 =====

/** 五维情绪向量 */
export interface EmotionVector {
  valence: number   // -1 ~ +1  情绪正负（负→暖色，正→冷色）
  arousal: number   //  0 ~  1  激活程度 → 粒子速度
  tension: number   //  0 ~  1  紧张程度 → 噪声强度
  clarity: number   //  0 ~  1  清晰程度 → 模糊程度（反比）
  stability: number //  0 ~  1  稳定程度 → 随机性（反比）
}

/** 场类型 */
export type FieldType = "expansion" | "sinking" | "explosion" | "chaos" | "steady"

/** 从向量计算出的物理场参数 */
export interface FieldParameters {
  fieldType: FieldType
  primaryColor: string
  secondaryColor: string
  particleCount: number
  arousal: number         // 激活程度（保留原值用于粒子系统）
  speed: number           // arousal → speed
  expansionForce: number  // valence > 0 → 向外, valence < 0 → 向内
  gravity: number         // arousal 低时加重
  jitter: number          // tension → 抖动
  blurAmount: number      // clarity 低 → 模糊
  randomness: number      // stability 低 → 随机
}

// ===== 预设情绪 =====

export type Emotion = "happy" | "sad" | "angry" | "calm" | "anxious"

/** 预设情绪向量 */
export const PRESET_VECTORS: Record<Emotion, EmotionVector> = {
  happy:   { valence: +0.9, arousal: 0.70, tension: 0.10, clarity: 0.80, stability: 0.60 },
  sad:     { valence: -0.7, arousal: 0.15, tension: 0.30, clarity: 0.40, stability: 0.50 },
  angry:   { valence: -0.5, arousal: 0.90, tension: 0.95, clarity: 0.40, stability: 0.20 },
  calm:    { valence: +0.3, arousal: 0.10, tension: 0.05, clarity: 0.90, stability: 0.95 },
  anxious: { valence: -0.6, arousal: 0.90, tension: 0.95, clarity: 0.30, stability: 0.20 },
}

export const EMOTION_LABELS: Record<Emotion, string> = {
  happy:   "开心 😄",
  sad:     "难过 😢",
  angry:   "愤怒 😡",
  calm:    "平静 😐",
  anxious: "焦虑 😰",
}

// ===== 场参数计算 =====

/** 每类情绪的标志性颜色（物理场参数从向量推算，颜色从预设取） */
export const EMOTION_COLORS: Record<Emotion, { primary: string; secondary: string }> = {
  happy:   { primary: "#FFD700", secondary: "#FFA500" },
  sad:     { primary: "#4A90E2", secondary: "#2C5F8A" },
  angry:   { primary: "#FF3B30", secondary: "#C0392B" },
  calm:    { primary: "#6EC6FF", secondary: "#4DA8DA" },
  anxious: { primary: "#B0B0B0", secondary: "#808080" },
}

/** 将情绪向量映射为物理场参数 */
export function computeFieldParams(v: EmotionVector, emotion?: Emotion): FieldParameters {
  // 根据向量特征确定场类型
  let fieldType: FieldType
  if (v.stability > 0.7 && v.tension < 0.2) {
    fieldType = "steady"
  } else if (v.tension > 0.7 && v.arousal > 0.6) {
    fieldType = v.valence < -0.3 ? "chaos" : "explosion"
  } else if (v.valence > 0.4) {
    fieldType = "expansion"
  } else if (v.valence < -0.3 && v.arousal < 0.4) {
    fieldType = "sinking"
  } else if (v.tension > 0.5) {
    fieldType = "chaos"
  } else {
    fieldType = "expansion"
  }

  // 颜色：优先用预设，否则从 valence 推算
  const colors = emotion ? EMOTION_COLORS[emotion] : {
    primary: valenceToColor(v.valence),
    secondary: valenceToColor(v.valence * 0.7),
  }

  return {
    fieldType,
    primaryColor: colors.primary,
    secondaryColor: colors.secondary,
    particleCount: Math.floor(60 + v.arousal * 140),
    arousal: v.arousal,
    speed: 0.5 + v.arousal * 3.5,
    expansionForce: v.valence * 0.15,
    gravity: (1 - v.arousal) * 0.08,
    jitter: v.tension * 3.0,
    blurAmount: (1 - v.clarity) * 3 + (1 - v.stability) * 2,
    randomness: (1 - v.stability) * 0.3,
  }
}

function valenceToColor(valence: number): string {
  const t = (valence + 1) / 2
  const r = Math.floor(74 + t * 181)
  const g = Math.floor(144 + (t - 0.5) * 40)
  const b = Math.floor(226 - t * 176)
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`
}

// ===== 保留兼容的记录结构 =====

export interface MoodRecord {
  id: string
  emotion: Emotion
  intensity: number
  note: string
  timestamp: number
  date: string
}

export function generateMoodId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

export function getTodayDate(): string {
  return new Date().toISOString().split("T")[0]
}

/** 合成向量：从强度覆盖 arousal 维度 */
export function blendVector(base: EmotionVector, intensity: number): EmotionVector {
  return {
    ...base,
    arousal: Math.min(1, base.arousal * (intensity / 100) * 1.5),
    tension: Math.min(1, base.tension * (intensity / 100)),
  }
}

// ===== UI 显示辅助 =====

export interface EmotionDisplay {
  color: string
  secondaryColor: string
  label: string
}

export function getEmotionDisplay(emotion: Emotion): EmotionDisplay {
  const colors = EMOTION_COLORS[emotion]
  return {
    color: colors.primary,
    secondaryColor: colors.secondary,
    label: EMOTION_LABELS[emotion],
  }
}
