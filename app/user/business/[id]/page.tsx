"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { UserQRCode } from "@/components/user-qr-code"
import { PunchCard } from "@/components/punch-card"
import { ArrowLeft, Gift, Heart, MapPin, QrCode, CreditCard } from "lucide-react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import { ProgressTaskbar } from "@/components/progress-taskbar"

export default function BusinessDetail() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [business, setBusiness] = useState<any>(null)
  const [punchcard, setPunchcard] = useState<any>(null)
  const [isQrDialogOpen, setIsQrDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    loadBusinessData()
  }, [params.id])

  const loadBusinessData = async () => {
    try {
      const storedUserId = localStorage.getItem("userId")
      if (!storedUserId) {
        router.push("/user/businesses")
        return
      }

      setUserId(storedUserId)

      // Load business details
      const { data: businessData, error: businessError } = await supabase
        .from("businesses")
        .select("*")
        .eq("id", params.id)
        .single()

      if (businessError) throw businessError
      setBusiness(businessData)

      // Load user's punchcard for this business
      const { data: punchcardData, error: punchcardError } = await supabase
        .from("punchcards")
        .select("*")
        .eq("user_id", storedUserId)
        .eq("business_id", params.id)
        .single()

      if (punchcardError && punchcardError.code !== "PGRST116") {
        throw punchcardError
      }

      setPunchcard(punchcardData || null)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load business data.",
        variant: "destructive",
      })
      router.push("/user/businesses")
    } finally {
      setIsLoading(false)
    }
  }

  const toggleFavorite = async () => {
    if (!userId || !business) return

    try {
      if (punchcard) {
        // Update existing punchcard
        const { data: updatedPunchcard, error } = await supabase
          .from("punchcards")
          .update({ is_favorite: !punchcard.is_favorite })
          .eq("id", punchcard.id)
          .select()
          .single()

        if (error) throw error
        setPunchcard(updatedPunchcard)
      } else {
        // Create new punchcard with favorite status
        const { data: newPunchcard, error } = await supabase
          .from("punchcards")
          .insert({
            user_id: userId,
            business_id: business.id,
            punches: 0,
            is_favorite: true,
          })
          .select()
          .single()

        if (error) throw error
        setPunchcard(newPunchcard)
      }

      toast({
        title: "Success",
        description: "Favorite status updated.",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update favorite.",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
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
    <div
      className="min-h-screen relative overflow-hidden"
      style={{
        background: `linear-gradient(to bottom, ${business.primary_color}10, #f9fafb)`,
      }}
    >
      {/* Enhanced Grid gradient background */}
      <div className="absolute inset-0 opacity-25">
        <div className="absolute inset-0 bg-gradient-to-r from-slate-500/8 via-blue-500/6 to-indigo-500/8"></div>
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(rgba(71, 85, 105, 0.04) 1px, transparent 1px),
              linear-gradient(90deg, rgba(71, 85, 105, 0.04) 1px, transparent 1px),
              linear-gradient(rgba(59, 130, 246, 0.03) 1px, transparent 1px),
              linear-gradient(90deg, rgba(59, 130, 246, 0.03) 1px, transparent 1px),
              linear-gradient(rgba(99, 102, 241, 0.02) 1px, transparent 1px),
              linear-gradient(90deg, rgba(99, 102, 241, 0.02) 1px, transparent 1px)
            `,
            backgroundSize: "100px 100px, 100px 100px, 50px 50px, 50px 50px, 25px 25px, 25px 25px",
          }}
        ></div>
      </div>

      <header
        className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10 shadow-sm"
        style={{
          borderColor: `${business.primary_color}30`,
        }}
      >
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/user/businesses">
              <Button variant="ghost" size="icon" className="rounded-full">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-xl font-bold" style={{ color: business.primary_color }}>
              {business.name}
            </h1>
          </div>
          <Button variant="ghost" size="icon" className="rounded-full" onClick={toggleFavorite}>
            <Heart className={`h-5 w-5 ${punchcard?.is_favorite ? "fill-red-500 text-red-500" : "text-gray-400"}`} />
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 relative z-10">
        <div className="max-w-md mx-auto">
          <Card className="mb-6 overflow-hidden border-0 shadow-lg bg-white/90 backdrop-blur-sm">
            <div
              className="h-24 w-full flex items-center justify-center"
              style={{ backgroundColor: `${business.primary_color}20` }}
            >
              <div className="h-20 w-20 object-cover rounded-full border-4 border-white shadow-md transform translate-y-10 bg-white flex items-center justify-center">
                <span className="text-3xl">
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
            <CardHeader className="pt-12 pb-4">
              <CardTitle className="text-center">{business.name}</CardTitle>
              <CardDescription className="text-center flex items-center justify-center gap-1">
                <MapPin className="h-3 w-3" />
                {business.location}
              </CardDescription>
              <div className="flex items-center justify-center gap-1 mt-1">
                <CreditCard className="h-4 w-4 text-yellow-500" />
                <span className="font-medium">{business.rating || "0.0"}</span>
              </div>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-600 mb-4">{business.description}</p>
              <div className="flex items-center justify-center gap-2 mb-4">
                <Gift className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">
                  Reward: {business.reward} after {business.punches_required} punches
                </span>
              </div>
              <PunchCard
                punches={punchcard?.punches || 0}
                totalPunches={business.punches_required}
                primaryColor={business.primary_color}
              />
            </CardContent>
            <CardFooter className="flex justify-center pb-6">
              <Dialog open={isQrDialogOpen} onOpenChange={setIsQrDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    className="gap-2"
                    style={{
                      backgroundColor: business.primary_color,
                      color: "white",
                    }}
                  >
                    <QrCode className="h-4 w-4" />
                    Show My QR Code
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Your QR Code</DialogTitle>
                  </DialogHeader>
                  <div className="flex flex-col items-center justify-center p-4">
                    <UserQRCode userId={userId!} primaryColor={business.primary_color} />
                    <p className="text-sm text-gray-500 mt-4 text-center">
                      Show this QR code to {business.name} to collect your punch
                    </p>
                  </div>
                </DialogContent>
              </Dialog>
            </CardFooter>
          </Card>

          <div className="text-center text-sm text-gray-500 mb-20">
            {punchcard?.last_punch_at && <p>Last visit: {new Date(punchcard.last_punch_at).toLocaleDateString()}</p>}
            <p className="mt-1">
              {punchcard?.punches >= business.punches_required
                ? "Reward ready! 🎉"
                : `${business.punches_required - (punchcard?.punches || 0)} more punches to earn ${business.reward}`}
            </p>
          </div>
        </div>
      </main>

      {/* Progress Taskbar - Fixed at bottom */}
      {punchcard && (
        <ProgressTaskbar
          punches={punchcard.punches}
          totalPunches={business.punches_required}
          reward={business.reward}
          businessName={business.name}
          businessId={business.id}
          userId={userId!}
          punchcardId={punchcard.id}
          primaryColor={business.primary_color}
        />
      )}
    </div>
  )
}
