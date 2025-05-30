"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Gift, MapPin, Star } from "lucide-react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import { PunchCard } from "@/components/punch-card"

export default function UserPunchcards() {
  const { toast } = useToast()
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
          description: "User not found. Please visit businesses first.",
          variant: "destructive",
        })
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/user/businesses">
              <Button variant="ghost" size="icon" className="rounded-full">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-xl font-bold text-teal-800">My Punchcards</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="max-w-4xl mx-auto">
          {punchcards.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {punchcards.map((punchcard) => {
                const business = punchcard.businesses
                return (
                  <Card key={punchcard.id} className="overflow-hidden hover:shadow-md transition-shadow">
                    <div
                      className="h-20 w-full flex items-center justify-center"
                      style={{ backgroundColor: `${business.primary_color}20` }}
                    >
                      <div className="h-16 w-16 rounded-full bg-white flex items-center justify-center shadow-md">
                        <span className="text-2xl">
                          {business.business_type === "cafe"
                            ? "☕"
                            : business.business_type === "bakery"
                              ? "🥐"
                              : business.business_type === "juice"
                                ? "🥤"
                                : "☕"}
                        </span>
                      </div>
                    </div>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">{business.name}</CardTitle>
                      <CardDescription className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {business.location}
                      </CardDescription>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-xs font-medium">{business.rating || "0.0"}</span>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {business.business_type.charAt(0).toUpperCase() + business.business_type.slice(1)}
                        </Badge>
                        {punchcard.is_favorite && (
                          <Badge variant="outline" className="text-xs bg-red-50 text-red-700">
                            Favorite
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-center gap-2 mb-4">
                        <Gift className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium">
                          Reward: {business.reward} after {business.punches_required} punches
                        </span>
                      </div>

                      <PunchCard
                        punches={punchcard.punches}
                        totalPunches={business.punches_required}
                        primaryColor={business.primary_color}
                      />

                      <div className="mt-4 text-center">
                        {punchcard.punches >= business.punches_required ? (
                          <Badge className="bg-green-600 text-white">Reward Ready! 🎉</Badge>
                        ) : (
                          <p className="text-sm text-gray-600">
                            {business.punches_required - punchcard.punches} more punches to earn {business.reward}
                          </p>
                        )}
                      </div>

                      {punchcard.last_punch_at && (
                        <p className="text-xs text-gray-500 text-center mt-2">
                          Last visit: {new Date(punchcard.last_punch_at).toLocaleDateString()}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <h3 className="text-lg font-medium mb-2">No Punchcards Yet</h3>
                <p className="text-gray-500 mb-4">Start visiting businesses to collect punches and earn rewards!</p>
                <Link href="/user/businesses">
                  <Button className="bg-teal-600 hover:bg-teal-700">Find Businesses</Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
