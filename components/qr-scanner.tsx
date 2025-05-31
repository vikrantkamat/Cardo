"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Camera, CheckCircle2, XCircle, AlertCircle, RotateCcw, Gift, User, RefreshCw } from "lucide-react"
import { supabase } from "@/lib/supabase"

interface QrScannerProps {
  onScan: (data: string) => void
  onRedemptionScan?: (redemptionData: any) => void
}

export function QrScanner({ onScan, onRedemptionScan }: QrScannerProps) {
  const [isScanning, setIsScanning] = useState(false)
  const [scanResult, setScanResult] = useState<{
    success: boolean
    message: string
    type?: string
    reward?: string
  } | null>(null)
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [facingMode, setFacingMode] = useState<"user" | "environment">("environment")
  const [isProcessing, setIsProcessing] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()
  const lastScanTime = useRef<number>(0)

  const scanQRCode = useCallback(async () => {
    const video = videoRef.current
    const canvas = canvasRef.current

    if (!video || !canvas || video.readyState !== video.HAVE_ENOUGH_DATA || isProcessing) {
      if (isScanning) {
        animationRef.current = requestAnimationFrame(scanQRCode)
      }
      return
    }

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas size to match video
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    // Draw video frame to canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

    // Get image data
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)

    try {
      // Import jsQR dynamically
      const jsQR = (await import("jsqr")).default

      // Scan for QR code
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: "dontInvert",
      })

      if (code) {
        const now = Date.now()
        // Prevent duplicate scans within 2 seconds
        if (now - lastScanTime.current < 2000) {
          if (isScanning) {
            animationRef.current = requestAnimationFrame(scanQRCode)
          }
          return
        }

        lastScanTime.current = now
        setIsProcessing(true)
        console.log("QR Code detected:", code.data)

        // Check if it's a redemption QR code
        if (code.data.startsWith("redeem-")) {
          try {
            const redemptionJson = code.data.replace("redeem-", "")
            const redemptionData = JSON.parse(redemptionJson)

            if (onRedemptionScan) {
              // Validate the redemption token
              await validateRedemptionToken(redemptionData)
            } else {
              handleScanSuccess(code.data, "redemption")
            }
          } catch (error: any) {
            console.error("Error parsing redemption data:", error)
            handleScanError(error.message || "Invalid redemption QR code")
          }
        } else {
          // Regular user QR code
          handleScanSuccess(code.data, "user")
          onScan(code.data)
        }
        return
      }
    } catch (error) {
      console.error("Error scanning QR code:", error)
    }

    // Continue scanning if no code found
    if (isScanning) {
      animationRef.current = requestAnimationFrame(scanQRCode)
    }
  }, [isScanning, isProcessing, onScan, onRedemptionScan])

  // Validate redemption token
  const validateRedemptionToken = async (redemptionData: any) => {
    try {
      const { token, userId, businessId, punchcardId, reward } = redemptionData

      if (!token) {
        throw new Error("Invalid redemption code: missing token")
      }

      // Check if token exists and is valid
      const { data: tokenData, error: tokenError } = await supabase
        .from("redemption_tokens")
        .select("*")
        .eq("token", token)
        .single()

      if (tokenError || !tokenData) {
        throw new Error("Invalid or expired redemption code")
      }

      // Check if token is already used
      if (tokenData.is_used) {
        throw new Error("This redemption code has already been used")
      }

      // Check if token is expired
      const expiryTime = new Date(tokenData.expires_at)
      if (expiryTime < new Date()) {
        throw new Error("This redemption code has expired")
      }

      // Mark token as used
      const { error: updateError } = await supabase
        .from("redemption_tokens")
        .update({ is_used: true, used_at: new Date().toISOString() })
        .eq("token", token)

      if (updateError) {
        throw new Error("Error processing redemption")
      }

      // Process the redemption
      handleRedemptionScanSuccess(redemptionData)
      if (onRedemptionScan) {
        onRedemptionScan(redemptionData)
      }
    } catch (error: any) {
      handleScanError(error.message || "Error validating redemption")
    }
  }

  const startScanner = async () => {
    setScanResult(null)
    setIsScanning(true)
    setIsProcessing(false)

    try {
      const constraints = {
        video: {
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints)
      setStream(mediaStream)
      setHasPermission(true)

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream

        // Start scanning when video is ready
        videoRef.current.onloadedmetadata = () => {
          if (videoRef.current) {
            videoRef.current.play()
            scanQRCode()
          }
        }
      }
    } catch (error) {
      console.error("Error accessing camera:", error)
      setHasPermission(false)
      setIsScanning(false)
      setScanResult({
        success: false,
        message: "Camera access denied. Please allow camera permissions and try again.",
      })
    }
  }

  const stopScanner = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
    }

    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
      setStream(null)
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null
    }

    setIsScanning(false)
    setIsProcessing(false)
  }

  const handleScanSuccess = (data: string, type = "user") => {
    stopScanner()
    setScanResult({
      success: true,
      message: type === "redemption" ? "Redemption QR code scanned!" : "Customer QR code scanned successfully!",
      type,
    })

    // Auto-close after 2 seconds
    setTimeout(() => {
      setScanResult(null)
    }, 2000)
  }

  const handleRedemptionScanSuccess = (redemptionData: any) => {
    stopScanner()
    setScanResult({
      success: true,
      message: `Redemption successful!`,
      type: "redemption",
      reward: redemptionData.reward,
    })

    // Auto-close after 3 seconds
    setTimeout(() => {
      setScanResult(null)
    }, 3000)
  }

  const handleScanError = (message: string) => {
    stopScanner()
    setScanResult({ success: false, message })

    // Auto-close after 3 seconds
    setTimeout(() => {
      setScanResult(null)
    }, 3000)
  }

  const switchCamera = () => {
    stopScanner()
    setFacingMode(facingMode === "user" ? "environment" : "user")
    setTimeout(() => {
      startScanner()
    }, 100)
  }

  useEffect(() => {
    return () => {
      stopScanner()
    }
  }, [])

  useEffect(() => {
    if (isScanning) {
      scanQRCode()
    }
  }, [isScanning, scanQRCode])

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-full max-w-md aspect-square mb-4">
        {isScanning ? (
          <>
            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover rounded-lg" />
            <canvas ref={canvasRef} className="hidden" />

            {/* Enhanced scanning overlay */}
            <div className="absolute inset-0 border-2 border-dashed border-blue-500 rounded-lg pointer-events-none animate-pulse">
              <div className="absolute inset-4 border-2 border-blue-500 rounded-md">
                {/* Animated corner indicators */}
                <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-blue-500 animate-pulse"></div>
                <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-blue-500 animate-pulse delay-100"></div>
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-blue-500 animate-pulse delay-200"></div>
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-blue-500 animate-pulse delay-300"></div>

                {/* Center scanning line */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-blue-500 to-transparent animate-pulse"></div>
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-lg text-sm backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                Scanning for QR codes...
              </div>
            </div>

            {/* Camera switch button */}
            <Button
              variant="outline"
              size="icon"
              className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm hover:bg-white"
              onClick={switchCamera}
            >
              <RotateCcw className="h-4 w-4" />
            </Button>

            {/* Processing indicator */}
            {isProcessing && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
                <div className="bg-white rounded-lg p-4 flex items-center gap-3">
                  <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-sm font-medium">Processing...</span>
                </div>
              </div>
            )}
          </>
        ) : (
          <Card className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 rounded-lg border-2 border-dashed border-slate-300">
            {scanResult ? (
              <div className="text-center p-6">
                {scanResult.success ? (
                  <>
                    <div className="relative mb-4">
                      <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto" />
                      {scanResult.type === "redemption" && (
                        <Gift className="h-6 w-6 text-green-600 absolute -top-1 -right-1 bg-white rounded-full p-1" />
                      )}
                      {scanResult.type === "user" && (
                        <User className="h-6 w-6 text-blue-600 absolute -top-1 -right-1 bg-white rounded-full p-1" />
                      )}
                    </div>
                    <p className="text-lg font-medium text-green-800">{scanResult.message}</p>

                    {scanResult.type === "redemption" && scanResult.reward && (
                      <div className="mt-2 bg-green-50 border border-green-200 rounded-lg p-3">
                        <p className="text-green-800 font-medium">Reward: {scanResult.reward}</p>
                      </div>
                    )}

                    <div className="mt-2 flex justify-center">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse delay-100"></div>
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse delay-200"></div>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                    <p className="text-lg font-medium text-red-800">{scanResult.message}</p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-4 border-red-200 text-red-600 hover:bg-red-50"
                      onClick={() => setScanResult(null)}
                    >
                      <RefreshCw className="h-3 w-3 mr-1" /> Try Again
                    </Button>
                  </>
                )}
              </div>
            ) : (
              <div className="text-center p-6">
                <Camera className="h-16 w-16 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-500 font-medium">Camera preview will appear here</p>
                <p className="text-sm text-slate-400 mt-2">Point camera at QR code to scan</p>
              </div>
            )}
          </Card>
        )}
      </div>

      <div className="flex gap-4">
        {isScanning ? (
          <Button variant="outline" onClick={stopScanner} disabled={isProcessing}>
            Stop Scanner
          </Button>
        ) : (
          <Button
            onClick={startScanner}
            className="bg-gradient-to-r from-slate-600 to-blue-600 hover:from-slate-700 hover:to-blue-700 text-white"
          >
            {scanResult ? "Scan Another Code" : "Start Scanner"}
          </Button>
        )}
      </div>

      {hasPermission === false && (
        <div className="flex items-center gap-2 mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <AlertCircle className="h-4 w-4 text-red-500" />
          <p className="text-red-700 text-sm">
            Camera access denied. Please enable camera permissions in your browser settings and try again.
          </p>
        </div>
      )}

      {isScanning && (
        <div className="mt-4 text-center">
          <p className="text-sm text-slate-600">Using {facingMode === "environment" ? "back" : "front"} camera</p>
          <p className="text-xs text-slate-500 mt-1">Tap the rotate button to switch cameras</p>
        </div>
      )}
    </div>
  )
}
