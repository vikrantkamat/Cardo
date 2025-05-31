"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, CreditCard, MapPin, Gift, Users } from "lucide-react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"

interface Business {
  id: string
  name: string
  description: string
  address: string
  category: string
  punch_requirement: number
  reward_description: string
}

interface PunchCardData {
  id: string
  user_id: string
  business_id: string
  punches: number
  is_completed: boolean
  created_at: string
  completed_at: string | null
  businesses: Business
}

export default function UserPunchCards() {
  const router = useRouter()
  const { toast } = useToast()
  const [punchCards, setPunchCards] = useState<PunchCardData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [userName, setUserName] = useState("")

  useEffect(() => {
    // Check if user is logged in
    const userId = localStorage.getItem("userId")
    const storedUserName = localStorage.getItem("userName")

    if (!userId) {
      router.push("/user/auth")
      return
    }

    if (storedUserName) {
      setUserName(storedUserName)
    }

    loadPunchCards(userId)
  }, [router])

  const loadPunchCards = async (userId: string) => {
    try {
      setIsLoading(true)

      const { data: punchCardData, error } = await supabase
        .from("punch_cards")
        .select(`
          *,
          businesses (*)
        `)
        .eq("user_id", userId)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error loading punch cards:", error)
        throw new Error("Failed to load punch cards")
      }

      setPunchCards(punchCardData || [])
    } catch (error: any) {
      console.error("Error in loadPunchCards:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to load punch cards.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const activePunchCards = punchCards.filter((card) => !card.is_completed)
  const completedPunchCards = punchCards.filter((card) => card.is_completed)

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading your punch cards...</p>
        </div>
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
                My Punch Cards
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/user/businesses">
              <Button variant="outline" size="sm" className="border-indigo-300 hover:bg-indigo-50">
                Find More
              </Button>
            </Link>
            <Link href="/user/profile">
              <Button variant="ghost" size="sm" className="hover:bg-slate-100">
                {userName || "Profile"}
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 relative z-10">
        {punchCards.length === 0 ? (
          <Card className="max-w-2xl mx-auto border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardContent className="text-center py-12">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CreditCard className="h-8 w-8 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-2">No punch cards yet</h3>
              <p className="text-slate-600 mb-6">
                Start collecting rewards by joining loyalty programs at your favorite businesses!
              </p>
              <Link href="/user/businesses">
                <Button className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white shadow-md hover:shadow-lg transition-all duration-200">
                  Find Businesses
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {/* Active Punch Cards */}
            {activePunchCards.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <Users className="h-6 w-6 text-indigo-600" />
                  Active Cards
                  <Badge variant="secondary" className="ml-2">
                    {activePunchCards.length}
                  </Badge>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {activePunchCards.map((punchCard) => (
                    <PunchCardComponent key={punchCard.id} punchCard={punchCard} />
                  ))}
                </div>
              </div>
            )}

            {/* Completed Punch Cards */}
            {completedPunchCards.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <Gift className="h-6 w-6 text-green-600" />
                  Completed Cards
                  <Badge variant="secondary" className="ml-2 bg-green-100 text-green-700">
                    {completedPunchCards.length}
                  </Badge>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {completedPunchCards.map((punchCard) => (
                    <PunchCardComponent key={punchCard.id} punchCard={punchCard} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}

function PunchCardComponent({ punchCard }: { punchCard: PunchCardData }) {
  const business = punchCard.businesses
  const progress = (punchCard.punches / business.punch_requirement) * 100

  return (
    <Card
      className={`overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-[1.02] border-0 shadow-lg bg-white/80 backdrop-blur-sm ${
        punchCard.is_completed ? "ring-2 ring-green-200" : ""
      }`}
    >
      {punchCard.is_completed && (
        <div className="bg-gradient-to-r from-green-400 to-emerald-500 text-white text-xs font-medium px-3 py-1 text-center">
          🎉 Completed! Ready to redeem
        </div>
      )}

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-bold text-slate-800">{business.name}</CardTitle>
            <CardDescription className="text-slate-600 mt-1">
              {business.description || "Local business"}
            </CardDescription>
          </div>
          <Badge variant="secondary" className="ml-2 bg-indigo-100 text-indigo-700">
            {business.category}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <MapPin className="h-4 w-4 text-slate-400" />
          <span className="truncate">{business.address}</span>
        </div>

        {/* Progress */}
        <div>
          <div className="flex justify-between text-sm text-slate-600 mb-2">
            <span>Progress</span>
            <span>
              {punchCard.punches}/{business.punch_requirement}
            </span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${
                punchCard.is_completed
                  ? "bg-gradient-to-r from-green-500 to-emerald-500"
                  : "bg-gradient-to-r from-indigo-600 to-blue-600"
              }`}
              style={{ width: `${Math.min(progress, 100)}%` }}
            ></div>
          </div>
        </div>

        {/* Reward */}
        <div
          className={`p-3 rounded-lg border ${
            punchCard.is_completed
              ? "bg-gradient-to-r from-green-50 to-emerald-50 border-green-200"
              : "bg-gradient-to-r from-indigo-50 to-blue-50 border-indigo-200"
          }`}
        >
          <p className={`text-sm font-medium mb-1 ${punchCard.is_completed ? "text-green-800" : "text-indigo-800"}`}>
            Reward
          </p>
          <p className={`text-sm ${punchCard.is_completed ? "text-green-600" : "text-indigo-600"}`}>
            {business.reward_description || "Exclusive reward!"}
          </p>
        </div>

        <Link href={`/user/business/${business.id}`} className="block">
          <Button
            className={`w-full shadow-md hover:shadow-lg transition-all duration-200 ${
              punchCard.is_completed
                ? "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                : "bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white"
            }`}
          >
            {punchCard.is_completed ? "Redeem Reward" : "View Details"}
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}
