"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Shield, Search, Trash2, AlertTriangle, Building2, Users, Activity, LogOut } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"

interface Business {
  id: string
  name: string
  email: string
  business_type: string
  location: string
  created_at: string
  customer_count?: number
  total_punches?: number
  last_activity?: string
}

export default function DeveloperDashboard() {
  const router = useRouter()
  const { toast } = useToast()
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [stats, setStats] = useState({
    totalBusinesses: 0,
    totalCustomers: 0,
    totalPunches: 0,
    activeToday: 0,
  })

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = () => {
    const auth = localStorage.getItem("developerAuth")
    const loginTime = localStorage.getItem("developerLoginTime")

    if (!auth || auth !== "authenticated") {
      router.push("/developer/login")
      return
    }

    // Check if session is older than 24 hours
    if (loginTime) {
      const sessionAge = Date.now() - Number.parseInt(loginTime)
      const maxAge = 24 * 60 * 60 * 1000 // 24 hours
      if (sessionAge > maxAge) {
        handleLogout()
        return
      }
    }

    loadDashboardData()
  }

  const loadDashboardData = async () => {
    try {
      // Load all businesses
      const { data: businessesData, error: businessesError } = await supabase
        .from("businesses")
        .select("*")
        .order("created_at", { ascending: false })

      if (businessesError) throw businessesError

      // Load customer counts and activity for each business
      const businessesWithStats = await Promise.all(
        (businessesData || []).map(async (business) => {
          // Get customer count
          const { count: customerCount } = await supabase
            .from("punchcards")
            .select("*", { count: "exact", head: true })
            .eq("business_id", business.id)

          // Get total punches
          const { data: punchcards } = await supabase
            .from("punchcards")
            .select("punches")
            .eq("business_id", business.id)

          const totalPunches = punchcards?.reduce((sum, pc) => sum + pc.punches, 0) || 0

          // Get last activity - try punch_history first, fallback to punchcards
          let lastActivity = null
          try {
            const { data: punchHistory } = await supabase
              .from("punch_history")
              .select("created_at")
              .eq("business_id", business.id)
              .order("created_at", { ascending: false })
              .limit(1)

            lastActivity = punchHistory?.[0]?.created_at || null
          } catch (error) {
            // If punch_history doesn't exist, use punchcards updated_at
            const { data: punchcardActivity } = await supabase
              .from("punchcards")
              .select("updated_at")
              .eq("business_id", business.id)
              .order("updated_at", { ascending: false })
              .limit(1)

            lastActivity = punchcardActivity?.[0]?.updated_at || null
          }

          return {
            ...business,
            customer_count: customerCount || 0,
            total_punches: totalPunches,
            last_activity: lastActivity,
          }
        }),
      )

      setBusinesses(businessesWithStats)

      // Calculate overall stats
      const totalBusinesses = businessesWithStats.length
      const totalCustomers = businessesWithStats.reduce((sum, b) => sum + (b.customer_count || 0), 0)
      const totalPunches = businessesWithStats.reduce((sum, b) => sum + (b.total_punches || 0), 0)

      // Count businesses active today
      const today = new Date().toISOString().split("T")[0]
      const activeToday = businessesWithStats.filter((b) => b.last_activity?.startsWith(today)).length

      setStats({
        totalBusinesses,
        totalCustomers,
        totalPunches,
        activeToday,
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load dashboard data.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Helper function to safely delete from a table
  const safeDelete = async (tableName: string, condition: any, conditionValue: string) => {
    try {
      const { error } = await supabase.from(tableName).delete().eq(condition, conditionValue)

      if (error) {
        // Check if it's a "table doesn't exist" error
        if (error.message.includes("does not exist") || error.code === "42P01") {
          console.log(`⚠️ Table ${tableName} does not exist, skipping...`)
          return { success: true, skipped: true }
        }
        throw error
      }

      console.log(`✅ Deleted from ${tableName}`)
      return { success: true, skipped: false }
    } catch (error: any) {
      console.error(`❌ Error deleting from ${tableName}:`, error)
      return { success: false, error: error.message }
    }
  }

  // Helper function to safely delete with IN condition
  const safeDeleteIn = async (tableName: string, condition: string, values: string[]) => {
    if (values.length === 0) return { success: true, skipped: true }

    try {
      const { error } = await supabase.from(tableName).delete().in(condition, values)

      if (error) {
        if (error.message.includes("does not exist") || error.code === "42P01") {
          console.log(`⚠️ Table ${tableName} does not exist, skipping...`)
          return { success: true, skipped: true }
        }
        throw error
      }

      console.log(`✅ Deleted from ${tableName}`)
      return { success: true, skipped: false }
    } catch (error: any) {
      console.error(`❌ Error deleting from ${tableName}:`, error)
      return { success: false, error: error.message }
    }
  }

  const handleKillSwitch = async (business: Business) => {
    setIsDeleting(true)

    try {
      console.log(`🔥 Initiating kill switch for business: ${business.name}`)

      // Step 1: Get all punchcards for this business to find related user data
      const { data: punchcards, error: punchcardsQueryError } = await supabase
        .from("punchcards")
        .select("id, user_id")
        .eq("business_id", business.id)

      if (punchcardsQueryError) {
        console.error("Error querying punchcards:", punchcardsQueryError)
        throw punchcardsQueryError
      }

      const punchcardIds = punchcards?.map((pc) => pc.id) || []
      const userIds = punchcards?.map((pc) => pc.user_id) || []

      console.log(`Found ${punchcardIds.length} punchcards to delete`)

      // Step 2: Delete redemption history (try both by punchcard_id and business_id)
      if (punchcardIds.length > 0) {
        const redemptionResult = await safeDeleteIn("redemption_history", "punchcard_id", punchcardIds)
        if (!redemptionResult.success && !redemptionResult.skipped) {
          console.warn("Failed to delete redemption history by punchcard_id, trying business_id...")
          await safeDelete("redemption_history", "business_id", business.id)
        }
      }

      // Step 3: Delete punch history
      await safeDelete("punch_history", "business_id", business.id)

      // Step 4: Delete business rewards
      await safeDelete("business_rewards", "business_id", business.id)

      // Step 5: Delete punchcards (this is critical - must succeed)
      const punchcardsResult = await safeDelete("punchcards", "business_id", business.id)
      if (!punchcardsResult.success) {
        throw new Error(`Failed to delete punchcards: ${punchcardsResult.error}`)
      }

      // Step 6: Delete user recommendations
      await safeDelete("user_recommendations", "business_id", business.id)

      // Step 7: Delete business QR codes
      await safeDelete("business_qr_codes", "business_id", business.id)

      // Step 8: Delete email logs related to business
      await safeDelete("email_logs", "recipient_email", business.email)

      // Step 9: Delete email verification records
      await safeDelete("email_verifications", "email", business.email)

      // Step 10: Finally delete the business account (this is critical - must succeed)
      const businessResult = await safeDelete("businesses", "id", business.id)
      if (!businessResult.success) {
        throw new Error(`Failed to delete business: ${businessResult.error}`)
      }

      // Step 11: Log the kill switch action
      try {
        await supabase.from("email_logs").insert({
          recipient_email: "developer@cardo.com",
          subject: "🔥 KILL SWITCH ACTIVATED",
          content: `Business "${business.name}" (${business.email}) has been permanently deleted by developer at ${new Date().toISOString()}. Affected users: ${userIds.length}, Punchcards deleted: ${punchcardIds.length}`,
          email_type: "kill_switch",
          sent_at: new Date().toISOString(),
        })
      } catch (logError) {
        console.error("Failed to log kill switch action:", logError)
        // Don't fail the entire operation if logging fails
      }

      toast({
        title: "🔥 Kill Switch Activated",
        description: `${business.name} has been permanently deleted from the system. ${punchcardIds.length} punchcards and all related data removed.`,
        variant: "destructive",
      })

      console.log(`🔥 Kill switch completed successfully for ${business.name}`)

      // Reload data to reflect changes
      await loadDashboardData()
      setSelectedBusiness(null)
    } catch (error: any) {
      console.error("Kill switch failed:", error)
      toast({
        title: "Kill Switch Failed",
        description: error.message || "Failed to delete business. Check console for details.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("developerAuth")
    localStorage.removeItem("developerLoginTime")
    router.push("/developer/login")
  }

  const filteredBusinesses = businesses.filter(
    (business) =>
      business.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      business.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      business.location.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-900 via-gray-900 to-black">
        <div className="flex items-center gap-3 text-white">
          <Shield className="h-6 w-6 animate-spin" />
          <p>Loading developer dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-900 via-gray-900 to-black relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 opacity-20">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(rgba(239, 68, 68, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(239, 68, 68, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: "50px 50px",
          }}
        ></div>
      </div>

      <header className="bg-gray-900/80 backdrop-blur-sm border-b border-red-800 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-red-600 to-orange-600 rounded-lg flex items-center justify-center">
              <Shield className="h-4 w-4 text-white" />
            </div>
            <h1 className="text-xl font-bold text-red-400">Cardo Developer Dashboard</h1>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            size="sm"
            className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 relative z-10">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-gray-900/80 border-red-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Building2 className="h-8 w-8 text-red-400" />
                <div>
                  <p className="text-2xl font-bold text-white">{stats.totalBusinesses}</p>
                  <p className="text-sm text-gray-400">Total Businesses</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/80 border-red-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Users className="h-8 w-8 text-orange-400" />
                <div>
                  <p className="text-2xl font-bold text-white">{stats.totalCustomers}</p>
                  <p className="text-sm text-gray-400">Total Customers</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/80 border-red-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Activity className="h-8 w-8 text-yellow-400" />
                <div>
                  <p className="text-2xl font-bold text-white">{stats.totalPunches}</p>
                  <p className="text-sm text-gray-400">Total Punches</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/80 border-red-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Shield className="h-8 w-8 text-green-400" />
                <div>
                  <p className="text-2xl font-bold text-white">{stats.activeToday}</p>
                  <p className="text-sm text-gray-400">Active Today</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Business Management */}
        <Card className="bg-gray-900/80 border-red-800">
          <CardHeader>
            <CardTitle className="text-red-400 flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Business Management
            </CardTitle>
            <CardDescription className="text-gray-400">
              Monitor and manage all businesses using the Cardo platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search businesses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-red-500"
                />
              </div>
            </div>

            <div className="rounded-md border border-gray-700 overflow-hidden">
              <Table>
                <TableHeader className="bg-gray-800">
                  <TableRow className="border-gray-700">
                    <TableHead className="text-gray-300">Business</TableHead>
                    <TableHead className="text-gray-300">Type</TableHead>
                    <TableHead className="text-gray-300">Customers</TableHead>
                    <TableHead className="text-gray-300">Punches</TableHead>
                    <TableHead className="text-gray-300">Last Activity</TableHead>
                    <TableHead className="text-gray-300">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBusinesses.length > 0 ? (
                    filteredBusinesses.map((business) => (
                      <TableRow key={business.id} className="border-gray-700 hover:bg-gray-800/50">
                        <TableCell>
                          <div>
                            <div className="font-medium text-white">{business.name}</div>
                            <div className="text-sm text-gray-400">{business.email}</div>
                            <div className="text-xs text-gray-500">{business.location}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="border-gray-600 text-gray-300">
                            {business.business_type}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-white">{business.customer_count || 0}</TableCell>
                        <TableCell className="text-white">{business.total_punches || 0}</TableCell>
                        <TableCell className="text-gray-400">
                          {business.last_activity ? new Date(business.last_activity).toLocaleDateString() : "Never"}
                        </TableCell>
                        <TableCell>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => setSelectedBusiness(business)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                <Trash2 className="h-4 w-4 mr-1" />
                                Kill Switch
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="bg-gray-900 border-red-800">
                              <AlertDialogHeader>
                                <AlertDialogTitle className="text-red-400 flex items-center gap-2">
                                  <AlertTriangle className="h-5 w-5" />🔥 KILL SWITCH ACTIVATION
                                </AlertDialogTitle>
                              </AlertDialogHeader>

                              <div className="space-y-3 text-gray-300">
                                <div className="font-medium">
                                  You are about to permanently delete:{" "}
                                  <span className="text-red-400">{selectedBusiness?.name}</span>
                                </div>
                                <div className="bg-red-900/30 border border-red-800 rounded-lg p-3">
                                  <div className="text-red-300 font-medium mb-2">This will permanently delete:</div>
                                  <ul className="text-red-200 text-sm space-y-1">
                                    <li>• Business account and all data</li>
                                    <li>• All customer punchcards</li>
                                    <li>• All punch and redemption history</li>
                                    <li>• All business rewards and QR codes</li>
                                    <li>• All related analytics and logs</li>
                                  </ul>
                                </div>
                                <div className="text-yellow-400 font-medium">⚠️ THIS ACTION CANNOT BE UNDONE</div>
                              </div>

                              <AlertDialogFooter>
                                <AlertDialogCancel className="bg-gray-800 border-gray-600 text-white hover:bg-gray-700">
                                  Cancel
                                </AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => selectedBusiness && handleKillSwitch(selectedBusiness)}
                                  disabled={isDeleting}
                                  className="bg-red-600 hover:bg-red-700 text-white"
                                >
                                  {isDeleting ? "Deleting..." : "🔥 ACTIVATE KILL SWITCH"}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow className="border-gray-700">
                      <TableCell colSpan={6} className="text-center py-8 text-gray-400">
                        No businesses found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
