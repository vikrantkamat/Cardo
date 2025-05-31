"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Search, MapPin, Star, Clock, CreditCard, Users } from "lucide-react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"

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

interface UserRecommendation {
  id: string
  business_id: string
  recommendation_type: string
  reason: string
  businesses: Business
}

export default function UserBusinesses() {
  const router = useRouter()
  const { toast } = useToast()
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [recommendations, setRecommendations] = useState<UserRecommendation[]>([])
  const [searchTerm, setSearchTerm] = useState("")
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

    loadBusinesses(userId)
  }, [router])

  const loadBusinesses = async (userId: string) => {
    try {
      setIsLoading(true)

      // Load all businesses
      const { data: businessData, error: businessError } = await supabase
        .from("businesses")
        .select("*")
        .eq("loyalty_program_active", true)
        .order("created_at", { ascending: false })

      if (businessError) {
        console.error("Error loading businesses:", businessError)
        throw new Error("Failed to load businesses")
      }

      setBusinesses(businessData || [])

      // Load user recommendations
      const { data: recommendationData, error: recommendationError } = await supabase
        .from("user_recommendations")
        .select(`
          *,
          businesses (*)
        `)
        .eq("user_id", userId)
        .order("created_at", { ascending: false })

      if (recommendationError) {
        console.error("Error loading recommendations:", recommendationError)
        // Don't throw error for recommendations, just log it
      } else {
        setRecommendations(recommendationData || [])
      }
    } catch (error: any) {
      console.error("Error in loadBusinesses:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to load businesses.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const filteredBusinesses = businesses.filter(
    (business) =>
      business.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      business.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      business.address.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const recommendedBusinesses = recommendations
    .map((rec) => rec.businesses)
    .filter((business) => business && business.loyalty_program_active)

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading businesses...</p>
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
            <Link href="/">
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-slate-100">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-blue-600 rounded-lg flex items-center justify-center">
                <CreditCard className="h-4 w-4 text-white" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-700 to-blue-600 bg-clip-text text-transparent">
                Find Businesses
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/user/punchcards">
              <Button variant="outline" size="sm" className="border-indigo-300 hover:bg-indigo-50">
                My Cards
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
        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
            <Input
              placeholder="Search businesses, categories, or locations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-12 border-slate-300 focus:border-indigo-500 bg-white/80 backdrop-blur-sm"
            />
          </div>
        </div>

        {/* Recommended Businesses */}
        {recommendedBusinesses.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Star className="h-6 w-6 text-yellow-500" />
              Recommended for You
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendedBusinesses.slice(0, 3).map((business) => (
                <BusinessCard key={business.id} business={business} isRecommended={true} />
              ))}
            </div>
          </div>
        )}

        {/* All Businesses */}
        <div>
          <h2 className="text-2xl font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Users className="h-6 w-6 text-indigo-600" />
            All Businesses
            <Badge variant="secondary" className="ml-2">
              {filteredBusinesses.length}
            </Badge>
          </h2>

          {filteredBusinesses.length === 0 ? (
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardContent className="text-center py-12">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="h-8 w-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-800 mb-2">No businesses found</h3>
                <p className="text-slate-600 mb-4">
                  {searchTerm
                    ? `No businesses match "${searchTerm}". Try a different search term.`
                    : "No businesses are currently available. Check back later!"}
                </p>
                {searchTerm && (
                  <Button
                    variant="outline"
                    onClick={() => setSearchTerm("")}
                    className="border-indigo-300 hover:bg-indigo-50"
                  >
                    Clear Search
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBusinesses.map((business) => (
                <BusinessCard key={business.id} business={business} isRecommended={false} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

function BusinessCard({ business, isRecommended }: { business: Business; isRecommended: boolean }) {
  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-[1.02] border-0 shadow-lg bg-white/80 backdrop-blur-sm group">
      {isRecommended && (
        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-medium px-3 py-1 text-center">
          ⭐ Recommended for You
        </div>
      )}

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
              {business.name}
            </CardTitle>
            <CardDescription className="text-slate-600 mt-1">
              {business.description || "Local business offering loyalty rewards"}
            </CardDescription>
          </div>
          <Badge variant="secondary" className="ml-2 bg-indigo-100 text-indigo-700">
            {business.category}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <MapPin className="h-4 w-4 text-slate-400" />
          <span className="truncate">{business.address}</span>
        </div>

        <div className="flex items-center gap-2 text-sm text-slate-600">
          <Clock className="h-4 w-4 text-slate-400" />
          <span>Collect {business.punch_requirement} punches</span>
        </div>

        <div className="p-3 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg border border-indigo-200">
          <p className="text-sm font-medium text-indigo-800 mb-1">Reward</p>
          <p className="text-sm text-indigo-600">
            {business.reward_description || "Exclusive reward when you complete your punch card!"}
          </p>
        </div>

        <Link href={`/user/business/${business.id}`} className="block">
          <Button className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white shadow-md hover:shadow-lg transition-all duration-200">
            View Details & Join
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}
