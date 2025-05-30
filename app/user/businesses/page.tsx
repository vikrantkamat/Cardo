"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Heart, MapPin, Search, CreditCard, User, ArrowRight } from "lucide-react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

export default function UserBusinesses() {
  const { toast } = useToast()
  const [businesses, setBusinesses] = useState<any[]>([])
  const [userPunchcards, setUserPunchcards] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filter, setFilter] = useState("all")
  const [activeTab, setActiveTab] = useState("all")
  const [isLoading, setIsLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const storedUserId = localStorage.getItem("userId")

      if (!storedUserId) {
        router.push("/user/auth")
        return
      }

      setUserId(storedUserId)
      await loadData(storedUserId)
    } catch (error: any) {
      console.error("Auth check error:", error)
      toast({
        title: "Error",
        description: error.message || "Authentication error",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const loadData = async (currentUserId: string) => {
    try {
      const { data: businessesData, error: businessesError } = await supabase
        .from("businesses")
        .select("*")
        .order("created_at", { ascending: false })

      if (businessesError) throw businessesError

      const { data: punchcardsData, error: punchcardsError } = await supabase
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
            primary_color
          )
        `)
        .eq("user_id", currentUserId)

      if (punchcardsError) throw punchcardsError

      setBusinesses(businessesData || [])
      setUserPunchcards(punchcardsData || [])
    } catch (error: any) {
      console.error("Load data error:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to load data.",
        variant: "destructive",
      })
    }
  }

  const toggleFavorite = async (businessId: string) => {
    if (!userId) return

    try {
      const existingPunchcard = userPunchcards.find((pc) => pc.business_id === businessId)

      if (existingPunchcard) {
        const { error } = await supabase
          .from("punchcards")
          .update({ is_favorite: !existingPunchcard.is_favorite })
          .eq("id", existingPunchcard.id)

        if (error) throw error

        setUserPunchcards((prev) =>
          prev.map((pc) => (pc.id === existingPunchcard.id ? { ...pc, is_favorite: !pc.is_favorite } : pc)),
        )
      } else {
        const { data: newPunchcard, error } = await supabase
          .from("punchcards")
          .insert({
            user_id: userId,
            business_id: businessId,
            punches: 0,
            is_favorite: true,
          })
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
              primary_color
            )
          `)
          .single()

        if (error) throw error

        setUserPunchcards((prev) => [...prev, newPunchcard])
      }

      toast({
        title: "Success ✨",
        description: "Favorite status updated.",
      })
    } catch (error: any) {
      console.error("Toggle favorite error:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to update favorite.",
        variant: "destructive",
      })
    }
  }

  const getBusinessPunchcard = (businessId: string) => {
    return userPunchcards.find((pc) => pc.business_id === businessId)
  }

  const filteredBusinesses = businesses.filter((business) => {
    const matchesSearch = business.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filter === "all" || business.business_type === filter

    if (activeTab === "favorites") {
      const punchcard = getBusinessPunchcard(business.id)
      return matchesSearch && matchesType && punchcard?.is_favorite
    }

    return matchesSearch && matchesType
  })

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-indigo-100 relative overflow-hidden">
        {/* Grid gradient background */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-400/15 via-blue-400/10 to-indigo-400/15"></div>
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `
                linear-gradient(rgba(71, 85, 105, 0.06) 1px, transparent 1px),
                linear-gradient(90deg, rgba(71, 85, 105, 0.06) 1px, transparent 1px),
                linear-gradient(rgba(59, 130, 246, 0.04) 1px, transparent 1px),
                linear-gradient(90deg, rgba(59, 130, 246, 0.04) 1px, transparent 1px)
              `,
              backgroundSize: "60px 60px, 60px 60px, 30px 30px, 30px 30px",
            }}
          ></div>
        </div>
        <div className="flex items-center gap-3 relative z-10">
          <CreditCard className="h-6 w-6 text-indigo-600 animate-spin" />
          <p className="text-slate-600">Finding amazing businesses...</p>
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
                Discover
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/user/profile">
              <Button variant="outline" size="sm" className="border-slate-300 hover:bg-slate-50">
                <User className="h-4 w-4 mr-2" />
                Profile
              </Button>
            </Link>
            <Link href="/user/punchcards">
              <Button variant="outline" size="sm" className="border-indigo-300 hover:bg-indigo-50">
                My Cards
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 relative z-10">
        <div className="flex flex-col gap-6">
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Search businesses..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 border-slate-300 focus:border-indigo-500"
                  />
                </div>
                <Select value={filter} onValueChange={setFilter}>
                  <SelectTrigger className="w-full md:w-[180px] border-slate-300 focus:border-indigo-500">
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="cafe">Café</SelectItem>
                    <SelectItem value="bakery">Bakery</SelectItem>
                    <SelectItem value="juice">Juice Bar</SelectItem>
                    <SelectItem value="coffee">Coffee Shop</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 mb-4 bg-white/80 backdrop-blur-sm">
              <TabsTrigger
                value="all"
                className="data-[state=active]:bg-indigo-100 data-[state=active]:text-indigo-800"
              >
                All Businesses
              </TabsTrigger>
              <TabsTrigger
                value="favorites"
                className="data-[state=active]:bg-indigo-100 data-[state=active]:text-indigo-800"
              >
                Favorites
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredBusinesses.length > 0 ? (
              filteredBusinesses.map((business) => {
                const punchcard = getBusinessPunchcard(business.id)
                return (
                  <Card
                    key={business.id}
                    className="overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-[1.02] border-0 shadow-lg bg-white/80 backdrop-blur-sm group"
                  >
                    <CardHeader className="flex flex-row items-center gap-4 pb-2">
                      <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-slate-100 to-blue-100 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
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
                      <div className="flex-1">
                        <CardTitle className="text-lg text-slate-800">{business.name}</CardTitle>
                        <CardDescription className="flex items-center gap-1 text-slate-600">
                          <MapPin className="h-3 w-3" />
                          {business.location}
                        </CardDescription>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex items-center gap-1">
                            <CreditCard className="h-3 w-3 text-yellow-500" />
                            <span className="text-xs font-medium text-slate-600">{business.rating || "0.0"}</span>
                          </div>
                          <Badge variant="outline" className="text-xs border-slate-300 text-slate-600">
                            {business.business_type.charAt(0).toUpperCase() + business.business_type.slice(1)}
                          </Badge>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-full hover:bg-red-50"
                        onClick={() => toggleFavorite(business.id)}
                      >
                        <Heart
                          className={`h-5 w-5 transition-colors ${
                            punchcard?.is_favorite ? "fill-red-500 text-red-500" : "text-slate-400 hover:text-red-400"
                          }`}
                        />
                      </Button>
                    </CardHeader>
                    <CardContent className="pb-2">
                      {punchcard ? (
                        <>
                          <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                            <div
                              className="bg-gradient-to-r from-indigo-500 to-blue-500 h-3 rounded-full transition-all duration-500 ease-out"
                              style={{
                                width: `${Math.min((punchcard.punches / business.punches_required) * 100, 100)}%`,
                              }}
                            ></div>
                          </div>
                          <p className="text-xs text-center mt-2 text-slate-600">
                            {punchcard.punches} / {business.punches_required} punches
                            {punchcard.punches >= business.punches_required && " 🎉"}
                          </p>
                        </>
                      ) : (
                        <div className="text-center py-2">
                          <p className="text-xs text-slate-500">Start collecting punches!</p>
                        </div>
                      )}
                    </CardContent>
                    <CardFooter>
                      <Link href={`/user/business/${business.id}`} className="w-full">
                        <Button className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white shadow-md hover:shadow-lg transition-all duration-200 group">
                          Visit
                          <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      </Link>
                    </CardFooter>
                  </Card>
                )
              })
            ) : (
              <div className="col-span-full text-center py-12">
                <div className="w-16 h-16 bg-gradient-to-br from-slate-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="h-8 w-8 text-slate-400" />
                </div>
                <p className="text-slate-500 text-lg font-medium">No businesses found</p>
                <p className="text-slate-400 text-sm">Try adjusting your search or filters</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
