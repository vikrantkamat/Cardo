"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Save, User, CreditCard } from "lucide-react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import { AccountDeletion } from "@/components/account-deletion"

export default function UserProfile() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    address: "",
    phone: "",
  })
  const [oldAddress, setOldAddress] = useState("")
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    loadUserData()
  }, [])

  const loadUserData = async () => {
    try {
      const storedUserId = localStorage.getItem("userId")
      if (!storedUserId) {
        router.push("/user/auth")
        return
      }

      setUserId(storedUserId)

      const { data: user, error } = await supabase.from("users").select("*").eq("id", storedUserId).single()

      if (error) throw error

      setUserData({
        name: user.name || "",
        email: user.email || "",
        address: user.address || "",
        phone: user.phone || "",
      })

      setOldAddress(user.address || "")
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load user data.",
        variant: "destructive",
      })
    }
  }

  const findNearbyBusinesses = async (userId: string, address: string) => {
    try {
      if (!address) return

      // In a real app, you would use geocoding and distance calculations
      // For now, we'll simulate finding nearby businesses
      const { data: businesses, error } = await supabase.from("businesses").select("*").limit(5)

      if (error) throw error

      // Delete old location-based recommendations
      await supabase
        .from("user_recommendations")
        .delete()
        .eq("user_id", userId)
        .eq("recommendation_type", "location_based")

      // Create new recommendations based on address
      if (businesses && businesses.length > 0) {
        const recommendations = businesses.map((business) => ({
          user_id: userId,
          business_id: business.id,
          recommendation_type: "location_based",
          reason: `Near your new address: ${address}`,
          created_at: new Date().toISOString(),
        }))

        await supabase.from("user_recommendations").insert(recommendations)
        console.log("Created new location-based recommendations for user")
      }
    } catch (error) {
      console.error("Failed to create recommendations:", error)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const storedUserId = localStorage.getItem("userId")
      if (!storedUserId) throw new Error("User not found")

      const { error } = await supabase
        .from("users")
        .update({
          name: userData.name,
          email: userData.email,
          address: userData.address,
          phone: userData.phone,
        })
        .eq("id", storedUserId)

      if (error) throw error

      // Update localStorage
      localStorage.setItem("userName", userData.name)
      localStorage.setItem("userEmail", userData.email)

      // If address changed, update location-based recommendations
      if (userData.address !== oldAddress) {
        await findNearbyBusinesses(storedUserId, userData.address)

        // Log address change for analytics
        await supabase.from("email_logs").insert({
          recipient_email: userData.email,
          subject: "Address Updated",
          content: `Your address has been updated to: ${userData.address}. We've updated your nearby business recommendations.`,
          email_type: "address_change",
          sent_at: new Date().toISOString(),
        })
      }

      toast({
        title: "Success! ✨",
        description:
          userData.address !== oldAddress
            ? "Your profile has been updated. We've found new businesses near you!"
            : "Your profile has been updated.",
      })

      setOldAddress(userData.address)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
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
                My Profile
              </h1>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 relative z-10">
        <div className="max-w-2xl mx-auto space-y-6">
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile Information
              </CardTitle>
              <CardDescription>Update your personal information and preferences</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSave} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={userData.name}
                    onChange={(e) => setUserData({ ...userData, name: e.target.value })}
                    required
                    className="border-slate-300 focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={userData.email}
                    onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                    required
                    className="border-slate-300 focus:border-indigo-500"
                  />
                  <p className="text-xs text-slate-500">Used for notifications and account recovery</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={userData.address}
                    onChange={(e) => setUserData({ ...userData, address: e.target.value })}
                    placeholder="123 Main St, City, State"
                    className="border-slate-300 focus:border-indigo-500"
                  />
                  <p className="text-xs text-slate-500">
                    Used to find nearby businesses and provide personalized recommendations
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={userData.phone}
                    onChange={(e) => setUserData({ ...userData, phone: e.target.value })}
                    placeholder="(555) 123-4567"
                    className="border-slate-300 focus:border-indigo-500"
                  />
                  <p className="text-xs text-slate-500">Used for SMS notifications about rewards</p>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white shadow-md hover:shadow-lg transition-all duration-200"
                  disabled={isLoading}
                >
                  {isLoading ? "Saving..." : "Save Changes"}
                  <Save className="ml-2 h-4 w-4" />
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Analytics & Preferences</CardTitle>
              <CardDescription>How we use your information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                <div>
                  <p className="font-medium text-sm">Location-based recommendations</p>
                  <p className="text-xs text-gray-500">Find businesses near your address</p>
                </div>
                <div className="text-green-600 text-sm">✓ Active</div>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                <div>
                  <p className="font-medium text-sm">Reward notifications</p>
                  <p className="text-xs text-gray-500">Get notified when rewards are ready</p>
                </div>
                <div className="text-green-600 text-sm">✓ Active</div>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                <div>
                  <p className="font-medium text-sm">Usage analytics</p>
                  <p className="text-xs text-gray-500">Help improve the app experience</p>
                </div>
                <div className="text-green-600 text-sm">✓ Active</div>
              </div>
            </CardContent>
          </Card>

          {/* Account Deletion Section */}
          {userId && userData.email && <AccountDeletion userId={userId} userEmail={userData.email} />}
        </div>
      </main>
    </div>
  )
}
