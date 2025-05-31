"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

interface PunchCardProps {
  punches: number
  totalPunches: number
  primaryColor?: string
  businessName: string
  businessType: string
  reward: string
  onPunchClick?: () => void
}

export function PunchCard({
  punches,
  totalPunches,
  primaryColor = "#6d28d9",
  businessName,
  businessType,
  reward,
  onPunchClick,
}: PunchCardProps) {
  const [isFlipped, setIsFlipped] = useState(false)
  const [animatePunch, setAnimatePunch] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Initial flip animation when component mounts
    const timer = setTimeout(() => {
      setIsFlipped(true)
      setTimeout(() => setIsFlipped(false), 600)
    }, 300)
    return () => clearTimeout(timer)
  }, [])

  const handleCardClick = () => {
    if (onPunchClick) {
      onPunchClick()
    }
    // Trigger punch animation
    setAnimatePunch(true)
    setIsFlipped(true)
    setTimeout(() => {
      setIsFlipped(false)
      setAnimatePunch(false)
    }, 800)
  }

  const getBusinessIcon = () => {
    switch (businessType) {
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

  const renderPunchHoles = () => {
    const holes = []
    const rows = Math.ceil(totalPunches / 5)
    const cols = Math.min(totalPunches, 5)

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const punchIndex = row * cols + col
        if (punchIndex >= totalPunches) break

        const isPunched = punchIndex < punches
        holes.push(
          <div
            key={punchIndex}
            className={cn(
              "w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-bold transition-all duration-300",
              isPunched
                ? "bg-white text-gray-800 border-white shadow-lg scale-110"
                : "bg-transparent border-white/50 text-white/70 hover:border-white/80",
            )}
          >
            {isPunched ? "✓" : punchIndex + 1}
          </div>,
        )
      }
    }
    return holes
  }

  if (!mounted) {
    return <div className="w-80 h-48 bg-gray-200 rounded-xl animate-pulse" />
  }

  return (
    <div className="perspective-1000 w-80 h-48 mx-auto">
      <div
        className={cn(
          "relative w-full h-full transition-transform duration-700 transform-style-preserve-3d cursor-pointer",
          isFlipped && "rotate-y-180",
          animatePunch && "animate-bounce",
        )}
        onClick={handleCardClick}
      >
        {/* Front of Card */}
        <div
          className="absolute inset-0 w-full h-full backface-hidden rounded-xl shadow-2xl overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${primaryColor} 0%, ${primaryColor}dd 50%, ${primaryColor}bb 100%)`,
          }}
        >
          {/* Card Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-4 right-4 w-16 h-16 rounded-full border-4 border-white/30"></div>
            <div className="absolute top-8 right-8 w-8 h-8 rounded-full border-2 border-white/20"></div>
            <div className="absolute bottom-4 left-4 w-12 h-12 rounded-full border-3 border-white/25"></div>
          </div>

          {/* Card Content */}
          <div className="relative z-10 p-6 h-full flex flex-col justify-between text-white">
            {/* Header */}
            <div className="flex justify-between items-start">
              <div>
                <div className="text-2xl mb-1">{getBusinessIcon()}</div>
                <div className="text-xs opacity-80 uppercase tracking-wider">Loyalty Card</div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold">
                  {punches}/{totalPunches}
                </div>
                <div className="text-xs opacity-80">Punches</div>
              </div>
            </div>

            {/* Punch Holes Grid */}
            <div className="flex-1 flex items-center justify-center">
              <div className={cn("grid gap-2", totalPunches <= 5 ? "grid-cols-5" : "grid-cols-5")}>
                {renderPunchHoles()}
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-between items-end">
              <div>
                <div className="text-sm font-semibold truncate max-w-40">{businessName}</div>
                <div className="text-xs opacity-80 capitalize">{businessType}</div>
              </div>
              <div className="text-right">
                <div className="text-xs opacity-80">REWARD</div>
                <div className="text-sm font-semibold">🎁</div>
              </div>
            </div>
          </div>

          {/* Chip */}
          <div className="absolute top-16 left-6 w-8 h-6 bg-gradient-to-br from-yellow-300 to-yellow-500 rounded-md shadow-lg"></div>
        </div>

        {/* Back of Card */}
        <div
          className="absolute inset-0 w-full h-full backface-hidden rounded-xl shadow-2xl rotate-y-180 overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${primaryColor}22 0%, ${primaryColor}44 50%, ${primaryColor}66 100%)`,
          }}
        >
          {/* Magnetic Stripe */}
          <div className="w-full h-12 bg-gray-800 mt-4"></div>

          <div className="p-6 text-gray-800">
            <div className="mb-4">
              <div className="text-lg font-bold mb-2">🎉 Reward Details</div>
              <div className="text-sm bg-white/80 p-3 rounded-lg">{reward}</div>
            </div>

            <div className="mb-4">
              <div className="text-sm font-semibold mb-1">Progress</div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="h-2 rounded-full transition-all duration-500"
                  style={{
                    width: `${(punches / totalPunches) * 100}%`,
                    backgroundColor: primaryColor,
                  }}
                ></div>
              </div>
              <div className="text-xs mt-1 text-gray-600">
                {totalPunches - punches} more punches to earn your reward!
              </div>
            </div>

            <div className="text-xs text-gray-500 text-center">Tap card to flip • Collect punches to earn rewards</div>
          </div>
        </div>
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
