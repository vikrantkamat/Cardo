"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Save, Trash2, AlertTriangle, CreditCard } from "lucide-react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export default function BusinessSettings() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [isResetting, setIsResetting] = useState(false)
  const [businessData, setBusinessData] = useState({
    name: "",
    email: "",
    business_type: "",
    location: "",
    description: "",
    primary_color: "#475569",
    secondary_color: "#3b82f6",
    punches_required: 10,
    reward: "",
  })

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

      const { data: business, error } = await supabase.from("businesses").select("*").eq("id", businessId).single()

      if (error) throw error

      setBusinessData({
        name: business.name || "",
        email: business.email || "",
        business_type: business.business_type || "",
        location: business.location || "",
        description: business.description || "",
        primary_color: business.primary_color || "#475569",
        secondary_color: business.secondary_color || "#3b82f6",
        punches_required: business.punches_required || 10,
        reward: business.reward || "",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load business data.",
        variant: "destructive",
      })
    }
  }

  const handleSave = async () => {
    setIsLoading(true)

    try {
      const businessId = localStorage.getItem("businessId")
      if (!businessId) throw new Error("Business not found")

      const { error } = await supabase
        .from("businesses")
        .update({
          name: businessData.name,
          email: businessData.email,
          business_type: businessData.business_type,
          location: businessData.location,
          description: businessData.description,
          primary_color: businessData.primary_color,
          secondary_color: businessData.secondary_color,
          punches_required: businessData.punches_required,
          reward: businessData.reward,
        })
        .eq("id", businessId)

      if (error) throw error

      // Update localStorage
      localStorage.setItem("businessName", businessData.name)
      localStorage.setItem("businessEmail", businessData.email)

      toast({
        title: "Success! ✨",
        description: "Your business settings have been updated.",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update settings.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleResetAllPunches = async () => {
    setIsResetting(true)

    try {
      const businessId = localStorage.getItem("businessId")
      if (!businessId) throw new Error("Business not found")

      // Reset all punchcards for this business
      const { error: punchcardError } = await supabase
        .from("punchcards")
        .update({ punches: 0, last_punch_at: null })
        .eq("business_id", businessId)

      if (punchcardError) throw punchcardError

      // Delete all punch history for this business
      const { error: historyError } = await supabase.from("punch_history").delete().eq("business_id", businessId)

      if (historyError) throw historyError

      toast({
        title: "Reset Complete! ✨",
        description: "All customer punches have been reset to zero.",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to reset punches.",
        variant: "destructive",
      })
    } finally {
      setIsResetting(false)
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
            <Link href="/business/dashboard">
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-slate-100">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-slate-600 to-blue-600 rounded-lg flex items-center justify-center">
                <CreditCard className="h-4 w-4 text-white" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-slate-700 to-blue-600 bg-clip-text text-transparent">
                Business Settings
              </h1>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 relative z-10">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Business Information */}
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-slate-800">Business Information</CardTitle>
              <CardDescription className="text-slate-600">Update your business details and branding</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Business Name</Label>
                  <Input
                    id="name"
                    value={businessData.name}
                    onChange={(e) => setBusinessData({ ...businessData, name: e.target.value })}
                    className="border-slate-300 focus:border-blue-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={businessData.email}
                    onChange={(e) => setBusinessData({ ...businessData, email: e.target.value })}
                    className="border-slate-300 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="business_type">Business Type</Label>
                <Select
                  value={businessData.business_type}
                  onValueChange={(value) => setBusinessData({ ...businessData, business_type: value })}
                >
                  <SelectTrigger className="border-slate-300 focus:border-blue-500">
                    <SelectValue placeholder="Select business type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cafe">Café</SelectItem>
                    <SelectItem value="bakery">Bakery</SelectItem>
                    <SelectItem value="juice">Juice Bar</SelectItem>
                    <SelectItem value="coffee">Coffee Shop</SelectItem>
                    <SelectItem value="restaurant">Restaurant</SelectItem>
                    <SelectItem value="retail">Retail Store</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={businessData.location}
                  onChange={(e) => setBusinessData({ ...businessData, location: e.target.value })}
                  placeholder="123 Main St, City, State"
                  className="border-slate-300 focus:border-blue-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={businessData.description}
                  onChange={(e) => setBusinessData({ ...businessData, description: e.target.value })}
                  placeholder="Brief description of your business"
                  className="border-slate-300 focus:border-blue-500"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="primary_color">Primary Color</Label>
                  <div className="flex items-center gap-3">
                    <Input
                      id="primary_color"
                      type="color"
                      value={businessData.primary_color}
                      onChange={(e) => setBusinessData({ ...businessData, primary_color: e.target.value })}
                      className="w-16 h-10 p-1 border-slate-300"
                    />
                    <span className="text-sm text-slate-600">{businessData.primary_color}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="secondary_color">Secondary Color</Label>
                  <div className="flex items-center gap-3">
                    <Input
                      id="secondary_color"
                      type="color"
                      value={businessData.secondary_color}
                      onChange={(e) => setBusinessData({ ...businessData, secondary_color: e.target.value })}
                      className="w-16 h-10 p-1 border-slate-300"
                    />
                    <span className="text-sm text-slate-600">{businessData.secondary_color}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Loyalty Program Settings */}
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-slate-800">Loyalty Program</CardTitle>
              <CardDescription className="text-slate-600">Configure your reward system</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="punches_required">Punches Required</Label>
                  <Input
                    id="punches_required"
                    type="number"
                    min="1"
                    max="20"
                    value={businessData.punches_required}
                    onChange={(e) =>
                      setBusinessData({ ...businessData, punches_required: Number.parseInt(e.target.value) || 10 })
                    }
                    className="border-slate-300 focus:border-blue-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reward">Reward</Label>
                  <Input
                    id="reward"
                    value={businessData.reward}
                    onChange={(e) => setBusinessData({ ...businessData, reward: e.target.value })}
                    placeholder="Free Coffee, 10% Off, etc."
                    className="border-slate-300 focus:border-blue-500"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm border-red-200">
            <CardHeader>
              <CardTitle className="text-red-700 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Danger Zone
              </CardTitle>
              <CardDescription className="text-red-600">Irreversible actions for your business</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <h4 className="font-medium text-red-800 mb-2">Reset All Customer Punches</h4>
                <p className="text-sm text-red-600 mb-4">
                  This will reset all customer punch counts to zero and delete punch history. This action cannot be
                  undone.
                </p>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm" disabled={isResetting}>
                      <Trash2 className="h-4 w-4 mr-2" />
                      {isResetting ? "Resetting..." : "Reset All Punches"}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently reset all customer punch counts to zero and
                        delete all punch history for your business.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleResetAllPunches} className="bg-red-600 hover:bg-red-700">
                        Yes, reset all punches
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button
              onClick={handleSave}
              disabled={isLoading}
              className="bg-gradient-to-r from-slate-600 to-blue-600 hover:from-slate-700 hover:to-blue-700 text-white shadow-md hover:shadow-lg transition-all duration-200"
            >
              {isLoading ? "Saving..." : "Save Changes"}
              <Save className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
