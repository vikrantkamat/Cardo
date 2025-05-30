"use client"

import { useEffect, useRef } from "react"

interface RedemptionQRCodeProps {
  userId: string
  businessId: string
  punchcardId: string
  reward: string
  size?: number
  primaryColor?: string
}

export function RedemptionQRCode({
  userId,
  businessId,
  punchcardId,
  reward,
  size = 200,
  primaryColor = "#10b981",
}: RedemptionQRCodeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const generateQR = async () => {
      const canvas = canvasRef.current
      if (!canvas) return

      const ctx = canvas.getContext("2d")
      if (!ctx) return

      // Import QR code library dynamically
      const QRCode = (await import("qrcode")).default

      try {
        // Create redemption QR data
        const redemptionData = {
          type: "redemption",
          userId,
          businessId,
          punchcardId,
          reward,
          timestamp: Date.now(),
        }

        const qrData = `redeem-${JSON.stringify(redemptionData)}`

        // Generate QR code as data URL
        const qrDataURL = await QRCode.toDataURL(qrData, {
          width: size,
          margin: 2,
          color: {
            dark: primaryColor,
            light: "#FFFFFF",
          },
          errorCorrectionLevel: "M",
        })

        // Create image and draw to canvas
        const img = new Image()
        img.crossOrigin = "anonymous"
        img.onload = () => {
          ctx.clearRect(0, 0, size, size)
          ctx.drawImage(img, 0, 0, size, size)

          // Add decorative border
          ctx.strokeStyle = primaryColor
          ctx.lineWidth = 4
          ctx.strokeRect(2, 2, size - 4, size - 4)

          // Add corner decorations
          const cornerSize = 20
          ctx.fillStyle = primaryColor

          // Top-left corner
          ctx.fillRect(8, 8, cornerSize, 4)
          ctx.fillRect(8, 8, 4, cornerSize)

          // Top-right corner
          ctx.fillRect(size - 28, 8, cornerSize, 4)
          ctx.fillRect(size - 12, 8, 4, cornerSize)

          // Bottom-left corner
          ctx.fillRect(8, size - 12, cornerSize, 4)
          ctx.fillRect(8, size - 28, 4, cornerSize)

          // Bottom-right corner
          ctx.fillRect(size - 28, size - 12, cornerSize, 4)
          ctx.fillRect(size - 12, size - 28, 4, cornerSize)
        }
        img.src = qrDataURL
      } catch (error) {
        console.error("Error generating redemption QR code:", error)

        // Fallback display
        ctx.clearRect(0, 0, size, size)
        ctx.fillStyle = "#ffffff"
        ctx.fillRect(0, 0, size, size)

        ctx.fillStyle = primaryColor
        ctx.font = "16px sans-serif"
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"
        ctx.fillText("REDEEM", size / 2, size / 2 - 10)
        ctx.fillText("QR CODE", size / 2, size / 2 + 10)
      }
    }

    generateQR()
  }, [userId, businessId, punchcardId, reward, size, primaryColor])

  return (
    <div className="qr-code-container flex flex-col items-center">
      <div className="relative">
        <canvas ref={canvasRef} width={size} height={size} className="rounded-lg shadow-lg" />
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center animate-pulse">
          <span className="text-white text-xs font-bold">✓</span>
        </div>
      </div>
      <p className="text-xs text-slate-500 mt-2 text-center">Redemption Code</p>
    </div>
  )
}
