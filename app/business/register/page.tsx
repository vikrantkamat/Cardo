"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ArrowLeft, ArrowRight, Camera, Check, Coffee } from "lucide-react"
import { cn } from "@/lib/utils"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"

const businessTypes = [
  { id: "cafe", name: "Café", icon: Coffee },
  { id: "bakery", name: "Bakery", icon: () => <span className="text-xl">🥐</span> },
  { id: "juice", name: "Juice Bar", icon: () => <span className="text-xl">🥤</span> },
  { id: "coffee", name: "Coffee Shop", icon: () => <span className="text-xl">☕</span> },
]

export default function BusinessRegister() {
  const router = useRouter()
  const { toast } = useToast()
  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    businessName: "",
    email: "",
    password: "",
    businessType: "",
    logo: null as File | null,
    primaryColor: "#6d28d9",
    secondaryColor: "#0d9488",
    location: "",
    description: "",
    punchesRequired: 10,
    reward: "Free Item",
  })

  const updateFormData = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleNext = () => {
    setStep((prev) => prev + 1)
  }

  const handleBack = () => {
    setStep((prev) => prev - 1)
  }

  const completeRegistration = async () => {
    setIsLoading(true)

    try {
      console.log("Starting business registration...")

      // Validate required fields
      if (!formData.businessName || !formData.email || !formData.password) {
        throw new Error("Please fill in all required fields")
      }

      if (!formData.businessType) {
        throw new Error("Please select a business type")
      }

      if (!formData.location || !formData.description || !formData.reward) {
        throw new Error("Please complete all business details")
      }

      // Hash password (in production, use proper password hashing)
      const passwordHash = btoa(formData.password)

      console.log("Inserting business data...")

      // Insert business
      const { data: business, error: businessError } = await supabase
        .from("businesses")
        .insert({
          name: formData.businessName,
          email: formData.email,
          password_hash: passwordHash,
          business_type: formData.businessType,
          primary_color: formData.primaryColor,
          secondary_color: formData.secondaryColor,
          location: formData.location,
          description: formData.description,
          punches_required: formData.punchesRequired,
          reward: formData.reward,
          rating: 4.5, // Default rating
        })
        .select()
        .single()

      if (businessError) {
        console.error("Business creation error:", businessError)
        throw new Error(businessError.message || "Failed to create business")
      }

      if (!business) {
        throw new Error("Failed to create business - no data returned")
      }

      console.log("Business created:", business)

      // Generate unique QR code for business
      const qrCode = `business-${business.id}-${Date.now()}`

      console.log("Creating QR code...")

      const { error: qrError } = await supabase.from("business_qr_codes").insert({
        business_id: business.id,
        qr_code: qrCode,
        is_active: true,
      })

      if (qrError) {
        console.error("QR code creation error:", qrError)
        // Don't throw error for QR code creation failure, just log it
        console.warn("QR code creation failed, but continuing...")
      }

      // Store business info in localStorage for dashboard access
      localStorage.setItem("businessId", business.id)
      localStorage.setItem("businessEmail", business.email)
      localStorage.setItem("businessName", business.name)

      console.log("Business registration completed successfully")

      toast({
        title: "Success!",
        description: `Welcome ${business.name}! Your business is now registered.`,
      })

      // Navigate to dashboard
      router.push("/business/dashboard")
    } catch (error: any) {
      console.error("Registration error:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to register business.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const requestCameraAndComplete = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      // Stop the stream immediately after permission is granted
      stream.getTracks().forEach((track) => track.stop())

      toast({
        title: "Camera Access Granted",
        description: "Setting up your business account...",
      })

      // Automatically complete registration after camera permission
      await completeRegistration()
    } catch (error) {
      toast({
        title: "Camera Access Denied",
        description: "You can still complete setup without camera access.",
        variant: "destructive",
      })
      // Still allow completion without camera
      await completeRegistration()
    }
  }

  const isStepValid = () => {
    switch (step) {
      case 1:
        return formData.businessName && formData.email && formData.password
      case 2:
        return formData.businessType
      case 3:
        return formData.location && formData.description && formData.reward
      case 4:
        return true
      default:
        return false
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-50 to-blue-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full">
        <Card className="border-2 border-violet-200 shadow-lg">
          <CardHeader className="bg-violet-100">
            <CardTitle className="text-violet-800">Business Registration</CardTitle>
            <CardDescription>
              Step {step} of 4:{" "}
              {step === 1
                ? "Basic Information"
                : step === 2
                  ? "Business Type"
                  : step === 3
                    ? "Business Details"
                    : "Complete Setup"}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {step === 1 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="businessName">Business Name</Label>
                  <Input
                    id="businessName"
                    placeholder="Enter your business name"
                    value={formData.businessName}
                    onChange={(e) => updateFormData("businessName", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Business Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your business email"
                    value={formData.email}
                    onChange={(e) => updateFormData("email", e.target.value)}
                    required
                  />
                  <p className="text-xs text-gray-500">
                    Used for customer analytics, notifications, and business communications
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Create a password"
                    value={formData.password}
                    onChange={(e) => updateFormData("password", e.target.value)}
                    required
                  />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <Label>Select your business type</Label>
                <RadioGroup
                  value={formData.businessType}
                  onValueChange={(value) => updateFormData("businessType", value)}
                  className="grid grid-cols-2 gap-4"
                >
                  {businessTypes.map((type) => {
                    const Icon = type.icon
                    return (
                      <div key={type.id} className="relative">
                        <RadioGroupItem value={type.id} id={type.id} className="peer sr-only" />
                        <Label
                          htmlFor={type.id}
                          className={cn(
                            "flex flex-col items-center justify-center rounded-md border-2 border-muted bg-white p-4 hover:bg-gray-50 hover:border-violet-200 peer-data-[state=checked]:border-violet-600 peer-data-[state=checked]:bg-violet-50 [&:has([data-state=checked])]:border-violet-600",
                            "cursor-pointer transition-all",
                          )}
                        >
                          <Icon />
                          <span className="mt-2">{type.name}</span>
                          {formData.businessType === type.id && (
                            <Check className="absolute top-2 right-2 h-4 w-4 text-violet-600" />
                          )}
                        </Label>
                      </div>
                    )
                  })}
                </RadioGroup>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="location">Business Address</Label>
                  <Input
                    id="location"
                    placeholder="123 Main St, City, State"
                    value={formData.location}
                    onChange={(e) => updateFormData("location", e.target.value)}
                    required
                  />
                  <p className="text-xs text-gray-500">
                    Used for customer location-based recommendations and delivery analytics
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    placeholder="Brief description of your business"
                    value={formData.description}
                    onChange={(e) => updateFormData("description", e.target.value)}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="punchesRequired">Punches Required</Label>
                    <Input
                      id="punchesRequired"
                      type="number"
                      min="1"
                      max="20"
                      value={formData.punchesRequired}
                      onChange={(e) => updateFormData("punchesRequired", Number.parseInt(e.target.value) || 10)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reward">Reward</Label>
                    <Input
                      id="reward"
                      placeholder="Free Coffee"
                      value={formData.reward}
                      onChange={(e) => updateFormData("reward", e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="primaryColor">Primary Color</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="primaryColor"
                        type="color"
                        value={formData.primaryColor}
                        onChange={(e) => updateFormData("primaryColor", e.target.value)}
                        className="w-12 h-8 p-1"
                      />
                      <span className="text-sm">{formData.primaryColor}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="secondaryColor">Secondary Color</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="secondaryColor"
                        type="color"
                        value={formData.secondaryColor}
                        onChange={(e) => updateFormData("secondaryColor", e.target.value)}
                        className="w-12 h-8 p-1"
                      />
                      <span className="text-sm">{formData.secondaryColor}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-4">
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 text-center">
                  <Camera className="h-16 w-16 mx-auto text-violet-600 mb-4" />
                  <h3 className="text-lg font-medium mb-2">Ready to Launch!</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Click below to complete your setup. We'll enable camera access for QR scanning and take you to your
                    dashboard.
                  </p>
                  <div className="space-y-3">
                    <Button
                      onClick={requestCameraAndComplete}
                      disabled={isLoading}
                      className="w-full bg-green-600 hover:bg-green-700"
                    >
                      {isLoading ? "Setting up..." : "Enable Camera & Complete Setup"}
                      <Camera className="ml-2 h-4 w-4" />
                    </Button>
                    <Button onClick={completeRegistration} disabled={isLoading} variant="outline" className="w-full">
                      {isLoading ? "Setting up..." : "Complete Setup (Skip Camera)"}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between border-t border-gray-100 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={step === 1 ? () => router.push("/") : handleBack}
              className="flex items-center gap-1"
              disabled={isLoading}
            >
              <ArrowLeft className="h-4 w-4" />
              {step === 1 ? "Cancel" : "Back"}
            </Button>
            {step < 4 && (
              <Button
                type="button"
                onClick={handleNext}
                disabled={!isStepValid() || isLoading}
                className="flex items-center gap-1 bg-violet-600 hover:bg-violet-700"
              >
                Next
                <ArrowRight className="h-4 w-4" />
              </Button>
            )}
          </CardFooter>
        </Card>

        <div className="flex justify-center mt-6">
          <div className="flex gap-2">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className={cn("h-2 w-2 rounded-full", s === step ? "bg-violet-600" : "bg-violet-200")} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
