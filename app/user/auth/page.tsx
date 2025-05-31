"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, LogIn, UserPlus } from "lucide-react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"

export default function UserAuth() {
  const router = useRouter()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("signin")
  const [isLoading, setIsLoading] = useState(false)

  const [signInData, setSignInData] = useState({
    email: "",
    password: "",
  })

  const [signUpData, setSignUpData] = useState({
    name: "",
    email: "",
    password: "",
    address: "",
    phone: "",
  })

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      console.log("Attempting sign in...")

      if (!signInData.email || !signInData.password) {
        throw new Error("Please fill in all required fields")
      }

      // Check if user exists
      const { data: users, error: userError } = await supabase.from("users").select("*").eq("email", signInData.email)

      if (userError) {
        console.error("User lookup error:", userError)
        throw new Error("User not found. Please sign up first.")
      }

      if (!users || users.length === 0) {
        throw new Error("User not found. Please sign up first.")
      }

      const user = users[0]

      // Simple password check (in a real app, use proper password hashing)
      if (btoa(signInData.password) !== user.password_hash) {
        throw new Error("Invalid password.")
      }

      // Store user info in localStorage
      localStorage.setItem("userId", user.id)
      localStorage.setItem("userEmail", user.email)
      localStorage.setItem("userName", user.name || "User")

      console.log("Sign in successful")

      toast({
        title: "Welcome back!",
        description: "You have been signed in successfully.",
      })

      router.push("/user/businesses")
    } catch (error: any) {
      console.error("Sign in error:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to sign in.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const findNearbyBusinesses = async (address: string, userId: string) => {
    try {
      if (!address) return

      // In a real app, you would use geocoding and distance calculations
      // For now, we'll simulate finding nearby businesses
      const { data: businesses, error } = await supabase.from("businesses").select("*").limit(5)

      if (error) throw error

      // Create recommendations based on address
      if (businesses && businesses.length > 0) {
        const recommendations = businesses.map((business) => ({
          user_id: userId,
          business_id: business.id,
          recommendation_type: "location_based",
          reason: `Near your address: ${address}`,
          created_at: new Date().toISOString(),
        }))

        await supabase.from("user_recommendations").insert(recommendations)
        console.log("Created location-based recommendations for user")
      }
    } catch (error) {
      console.error("Failed to create recommendations:", error)
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      console.log("Attempting sign up...")

      // Validate required fields
      if (!signUpData.name || !signUpData.email || !signUpData.password) {
        throw new Error("Please fill in all required fields")
      }

      // Check if user already exists
      const { data: existingUsers, error: checkError } = await supabase
        .from("users")
        .select("id")
        .eq("email", signUpData.email)

      if (checkError) {
        console.error("User check error:", checkError)
        throw new Error("Error checking existing users")
      }

      if (existingUsers && existingUsers.length > 0) {
        throw new Error("User with this email already exists.")
      }

      console.log("Creating new user...")

      // Create new user
      const { data: newUser, error: createError } = await supabase
        .from("users")
        .insert({
          name: signUpData.name,
          email: signUpData.email,
          password_hash: btoa(signUpData.password), // Simple encoding for demo
          address: signUpData.address || null,
          phone: signUpData.phone || null,
        })
        .select()
        .single()

      if (createError) {
        console.error("Create user error:", createError)
        throw new Error(createError.message || "Failed to create account")
      }

      if (!newUser) {
        throw new Error("Failed to create user account - no data returned")
      }

      console.log("User created successfully:", newUser)

      // Log email that would be sent
      const emailContent = {
        to: newUser.email,
        subject: `Welcome to PunchCard, ${newUser.name}!`,
        body: `
          Welcome to PunchCard! Start collecting rewards at your favorite local businesses.
          
          Here's what you can do:
          1. Find participating businesses near you
          2. Show your QR code to collect punches
          3. Redeem rewards when you complete your punch cards
          
          ${signUpData.address ? `We'll show you businesses near: ${signUpData.address}` : "Add your address in your profile to see nearby businesses"}
          
          Happy collecting!
        `,
      }

      console.log("Welcome email would be sent:", emailContent)

      // Store email log in database
      await supabase.from("email_logs").insert({
        recipient_email: newUser.email,
        subject: emailContent.subject,
        content: emailContent.body,
        email_type: "user_welcome",
        sent_at: new Date().toISOString(),
      })

      // Find nearby businesses if address provided
      if (signUpData.address) {
        await findNearbyBusinesses(signUpData.address, newUser.id)
      }

      // Store user info in localStorage
      localStorage.setItem("userId", newUser.id)
      localStorage.setItem("userEmail", newUser.email)
      localStorage.setItem("userName", newUser.name)

      console.log("Account creation completed successfully")

      toast({
        title: "Welcome to PunchCard!",
        description: signUpData.address
          ? "Account created! We've found businesses near you."
          : "Account created! Check your email for tips.",
      })

      router.push("/user/businesses")
    } catch (error: any) {
      console.error("Sign up error:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to create account.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 to-blue-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full">
        <Card className="border-2 border-teal-200 shadow-lg">
          <CardHeader className="bg-teal-100">
            <div className="flex items-center gap-2">
              <Link href="/">
                <Button variant="ghost" size="icon" className="rounded-full">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <CardTitle className="text-teal-800">PunchCard</CardTitle>
            </div>
            <CardDescription>Sign in or create an account to track your rewards</CardDescription>
          </CardHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="signin">
              <form onSubmit={handleSignIn}>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signin-email">Email</Label>
                      <Input
                        id="signin-email"
                        type="email"
                        placeholder="Enter your email"
                        value={signInData.email}
                        onChange={(e) => setSignInData({ ...signInData, email: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signin-password">Password</Label>
                      <Input
                        id="signin-password"
                        type="password"
                        placeholder="Enter your password"
                        value={signInData.password}
                        onChange={(e) => setSignInData({ ...signInData, password: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end pt-6 pb-6 px-6">
                  <Button type="submit" className="bg-teal-600 hover:bg-teal-700" disabled={isLoading}>
                    {isLoading ? "Signing in..." : "Sign In"}
                    <LogIn className="ml-2 h-4 w-4" />
                  </Button>
                </CardFooter>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignUp}>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-name">Full Name</Label>
                      <Input
                        id="signup-name"
                        placeholder="Enter your name"
                        value={signUpData.name}
                        onChange={(e) => setSignUpData({ ...signUpData, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-email">Email</Label>
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="Enter your email"
                        value={signUpData.email}
                        onChange={(e) => setSignUpData({ ...signUpData, email: e.target.value })}
                        required
                      />
                      <p className="text-xs text-gray-500">Used for reward notifications and account recovery</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-password">Password</Label>
                      <Input
                        id="signup-password"
                        type="password"
                        placeholder="Create a password"
                        value={signUpData.password}
                        onChange={(e) => setSignUpData({ ...signUpData, password: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-address">Address</Label>
                      <Input
                        id="signup-address"
                        placeholder="123 Main St, City, State"
                        value={signUpData.address}
                        onChange={(e) => setSignUpData({ ...signUpData, address: e.target.value })}
                      />
                      <p className="text-xs text-gray-500">
                        We'll recommend nearby businesses and calculate distances for you
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-phone">Phone Number</Label>
                      <Input
                        id="signup-phone"
                        placeholder="(555) 123-4567"
                        value={signUpData.phone}
                        onChange={(e) => setSignUpData({ ...signUpData, phone: e.target.value })}
                      />
                      <p className="text-xs text-gray-500">For SMS notifications when rewards are ready</p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end pt-6 pb-6 px-6">
                  <Button type="submit" className="bg-teal-600 hover:bg-teal-700" disabled={isLoading}>
                    {isLoading ? "Creating Account..." : "Create Account"}
                    <UserPlus className="ml-2 h-4 w-4" />
                  </Button>
                </CardFooter>
              </form>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  )
}
