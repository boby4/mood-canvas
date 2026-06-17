export function exportCanvasToPNG(canvas: HTMLCanvasElement): void {
  const link = document.createElement("a")
  link.download = `mood-canvas-${Date.now()}.png`
  link.href = canvas.toDataURL("image/png")
  link.click()
}

export function shareCanvas(canvas: HTMLCanvasElement): void {
  canvas.toBlob(async (blob) => {
    if (!blob) return

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
      exportCanvasToPNG(canvas)
    }
  }, "image/png")
}
