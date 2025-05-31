"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Gift, MapPin, Star, Sparkles } from "lucide-react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import { PunchCard } from "@/components/punch-card"
import { useRouter } from "next/navigation"

export default function UserPunchcards() {
  const { toast } = useToast()
  const router = useRouter()
  const [punchcards, setPunchcards] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    loadPunchcards()
  }, [])

  const loadPunchcards = async () => {
    try {
      const storedUserId = localStorage.getItem("userId")
      if (!storedUserId) {
        toast({
          title: "Error",
          description: "User not found. Please sign in first.",
          variant: "destructive",
        })
        router.push("/user/auth")
        return
      }

      setUserId(storedUserId)

      const { data: punchcardsData, error } = await supabase
        .from("punchcards")
        .select(`
          *,
          businesses (
            id,
            name,
            business_type,
            location,
            rating,
            logo_url,
            punches_required,
            reward,
            primary_color,
            description
          )
        `)
        .eq("user_id", storedUserId)
        .order("updated_at", { ascending: false })

      if (error) throw error

      setPunchcards(punchcardsData || [])
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load punchcards.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handlePunchCardClick = (punchcard: any) => {
    toast({
      title: "Card Flipped! ✨",
      description: `${punchcard.businesses.name} loyalty card activated`,
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-teal-600 font-medium">Loading your cards...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-blue-50 to-purple-50">
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/user/businesses">
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-teal-100">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-teal-600" />
              <h1 className="text-xl font-bold text-teal-800">My Loyalty Cards</h1>
            </div>
          </div>
          <Badge variant="outline" className="bg-teal-50 text-teal-700 border-teal-200">
            {punchcards.length} {punchcards.length === 1 ? "Card" : "Cards"}
          </Badge>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {punchcards.length > 0 ? (
            <>
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Your Digital Wallet</h2>
                <p className="text-gray-600">Tap any card to see your progress and rewards</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8 justify-items-center">
                {punchcards.map((punchcard, index) => {
                  const business = punchcard.businesses
                  if (!business) return null

                  return (
                    <div key={punchcard.id} className="group" style={{ animationDelay: `${index * 100}ms` }}>
                      {/* Business Info Card */}
                      <Card className="mb-4 overflow-hidden hover:shadow-lg transition-all duration-300 group-hover:scale-105">
                        <div
                          className="h-16 w-full flex items-center justify-center relative overflow-hidden"
                          style={{ backgroundColor: `${business.primary_color}15` }}
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12"></div>
                          <div className="flex items-center gap-3 relative z-10">
                            <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center shadow-md">
                              <span className="text-lg">
                                {business.business_type === "cafe"
                                  ? "☕"
                                  : business.business_type === "bakery"
                                    ? "🥐"
                                    : business.business_type === "juice"
                                      ? "🥤"
                                      : "⭐"}
                              </span>
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-800">{business.name}</h3>
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <MapPin className="h-3 w-3" />
                                <span>{business.location}</span>
                                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                <span>{business.rating || "5.0"}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Gift className="h-4 w-4 text-green-600" />
                              <span className="text-sm font-medium text-gray-700">{business.reward}</span>
                            </div>
                            {punchcard.punches >= business.punches_required && (
                              <Badge className="bg-green-600 text-white animate-pulse">Ready! 🎉</Badge>
                            )}
                            {punchcard.is_favorite && (
                              <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                                ❤️ Favorite
                              </Badge>
                            )}
                          </div>
                        </CardContent>
                      </Card>

                      {/* Credit Card */}
                      <div className="transform transition-all duration-300 hover:scale-105">
                        <PunchCard
                          punches={punchcard.punches}
                          totalPunches={business.punches_required}
                          primaryColor={business.primary_color}
                          businessName={business.name}
                          businessType={business.business_type}
                          reward={business.reward}
                          onPunchClick={() => handlePunchCardClick(punchcard)}
                          businessId={business.id}
                          userId={userId || ""}
                          punchcardId={punchcard.id}
                        />
                      </div>

                      {/* Progress Info */}
                      <div className="mt-4 text-center">
                        {punchcard.punches >= business.punches_required ? (
                          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                            <div className="text-green-800 font-semibold mb-1">🎉 Reward Ready!</div>
                            <div className="text-green-600 text-sm">
                              Visit the store to claim your {business.reward}
                            </div>
                          </div>
                        ) : (
                          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                            <div className="text-gray-800 font-medium mb-1">
                              {business.punches_required - punchcard.punches} more punches needed
                            </div>
                            <div className="text-gray-600 text-sm">to earn {business.reward}</div>
                          </div>
                        )}

                        {punchcard.last_punch_at && (
                          <p className="text-xs text-gray-500 mt-2">
                            Last visit: {new Date(punchcard.last_punch_at).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </>
          ) : (
            <div className="text-center py-16">
              <div className="max-w-md mx-auto">
                <div className="w-24 h-24 bg-gradient-to-br from-teal-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Sparkles className="h-12 w-12 text-teal-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-3">No Loyalty Cards Yet</h3>
                <p className="text-gray-600 mb-6">
                  Start visiting businesses to collect punches and earn amazing rewards!
                </p>
                <Link href="/user/businesses">
                  <Button className="bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white px-8 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300">
                    Discover Businesses ✨
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
