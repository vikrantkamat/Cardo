"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { QrScanner } from "@/components/qr-scanner"
import { CustomerList } from "@/components/customer-list"
import { RewardsManagement } from "@/components/rewards-management"
import { EmailList } from "@/components/email-list"
import { ArrowLeft, BarChart3, QrCode, Settings, Users, CreditCard, Gift, Mail } from "lucide-react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

export default function BusinessDashboard() {
  const router = useRouter()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("scanner")
  const [business, setBusiness] = useState<any>(null)
  const [customers, setCustomers] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadBusinessData()
  }, [])

  const loadBusinessData = async () => {
    try {
      const businessId = localStorage.getItem("businessId")
      if (!businessId) {
        router.push("/business/signin")
        return
      }

      // Load business details
      const { data: businessData, error: businessError } = await supabase
        .from("businesses")
        .select("*")
        .eq("id", businessId)
        .single()

      if (businessError) throw businessError
      setBusiness(businessData)

      // Load customers with punchcards for this business
      const { data: customersData, error: customersError } = await supabase
        .from("punchcards")
        .select(`
          *,
          users (
            id,
            name,
            email
          )
        `)
        .eq("business_id", businessId)

      if (customersError) throw customersError
      setCustomers(customersData || [])
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load business data.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleQrScan = async (qrData: string) => {
    try {
      // Parse user QR code (format: user-{userId})
      if (!qrData.startsWith("user-")) {
        throw new Error("Invalid QR code format")
      }

      const userId = qrData.replace("user-", "")

      // Check if user exists
      const { data: userData, error: userError } = await supabase.from("users").select("*").eq("id", userId).single()

      if (userError) throw new Error("User not found")

      // Get or create punchcard
      let { data: punchcard, error: punchcardError } = await supabase
        .from("punchcards")
        .select("*")
        .eq("user_id", userId)
        .eq("business_id", business.id)
        .single()

      if (punchcardError && punchcardError.code === "PGRST116") {
        // Create new punchcard
        const { data: newPunchcard, error: createError } = await supabase
          .from("punchcards")
          .insert({
            user_id: userId,
            business_id: business.id,
            punches: 1,
            last_punch_at: new Date().toISOString(),
          })
          .select()
          .single()

        if (createError) throw createError
        punchcard = newPunchcard
      } else if (punchcardError) {
        throw punchcardError
      } else {
        // Update existing punchcard
        const newPunches = punchcard.punches + 1
        const { data: updatedPunchcard, error: updateError } = await supabase
          .from("punchcards")
          .update({
            punches: newPunches,
            last_punch_at: new Date().toISOString(),
          })
          .eq("id", punchcard.id)
          .select()
          .single()

        if (updateError) throw updateError
        punchcard = updatedPunchcard
      }

      // Add to punch history
      await supabase.from("punch_history").insert({
        punchcard_id: punchcard.id,
        business_id: business.id,
        user_id: userId,
      })

      toast({
        title: "Punch Added! ✨",
        description: `${userData.name || userData.email} now has ${punchcard.punches} punches.`,
      })

      // Reload customer data
      loadBusinessData()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to process QR code.",
        variant: "destructive",
      })
    }
  }

  const handleRedemptionScan = async (redemptionData: any) => {
    try {
      console.log("Processing redemption:", redemptionData)
      const { userId, businessId, punchcardId, reward, customerName } = redemptionData

      // Verify the redemption is for this business
      if (businessId !== business.id) {
        throw new Error("This redemption is not valid for your business")
      }

      // Get the punchcard to verify
      const { data: punchcard, error: punchcardError } = await supabase
        .from("punchcards")
        .select("*, users(*)")
        .eq("id", punchcardId)
        .eq("business_id", businessId)
        .single()

      if (punchcardError) throw new Error("Invalid redemption code")

      // Check if user has enough punches
      if (punchcard.punches < business.punches_required) {
        throw new Error("Customer doesn't have enough punches for redemption")
      }

      // Reset the punchcard (subtract required punches)
      const newPunches = Math.max(0, punchcard.punches - business.punches_required)
      const { error: resetError } = await supabase
        .from("punchcards")
        .update({
          punches: newPunches,
          last_redemption_at: new Date().toISOString(),
        })
        .eq("id", punchcardId)

      if (resetError) throw resetError

      // Log the redemption
      await supabase.from("redemption_history").insert({
        user_id: userId,
        business_id: businessId,
        punchcard_id: punchcardId,
        reward_redeemed: reward,
        redeemed_at: new Date().toISOString(),
      })

      toast({
        title: "Reward Redeemed! 🎉",
        description: `${customerName || punchcard.users.name || punchcard.users.email} redeemed: ${reward}`,
        duration: 5000,
      })

      // Reload customer data
      loadBusinessData()
    } catch (error: any) {
      console.error("Redemption error:", error)
      toast({
        title: "Redemption Error",
        description: error.message || "Failed to process redemption.",
        variant: "destructive",
      })
    }
  }

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.users?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.users?.email?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 relative overflow-hidden">
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
          <CreditCard className="h-6 w-6 text-blue-600 animate-spin" />
          <p className="text-slate-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (!business) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Business not found</p>
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
              <div className="w-8 h-8 bg-gradient-to-br from-slate-600 to-blue-600 rounded-lg flex items-center justify-center">
                <CreditCard className="h-4 w-4 text-white" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-slate-700 to-blue-600 bg-clip-text text-transparent">
                {business.name}
              </h1>
            </div>
          </div>
          <Link href="/business/settings">
            <Button variant="outline" size="sm" className="border-slate-300 hover:bg-slate-50">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 relative z-10">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-1">
              <Card className="sticky top-24 border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg text-slate-800">Dashboard</CardTitle>
                  <CardDescription className="text-slate-600">Manage your loyalty program</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <TabsList className="flex flex-col h-auto bg-transparent space-y-1 p-0 w-full">
                    <TabsTrigger
                      value="scanner"
                      className="justify-start px-4 py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-slate-100 data-[state=active]:to-blue-100 data-[state=active]:text-slate-800 rounded-lg border-l-2 data-[state=active]:border-blue-600 border-transparent w-full transition-all duration-200 hover:bg-slate-50"
                    >
                      <QrCode className="h-4 w-4 mr-3" />
                      QR Scanner
                    </TabsTrigger>
                    <TabsTrigger
                      value="customers"
                      className="justify-start px-4 py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-slate-100 data-[state=active]:to-blue-100 data-[state=active]:text-slate-800 rounded-lg border-l-2 data-[state=active]:border-blue-600 border-transparent w-full transition-all duration-200 hover:bg-slate-50"
                    >
                      <Users className="h-4 w-4 mr-3" />
                      Customers
                    </TabsTrigger>
                    <TabsTrigger
                      value="rewards"
                      className="justify-start px-4 py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-slate-100 data-[state=active]:to-blue-100 data-[state=active]:text-slate-800 rounded-lg border-l-2 data-[state=active]:border-blue-600 border-transparent w-full transition-all duration-200 hover:bg-slate-50"
                    >
                      <Gift className="h-4 w-4 mr-3" />
                      Rewards
                    </TabsTrigger>
                    <TabsTrigger
                      value="email"
                      className="justify-start px-4 py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-slate-100 data-[state=active]:to-blue-100 data-[state=active]:text-slate-800 rounded-lg border-l-2 data-[state=active]:border-blue-600 border-transparent w-full transition-all duration-200 hover:bg-slate-50"
                    >
                      <Mail className="h-4 w-4 mr-3" />
                      Email List
                    </TabsTrigger>
                    <TabsTrigger
                      value="analytics"
                      className="justify-start px-4 py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-slate-100 data-[state=active]:to-blue-100 data-[state=active]:text-slate-800 rounded-lg border-l-2 data-[state=active]:border-blue-600 border-transparent w-full transition-all duration-200 hover:bg-slate-50"
                    >
                      <BarChart3 className="h-4 w-4 mr-3" />
                      Analytics
                    </TabsTrigger>
                  </TabsList>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-3">
              <TabsContent value="scanner" className="m-0">
                <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-slate-800">
                      <QrCode className="h-5 w-5" />
                      QR Scanner
                    </CardTitle>
                    <CardDescription className="text-slate-600">
                      Scan customer QR codes to add punches or process redemptions automatically
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <QrScanner onScan={handleQrScan} onRedemptionScan={handleRedemptionScan} businessId={business.id} />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="customers" className="m-0">
                <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-slate-800">
                      <Users className="h-5 w-5" />
                      Customer Management
                    </CardTitle>
                    <CardDescription className="text-slate-600">View and manage your loyal customers</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-6">
                      <Label htmlFor="search" className="sr-only">
                        Search
                      </Label>
                      <Input
                        id="search"
                        placeholder="Search customers..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="max-w-sm border-slate-300 focus:border-blue-500"
                      />
                    </div>
                    <CustomerList customers={filteredCustomers} business={business} />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="rewards" className="m-0">
                <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-slate-800">
                      <Gift className="h-5 w-5" />
                      Rewards Management
                    </CardTitle>
                    <CardDescription className="text-slate-600">Create and manage custom rewards</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <RewardsManagement businessId={business.id} />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="email" className="m-0">
                <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-slate-800">
                      <Mail className="h-5 w-5" />
                      Customer Email List
                    </CardTitle>
                    <CardDescription className="text-slate-600">Manage your customer mailing list</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <EmailList businessId={business.id} />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="analytics" className="m-0">
                <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-slate-800">
                      <BarChart3 className="h-5 w-5" />
                      Analytics Overview
                    </CardTitle>
                    <CardDescription className="text-slate-600">Track your business performance</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                        <p className="text-sm text-blue-600 font-medium">Total Customers</p>
                        <p className="text-2xl font-bold text-blue-800">{customers.length}</p>
                      </div>
                      <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200">
                        <p className="text-sm text-green-600 font-medium">Active Rewards</p>
                        <p className="text-2xl font-bold text-green-800">
                          {customers.filter((c) => c.punches >= business.punches_required).length}
                        </p>
                      </div>
                      <div className="p-4 bg-gradient-to-br from-purple-50 to-violet-50 rounded-lg border border-purple-200">
                        <p className="text-sm text-purple-600 font-medium">Total Punches</p>
                        <p className="text-2xl font-bold text-purple-800">
                          {customers.reduce((sum, c) => sum + c.punches, 0)}
                        </p>
                      </div>
                    </div>
                    <div className="text-center py-8 text-slate-500">
                      <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Detailed analytics coming soon...</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </div>
          </div>
        </Tabs>
      </main>
    </div>
  )
}
