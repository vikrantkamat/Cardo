"use client"

import { useEffect, useRef, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"

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
  const [redemptionToken, setRedemptionToken] = useState<string>("")
  const [isGenerating, setIsGenerating] = useState(true)
  const [isExpired, setIsExpired] = useState(false)
  const [expiryTime, setExpiryTime] = useState<Date | null>(null)
  const [remainingTime, setRemainingTime] = useState<string>("5:00")
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // Create the redemption_tokens table if it doesn't exist
  const ensureRedemptionTokensTable = async () => {
    try {
      // Check if table exists
      const { count, error } = await supabase
        .from("redemption_tokens")
        .select("*", { count: "exact", head: true })
        .limit(1)

      if (error && error.code === "42P01") {
        // Table doesn't exist, create it
        await supabase.rpc("create_redemption_tokens_table").catch((err) => {
          console.error("Error creating table via RPC:", err)
          // Fallback: create table directly
          return supabase.query(`
            CREATE TABLE IF NOT EXISTS redemption_tokens (
              id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
              token TEXT NOT NULL UNIQUE,
              user_id UUID NOT NULL,
              business_id UUID NOT NULL,
              punchcard_id UUID NOT NULL,
              reward TEXT NOT NULL,
              created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
              expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
              is_used BOOLEAN DEFAULT FALSE,
              used_at TIMESTAMP WITH TIME ZONE
            )
          `)
        })
      }
    } catch (err) {
      console.error("Error checking/creating redemption_tokens table:", err)
    }
  }

  // Generate a unique token for this redemption
  useEffect(() => {
    const generateToken = async () => {
      setIsGenerating(true)
      console.log("Generating redemption token...")

      try {
        // Ensure table exists
        await ensureRedemptionTokensTable()

        // Create a unique token
        const token = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`
        console.log("Generated token:", token)

        // Set expiry time (5 minutes from now)
        const expiry = new Date()
        expiry.setMinutes(expiry.getMinutes() + 5)
        setExpiryTime(expiry)
        console.log("Expiry time set to:", expiry)

        // Store the token in the database
        const { error } = await supabase.from("redemption_tokens").insert({
          token,
          user_id: userId,
          business_id: businessId,
          punchcard_id: punchcardId,
          reward,
          expires_at: expiry.toISOString(),
          is_used: false,
        })

        if (error) {
          console.error("Error storing redemption token:", error)
          return
        }

        console.log("Token stored successfully")
        setRedemptionToken(token)

        // Set up expiry timer
        if (timerRef.current) {
          clearInterval(timerRef.current)
        }

        timerRef.current = setInterval(() => {
          const now = new Date()
          const diffMs = expiry.getTime() - now.getTime()

          if (diffMs <= 0) {
            setIsExpired(true)
            setRemainingTime("0:00")
            if (timerRef.current) clearInterval(timerRef.current)
          } else {
            const minutes = Math.floor(diffMs / 60000)
            const seconds = Math.floor((diffMs % 60000) / 1000)
            setRemainingTime(`${minutes}:${seconds.toString().padStart(2, "0")}`)
          }
        }, 1000)
      } catch (error) {
        console.error("Error generating redemption token:", error)
      } finally {
        setIsGenerating(false)
      }
    }

    generateToken()

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [userId, businessId, punchcardId, reward])

  useEffect(() => {
    const generateQR = async () => {
      if (!redemptionToken) return

      const canvas = canvasRef.current
      if (!canvas) return

      const ctx = canvas.getContext("2d")
      if (!ctx) return

      try {
        // Import QR code library dynamically
        const QRCode = (await import("qrcode")).default

        console.log("Generating QR code with token:", redemptionToken)

        // Create redemption QR data with token
        const redemptionData = {
          type: "redemption",
          userId,
          businessId,
          punchcardId,
          reward,
          token: redemptionToken,
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
  }, [userId, businessId, punchcardId, reward, size, primaryColor, redemptionToken])

  const handleRefresh = async () => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }
    setRedemptionToken("")
    setIsExpired(false)
    setExpiryTime(null)
    setIsGenerating(true)

    // Generate new token
    const token = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`

    // Set expiry time (5 minutes from now)
    const expiry = new Date()
    expiry.setMinutes(expiry.getMinutes() + 5)
    setExpiryTime(expiry)

    // Store the token in the database
    try {
      const { error } = await supabase.from("redemption_tokens").insert({
        token,
        user_id: userId,
        business_id: businessId,
        punchcard_id: punchcardId,
        reward,
        expires_at: expiry.toISOString(),
        is_used: false,
      })

      if (error) {
        console.error("Error storing redemption token:", error)
        return
      }

      setRedemptionToken(token)
      setIsGenerating(false)

      // Set up expiry timer
      timerRef.current = setInterval(() => {
        const now = new Date()
        const diffMs = expiry.getTime() - now.getTime()

        if (diffMs <= 0) {
          setIsExpired(true)
          setRemainingTime("0:00")
          if (timerRef.current) clearInterval(timerRef.current)
        } else {
          const minutes = Math.floor(diffMs / 60000)
          const seconds = Math.floor((diffMs % 60000) / 1000)
          setRemainingTime(`${minutes}:${seconds.toString().padStart(2, "0")}`)
        }
      }, 1000)
    } catch (error) {
      console.error("Error refreshing token:", error)
      setIsGenerating(false)
    }
  }

  return (
    <div className="qr-code-container flex flex-col items-center">
      <div className="relative">
        {isGenerating ? (
          <div
            className="w-full h-full flex items-center justify-center rounded-lg bg-gray-50"
            style={{ width: size, height: size }}
          >
            <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: primaryColor }}></div>
          </div>
        ) : isExpired ? (
          <div
            className="w-full h-full flex flex-col items-center justify-center rounded-lg bg-gray-100"
            style={{ width: size, height: size }}
          >
            <div className="text-red-500 text-lg mb-2">Expired</div>
            <Button
              size="sm"
              className="px-3 py-1 rounded-md text-sm text-white flex items-center gap-1"
              style={{ backgroundColor: primaryColor }}
              onClick={handleRefresh}
            >
              <RefreshCw className="h-3 w-3" /> Generate New
            </Button>
          </div>
        ) : (
          <>
            <canvas ref={canvasRef} width={size} height={size} className="rounded-lg shadow-lg" />
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center animate-pulse">
              <span className="text-white text-xs font-bold">✓</span>
            </div>
          </>
        )}
      </div>
      <div className="mt-2 text-center">
        <p className="text-xs text-slate-500">Redemption Code</p>
        <p className="text-xs font-medium mt-1" style={{ color: isExpired ? "red" : primaryColor }}>
          {isExpired ? "Expired" : `Expires in: ${remainingTime}`}
        </p>
      </div>
    </div>
  )
}
