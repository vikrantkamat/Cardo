"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Gift, ArrowLeft, Sparkles } from "lucide-react"
import { RedemptionQRCode } from "./redemption-qr-code"
import { cn } from "@/lib/utils"

interface PunchCardProps {
  business: {
    id: string
    name: string
    business_type: string
    primary_color: string
    punches_required: number
    reward: string
  }
  punchcard: {
    id: string
    punches: number
    user_id: string
  }
  onFlip?: () => void
  className?: string
}

export function PunchCard({ business, punchcard, onFlip, className }: PunchCardProps) {
  const [isFlipped, setIsFlipped] = useState(false)
  const [showRedemption, setShowRedemption] = useState(false)
  const [hasFlippedOnce, setHasFlippedOnce] = useState(false)

  const progress = (punchcard.punches / business.punches_required) * 100
  const canRedeem = punchcard.punches >= business.punches_required
  const punchesNeeded = Math.max(0, business.punches_required - punchcard.punches)

  // Auto-flip on mount
  useEffect(() => {
    if (!hasFlippedOnce) {
      const timer = setTimeout(() => {
        setIsFlipped(true)
        setHasFlippedOnce(true)
        setTimeout(() => setIsFlipped(false), 2000)
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [hasFlippedOnce])

  const handleCardClick = () => {
    if (!showRedemption) {
      setIsFlipped(!isFlipped)
      onFlip?.()
    }
  }

  const handleRedeemClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    console.log("Redeem button clicked - showing QR code")
    setShowRedemption(true)
  }

  const handleBackClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setShowRedemption(false)
  }

  // Generate business icon based on type
  const getBusinessIcon = (type: string) => {
    const icons: { [key: string]: string } = {
      restaurant: "🍽️",
      cafe: "☕",
      retail: "🛍️",
      fitness: "💪",
      beauty: "💄",
      automotive: "🚗",
      health: "🏥",
      entertainment: "🎬",
      education: "📚",
      default: "🏪",
    }
    return icons[type.toLowerCase()] || icons.default
  }

  if (showRedemption) {
    return (
      <div className={cn("w-80 h-48 perspective-1000", className)}>
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
              userId={punchcard.user_id}
              businessId={business.id}
              punchcardId={punchcard.id}
              reward={business.reward}
              size={120}
              primaryColor={business.primary_color}
            />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className={cn("w-80 h-48 perspective-1000", className)}>
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
            background: `linear-gradient(135deg, ${business.primary_color}15 0%, ${business.primary_color}25 100%)`,
          }}
        >
          <CardContent className="p-6 h-full flex flex-col justify-between relative">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-lg"
                  style={{ backgroundColor: `${business.primary_color}20` }}
                >
                  {getBusinessIcon(business.business_type)}
                </div>
                <span className="text-xs font-medium text-slate-600">LOYALTY CARD</span>
              </div>
              <div className="w-6 h-4 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-sm"></div>
            </div>

            {/* Punch Grid */}
            <div className="flex-1 flex items-center justify-center">
              <div className="grid grid-cols-5 gap-2">
                {Array.from({ length: business.punches_required }).map((_, index) => (
                  <div
                    key={index}
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                      index < punchcard.punches
                        ? `bg-gradient-to-br from-green-400 to-green-600 border-green-500 text-white shadow-lg scale-110`
                        : `border-slate-300 bg-white`
                    }`}
                  >
                    {index < punchcard.punches && <span className="text-xs font-bold">✓</span>}
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-700">
                  {punchcard.punches}/{business.punches_required} Punches
                </span>
                <Gift className="h-4 w-4 text-slate-500" />
              </div>
              <h3 className="font-bold text-slate-800 truncate">{business.name}</h3>
            </div>

            {/* Redeem Button */}
            {canRedeem && (
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
            background: `linear-gradient(135deg, ${business.primary_color}20 0%, ${business.primary_color}30 100%)`,
          }}
        >
          <CardContent className="p-6 h-full flex flex-col justify-between">
            {/* Magnetic Stripe */}
            <div className="w-full h-8 bg-gradient-to-r from-slate-800 to-slate-900 rounded-md mb-4"></div>

            {/* Reward Info */}
            <div className="flex-1 space-y-4">
              <div>
                <h4 className="font-bold text-slate-800 mb-2">Your Reward</h4>
                <p className="text-sm text-slate-600 bg-white/50 p-3 rounded-lg">{business.reward}</p>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-600">Progress</span>
                  <span className="font-medium" style={{ color: business.primary_color }}>
                    {Math.round(progress)}%
                  </span>
                </div>
                <Progress value={progress} className="h-2" style={{ backgroundColor: `${business.primary_color}20` }} />
              </div>

              {!canRedeem && (
                <Badge variant="outline" className="w-fit">
                  {punchesNeeded} more punch{punchesNeeded !== 1 ? "es" : ""} needed
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
    </div>
  )
}
