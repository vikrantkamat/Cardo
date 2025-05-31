"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, MapPin, Phone, Mail, Clock, CreditCard, Star, Users } from "lucide-react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import { UserQRCode } from "@/components/user-qr-code"

interface Business {
  id: string
  name: string
  description: string
  address: string
  phone: string
  email: string
  category: string
  loyalty_program_active: boolean
  punch_requirement: number
  reward_description: string
  created_at: string
}

interface PunchCard {
  id: string
  user_id: string
  business_id: string
  punches: number
  is_completed: boolean
  created_at: string
  completed_at: string | null
}

export default function BusinessDetail() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const [business, setBusiness] = useState<Business | null>(null)
  const [punchCard, setPunchCard] = useState<PunchCard | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    // Check if user is logged in
    const storedUserId = localStorage.getItem("userId")
    if (!storedUserId) {
      router.push("/user/auth")
      return
    }

    setUserId(storedUserId)
    loadBusinessData(params.id as string, storedUserId)
  }, [params.id, router])

  const loadBusinessData = async (businessId: string, userId: string) => {
    try {
      setIsLoading(true)

      // Load business data
      const { data: businessData, error: businessError } = await supabase
        .from("businesses")
        .select("*")
        .eq("id", businessId)
        .single()

      if (businessError) {
        console.error("Error loading business:", businessError)
        throw new Error("Business not found")
      }

      setBusiness(businessData)

      // Load user's punch card for this business
      const { data: punchCardData, error: punchCardError } = await supabase
        .from("punch_cards")
        .select("*")
        .eq("user_id", userId)
        .eq("business_id", businessId)
        .single()

      if (punchCardError && punchCardError.code !== "PGRST116") {
        console.error("Error loading punch card:", punchCardError)
      } else if (punchCardData) {
        setPunchCard(punchCardData)
      }
    } catch (error: any) {
      console.error("Error in loadBusinessData:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to load business data.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const joinLoyaltyProgram = async () => {
    if (!business || !userId) return

    try {
      // Create a new punch card for this user and business
      const { data: newPunchCard, error } = await supabase
        .from("punch_cards")
        .insert({
          user_id: userId,
          business_id: business.id,
          punches: 0,
          is_completed: false,
        })
        .select()
        .single()

      if (error) {
        console.error("Error creating punch card:", error)
        throw new Error("Failed to join loyalty program")
      }

      setPunchCard(newPunchCard)

      toast({
        title: "Welcome! 🎉",
        description: `You've joined ${business.name}'s loyalty program!`,
      })
    } catch (error: any) {
      console.error("Error joining loyalty program:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to join loyalty program.",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading business details...</p>
        </div>
      </div>
    )
  }

  if (!business) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="text-center py-12">
            <h3 className="text-lg font-semibold text-slate-800 mb-2">Business not found</h3>
            <p className="text-slate-600 mb-4">The business you're looking for doesn't exist or has been removed.</p>
            <Link href="/user/businesses">
              <Button className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white">
                Back to Businesses
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Enhanced Grid gradient background */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-400/15 via-blue-400/10 to-indigo-400/15"></div>
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(rgba(71, 85, 105, 0.06) 1px, transparent 1px),
              linear-gradient(90deg, rgba(71, 85, 105, 0.06) 1px, transparent 1px),
              linear-gradient(rgba(59, 130, 246, 0.04) 1px, transparent 1px),
              linear-gradient(90deg, rgba(59, 130, 246, 0.04) 1px, transparent 1px),
              linear-gradient(rgba(99, 102, 241, 0.03) 1px, transparent 1px),
              linear-gradient(90deg, rgba(99, 102, 241, 0.03) 1px, transparent 1px)
            `,
            backgroundSize: "80px 80px, 80px 80px, 40px 40px, 40px 40px, 20px 20px, 20px 20px",
          }}
        ></div>
      </div>

      <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/user/businesses">
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-slate-100">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-blue-600 rounded-lg flex items-center justify-center">
                <CreditCard className="h-4 w-4 text-white" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-700 to-blue-600 bg-clip-text text-transparent">
                {business.name}
              </h1>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 relative z-10">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Business Info Card */}
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-2xl font-bold text-slate-800">{business.name}</CardTitle>
                  <CardDescription className="text-lg text-slate-600 mt-2">
                    {business.description || "Local business offering loyalty rewards"}
                  </CardDescription>
                </div>
                <Badge variant="secondary" className="bg-indigo-100 text-indigo-700">
                  {business.category}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 text-slate-600">
                  <MapPin className="h-5 w-5 text-slate-400" />
                  <span>{business.address}</span>
                </div>
                {business.phone && (
                  <div className="flex items-center gap-3 text-slate-600">
                    <Phone className="h-5 w-5 text-slate-400" />
                    <span>{business.phone}</span>
                  </div>
                )}
                {business.email && (
                  <div className="flex items-center gap-3 text-slate-600">
                    <Mail className="h-5 w-5 text-slate-400" />
                    <span>{business.email}</span>
                  </div>
                )}
                <div className="flex items-center gap-3 text-slate-600">
                  <Clock className="h-5 w-5 text-slate-400" />
                  <span>Collect {business.punch_requirement} punches</span>
                </div>
              </div>

              <div className="p-4 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg border border-indigo-200">
                <h3 className="font-semibold text-indigo-800 mb-2 flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  Loyalty Reward
                </h3>
                <p className="text-indigo-700">
                  {business.reward_description || "Exclusive reward when you complete your punch card!"}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Punch Card Status */}
          {punchCard ? (
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-indigo-600" />
                  Your Punch Card
                </CardTitle>
                <CardDescription>
                  {punchCard.is_completed
                    ? "Congratulations! Your punch card is complete!"
                    : `${punchCard.punches} of ${business.punch_requirement} punches collected`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Progress Bar */}
                <div className="mb-6">
                  <div className="flex justify-between text-sm text-slate-600 mb-2">
                    <span>Progress</span>
                    <span>
                      {punchCard.punches}/{business.punch_requirement}
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-indigo-600 to-blue-600 h-3 rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.min((punchCard.punches / business.punch_requirement) * 100, 100)}%`,
                      }}
                    ></div>
                  </div>
                </div>

                {/* QR Code */}
                <div className="text-center">
                  <h3 className="font-semibold text-slate-800 mb-4">Show this QR code to collect punches:</h3>
                  {userId && <UserQRCode userId={userId} businessId={business.id} />}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardContent className="text-center py-12">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CreditCard className="h-8 w-8 text-indigo-600" />
                </div>
                <h3 className="text-xl font-semibold text-slate-800 mb-2">Join the Loyalty Program</h3>
                <p className="text-slate-600 mb-6">Start collecting punches and earn rewards at {business.name}!</p>
                <Button
                  onClick={joinLoyaltyProgram}
                  className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white shadow-md hover:shadow-lg transition-all duration-200"
                >
                  Join Now
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
