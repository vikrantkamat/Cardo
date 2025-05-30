"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Gift, QrCode, Sparkles, Star } from "lucide-react"
import { RedemptionQRCode } from "@/components/redemption-qr-code"

interface ProgressTaskbarProps {
  punches: number
  totalPunches: number
  reward: string
  businessName: string
  businessId: string
  userId: string
  punchcardId: string
  primaryColor?: string
}

export function ProgressTaskbar({
  punches,
  totalPunches,
  reward,
  businessName,
  businessId,
  userId,
  punchcardId,
  primaryColor = "#6d28d9",
}: ProgressTaskbarProps) {
  const [isRedemptionOpen, setIsRedemptionOpen] = useState(false)
  const progress = Math.min((punches / totalPunches) * 100, 100)
  const isRewardReady = punches >= totalPunches

  return (
    <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm sticky bottom-4 mx-4 z-50">
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          {/* Progress Section */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Gift className="h-4 w-4 text-slate-600" />
                <span className="text-sm font-medium text-slate-700">{businessName}</span>
              </div>
              <div className="flex items-center gap-1">
                {isRewardReady ? (
                  <Badge className="bg-green-100 text-green-800 border-green-200">
                    <Sparkles className="h-3 w-3 mr-1" />
                    Ready!
                  </Badge>
                ) : (
                  <span className="text-xs text-slate-500">{totalPunches - punches} more to go</span>
                )}
              </div>
            </div>

            {/* Progress Bar */}
            <div className="relative">
              <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                <div
                  className="h-3 rounded-full transition-all duration-700 ease-out relative overflow-hidden"
                  style={{
                    width: `${progress}%`,
                    background: isRewardReady
                      ? "linear-gradient(90deg, #10b981, #059669)"
                      : `linear-gradient(90deg, ${primaryColor}, ${primaryColor}dd)`,
                  }}
                >
                  {isRewardReady && (
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
                  )}
                </div>
              </div>

              {/* Progress Dots */}
              <div className="absolute top-0 left-0 w-full h-3 flex items-center">
                {Array.from({ length: totalPunches }, (_, i) => (
                  <div key={i} className="flex-1 flex justify-center" style={{ marginLeft: i === 0 ? "0" : "-2px" }}>
                    <div
                      className={`w-1 h-1 rounded-full transition-all duration-300 ${
                        i < punches ? "bg-white shadow-sm" : "bg-slate-400/50"
                      }`}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-slate-500">
                {punches} / {totalPunches} punches
              </span>
              <span className="text-xs font-medium text-slate-600">Reward: {reward}</span>
            </div>
          </div>

          {/* Redeem Button */}
          {isRewardReady && (
            <Dialog open={isRedemptionOpen} onOpenChange={setIsRedemptionOpen}>
              <DialogTrigger asChild>
                <Button
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 animate-pulse"
                  size="sm"
                >
                  <QrCode className="h-4 w-4 mr-2" />
                  Redeem
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-yellow-500" />
                    Redeem Your Reward
                  </DialogTitle>
                </DialogHeader>
                <div className="flex flex-col items-center justify-center p-4">
                  <RedemptionQRCode
                    userId={userId}
                    businessId={businessId}
                    punchcardId={punchcardId}
                    reward={reward}
                    primaryColor={primaryColor}
                  />
                  <div className="mt-4 text-center">
                    <p className="font-medium text-slate-800 mb-1">{reward}</p>
                    <p className="text-sm text-slate-600">at {businessName}</p>
                    <p className="text-xs text-slate-500 mt-2">
                      Show this QR code to the business to redeem your reward
                    </p>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
