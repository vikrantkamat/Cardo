"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Gift, ArrowLeft, Sparkles } from "lucide-react"
import { RedemptionQRCode } from "./redemption-qr-code"

interface PunchCardProps {
  punches: number
  totalPunches: number
  primaryColor?: string
  businessName: string
  businessType: string
  reward: string
  onPunchClick?: () => void
  businessId?: string
  userId?: string
  punchcardId?: string
}

export function PunchCard({
  punches,
  totalPunches,
  primaryColor = "#6d28d9",
  businessName,
  businessType,
  reward,
  onPunchClick,
  businessId,
  userId,
  punchcardId,
}: PunchCardProps) {
  const [isFlipped, setIsFlipped] = useState(false)
  const [showRedemption, setShowRedemption] = useState(false)
  const [hasFlippedOnce, setHasFlippedOnce] = useState(false)

  const progress = (punches / totalPunches) * 100
  const canRedeem = punches >= totalPunches

  useEffect(() => {
    if (!hasFlippedOnce) {
      const timer = setTimeout(() => {
        setIsFlipped(true)
        setHasFlippedOnce(true)
        setTimeout(() => setIsFlipped(false), 600)
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [hasFlippedOnce])

  const handleCardClick = () => {
    if (!showRedemption) {
      setIsFlipped(!isFlipped)
      if (onPunchClick) onPunchClick()
    }
  }

  const handleRedeemClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setShowRedemption(true)
  }

  const handleBackClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setShowRedemption(false)
  }

  const getBusinessIcon = () => {
    switch (businessType.toLowerCase()) {
      case "cafe":
        return "☕"
      case "bakery":
        return "🥐"
      case "juice":
        return "🥤"
      case "restaurant":
        return "🍽️"
      case "retail":
        return "🛍️"
      default:
        return "⭐"
    }
  }

  if (showRedemption) {
    if (!userId || !businessId || !punchcardId) {
      return (
        <div className="w-80 h-48 bg-white rounded-xl shadow-lg flex items-center justify-center">
          <div className="text-center p-4">
            <p className="text-red-500 font-medium mb-2">Missing information</p>
            <p className="text-sm text-gray-600">Cannot generate redemption code</p>
            <Button variant="outline" size="sm" onClick={handleBackClick} className="mt-3">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
          </div>
        </div>
      )
    }

    return (
      <div className="w-80 h-48 perspective-1000">
        <Card className="w-full h-full bg-white border-0 shadow-xl rounded-2xl overflow-hidden">
          <CardContent className="p-6 h-full flex flex-col items-center justify-center relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBackClick}
              className="absolute top-2 left-2 text-slate-600 hover:text-slate-800"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Button>

            <div className="text-center mb-4">
              <h3 className="font-bold text-lg text-slate-800 mb-1">Redeem Your Reward</h3>
              <p className="text-sm text-slate-600">Show this QR code to the business</p>
            </div>

            <RedemptionQRCode
              userId={userId}
              businessId={businessId}
              punchcardId={punchcardId}
              reward={reward}
              size={120}
              primaryColor={primaryColor}
            />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="w-80 h-48 perspective-1000">
      <div
        className={`relative w-full h-full transition-transform duration-700 transform-style-preserve-3d cursor-pointer ${
          isFlipped ? "rotate-y-180" : ""
        }`}
        onClick={handleCardClick}
      >
        {/* Front Side */}
        <Card
          className="absolute inset-0 w-full h-full backface-hidden border-0 shadow-xl rounded-2xl overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${primaryColor}15 0%, ${primaryColor}25 100%)`,
          }}
        >
          <CardContent className="p-6 h-full flex flex-col justify-between relative">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-lg"
                  style={{ backgroundColor: `${primaryColor}20` }}
                >
                  {getBusinessIcon()}
                </div>
                <span className="text-xs font-medium text-slate-600">LOYALTY CARD</span>
              </div>
              <div className="w-6 h-4 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-sm"></div>
            </div>

            {/* Punch Grid */}
            <div className="flex-1 flex items-center justify-center">
              <div className="grid grid-cols-5 gap-2">
                {Array.from({ length: Math.min(totalPunches, 10) }).map((_, index) => (
                  <div
                    key={index}
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                      index < punches
                        ? `bg-gradient-to-br from-green-400 to-green-600 border-green-500 text-white shadow-lg scale-110`
                        : `border-slate-300 bg-white`
                    }`}
                  >
                    {index < punches && <span className="text-xs font-bold">✓</span>}
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-700">
                  {punches}/{totalPunches} Punches
                </span>
                <Gift className="h-4 w-4 text-slate-500" />
              </div>
              <h3 className="font-bold text-slate-800 truncate">{businessName}</h3>
            </div>

            {/* Redeem Button */}
            {canRedeem && userId && businessId && punchcardId && (
              <Button
                onClick={handleRedeemClick}
                className="mt-3 w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-medium shadow-lg"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Redeem Reward
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Back Side */}
        <Card
          className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 border-0 shadow-xl rounded-2xl overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${primaryColor}20 0%, ${primaryColor}30 100%)`,
          }}
        >
          <CardContent className="p-6 h-full flex flex-col justify-between">
            {/* Magnetic Stripe */}
            <div className="w-full h-8 bg-gradient-to-r from-slate-800 to-slate-900 rounded-md mb-4"></div>

            {/* Reward Info */}
            <div className="flex-1 space-y-4">
              <div>
                <h4 className="font-bold text-slate-800 mb-2">Your Reward</h4>
                <p className="text-sm text-slate-600 bg-white/50 p-3 rounded-lg">{reward}</p>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-600">Progress</span>
                  <span className="font-medium" style={{ color: primaryColor }}>
                    {Math.round(progress)}%
                  </span>
                </div>
                <Progress value={progress} className="h-2" style={{ backgroundColor: `${primaryColor}20` }} />
              </div>

              {!canRedeem && (
                <Badge variant="outline" className="w-fit">
                  {totalPunches - punches} more punch{totalPunches - punches !== 1 ? "es" : ""} needed
                </Badge>
              )}

              {canRedeem && (
                <Badge className="w-fit bg-green-100 text-green-800 border-green-200">Ready to redeem!</Badge>
              )}
            </div>

            {/* Instructions */}
            <p className="text-xs text-slate-500 text-center">Tap to flip • Collect punches • Earn rewards</p>
          </CardContent>
        </Card>
      </div>

      <style jsx>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        .transform-style-preserve-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
      `}</style>
    </div>
  )
}
