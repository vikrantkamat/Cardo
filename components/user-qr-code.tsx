"use client"

import { useEffect, useRef } from "react"

interface UserQRCodeProps {
  userId: string
  size?: number
  primaryColor?: string
}

export function UserQRCode({ userId, size = 200, primaryColor = "#6d28d9" }: UserQRCodeProps) {
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
        // Create QR data with user ID
        const qrData = `user-${userId}`

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
        }
        img.src = qrDataURL
      } catch (error) {
        console.error("Error generating user QR code:", error)

        // Fallback display
        ctx.clearRect(0, 0, size, size)
        ctx.fillStyle = "#ffffff"
        ctx.fillRect(0, 0, size, size)

        ctx.fillStyle = primaryColor
        ctx.font = "16px sans-serif"
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"
        ctx.fillText("USER QR", size / 2, size / 2 - 10)
        ctx.fillText("CODE", size / 2, size / 2 + 10)
      }
    }

    generateQR()
  }, [userId, size, primaryColor])

  return (
    <div className="qr-code-container flex flex-col items-center">
      <canvas ref={canvasRef} width={size} height={size} className="rounded-lg shadow-md" />
      <p className="text-xs text-gray-500 mt-2 text-center">User ID: {userId.slice(0, 8)}...</p>
    </div>
  )
}
