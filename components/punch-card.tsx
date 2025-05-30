"use client"

import { useEffect, useRef } from "react"
import { cn } from "@/lib/utils"

interface PunchCardProps {
  punches: number
  totalPunches: number
  primaryColor?: string
}

export function PunchCard({ punches, totalPunches, primaryColor = "#6d28d9" }: PunchCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const width = canvas.width
    const height = canvas.height

    // Clear canvas
    ctx.clearRect(0, 0, width, height)

    // Calculate punch positions
    const punchSize = Math.min(width, height) * 0.18
    const rows = Math.ceil(totalPunches / 5)
    const cols = Math.min(totalPunches, 5)

    const horizontalGap = (width - cols * punchSize) / (cols + 1)
    const verticalGap = (height - rows * punchSize) / (rows + 1)

    // Draw punch circles
    let punchCount = 0
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        if (punchCount >= totalPunches) break

        const x = horizontalGap + col * (punchSize + horizontalGap) + punchSize / 2
        const y = verticalGap + row * (punchSize + verticalGap) + punchSize / 2

        // Draw circle
        ctx.beginPath()
        ctx.arc(x, y, punchSize / 2, 0, 2 * Math.PI)

        // Fill based on whether this punch is completed
        if (punchCount < punches) {
          // Punched
          ctx.fillStyle = primaryColor
          ctx.fill()

          // Draw a stamp-like effect
          ctx.fillStyle = "#ffffff"
          ctx.font = `${punchSize * 0.5}px sans-serif`
          ctx.textAlign = "center"
          ctx.textBaseline = "middle"
          ctx.fillText("✓", x, y)
        } else {
          // Not punched yet
          ctx.fillStyle = "#f3f4f6" // Light gray
          ctx.fill()
          ctx.strokeStyle = "#d1d5db" // Border
          ctx.lineWidth = 1
          ctx.stroke()
        }

        punchCount++
      }
    }

    // Add a decorative border
    ctx.strokeStyle = `${primaryColor}40`
    ctx.lineWidth = 5
    ctx.strokeRect(0, 0, width, height)
  }, [punches, totalPunches, primaryColor])

  return (
    <div className="flex flex-col items-center">
      <div className={cn("relative mb-2 p-1 rounded-lg bg-white shadow-sm")}>
        <canvas ref={canvasRef} width={300} height={150} className="rounded-md" />
      </div>
      <p className="text-sm font-medium" style={{ color: primaryColor }}>
        {punches} / {totalPunches} punches collected
      </p>
    </div>
  )
}
