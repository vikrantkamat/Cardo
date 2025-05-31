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
              "w-7 h-7 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300",
              isPunched
                ? "bg-white text-gray-800 shadow-md scale-105 border-2 border-white"
                : "bg-white/20 border border-white/40 text-white/90",
            )}
          >
            {isPunched ? "✓" : ""}
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
          className="absolute inset-0 w-full h-full backface-hidden rounded-xl shadow-lg overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${primaryColor} 0%, ${primaryColor}dd 100%)`,
          }}
        >
          {/* Card Background Pattern */}
          <div className="absolute inset-0">
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: `radial-gradient(circle at 20% 20%, white 0%, transparent 8%), 
                                  radial-gradient(circle at 80% 80%, white 0%, transparent 8%)`,
                backgroundSize: "60px 60px",
              }}
            ></div>
          </div>

          {/* Card Content */}
          <div className="relative z-10 p-5 h-full flex flex-col justify-between text-white">
            {/* Header */}
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2">
                <div className="text-2xl">{getBusinessIcon()}</div>
                <div>
                  <div className="text-sm font-bold tracking-wide">{businessName}</div>
                  <div className="text-xs opacity-80 capitalize">{businessType}</div>
                </div>
              </div>
              <div className="bg-white/20 px-2 py-1 rounded-md backdrop-blur-sm">
                <span className="text-sm font-bold">
                  {punches}/{totalPunches}
                </span>
              </div>
            </div>

            {/* Punch Holes Grid */}
            <div className="flex-1 flex items-center justify-center py-2">
              <div className={cn("grid gap-2", totalPunches <= 5 ? "grid-cols-5" : "grid-cols-5")}>
                {renderPunchHoles()}
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-between items-end">
              <div className="text-xs opacity-90 font-medium">TAP TO FLIP</div>
              <div className="flex items-center gap-1">
                <div className="text-xs opacity-90">REWARD</div>
                <div className="text-sm">🎁</div>
              </div>
            </div>
          </div>
        </div>

        {/* Back of Card */}
        <div
          className="absolute inset-0 w-full h-full backface-hidden rounded-xl shadow-lg rotate-y-180 overflow-hidden"
          style={{
            background: `linear-gradient(135deg, white 0%, #f9fafb 100%)`,
          }}
        >
          {/* Colored Stripe */}
          <div className="w-full h-10" style={{ backgroundColor: primaryColor }}></div>

          <div className="p-5 text-gray-800">
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="text-lg" style={{ color: primaryColor }}>
                  🎁
                </div>
                <div className="text-sm font-bold" style={{ color: primaryColor }}>
                  REWARD
                </div>
              </div>
              <div
                className="text-sm p-2 rounded-md font-medium"
                style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}
              >
                {reward}
              </div>
            </div>

            <div className="mb-4">
              <div className="text-xs font-medium mb-1 text-gray-500">PROGRESS</div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div
                  className="h-2 rounded-full transition-all duration-500"
                  style={{
                    width: `${(punches / totalPunches) * 100}%`,
                    backgroundColor: primaryColor,
                  }}
                ></div>
              </div>
              <div className="text-xs mt-1 text-gray-500">
                {totalPunches - punches} more punches to earn your reward
              </div>
            </div>

            <div className="text-xs text-center text-gray-400 mt-4">{businessName} • Loyalty Card</div>
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
