"use client"

import { useEffect, useRef } from "react"

interface QRCodeProps {
  value: string
  size?: number
  primaryColor?: string
}

export function QRCode({ value, size = 200, primaryColor = "#6d28d9" }: QRCodeProps) {
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
        // Generate QR code as data URL
        const qrDataURL = await QRCode.toDataURL(value, {
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
        console.error("Error generating QR code:", error)

        // Fallback to simple pattern if QR generation fails
        ctx.clearRect(0, 0, size, size)
        ctx.fillStyle = "#ffffff"
        ctx.fillRect(0, 0, size, size)

        ctx.fillStyle = primaryColor
        ctx.font = "16px sans-serif"
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"
        ctx.fillText("QR Code", size / 2, size / 2 - 10)
        ctx.fillText("Error", size / 2, size / 2 + 10)
      }
    }

    generateQR()
  }, [value, size, primaryColor])

  return (
    <div className="qr-code-container">
      <canvas ref={canvasRef} width={size} height={size} className="rounded-lg shadow-md" />
    </div>
  )
}
