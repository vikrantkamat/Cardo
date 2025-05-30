"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, LogIn } from "lucide-react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"

export default function BusinessSignIn() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      console.log("Attempting business sign in...")

      if (!formData.email || !formData.password) {
        throw new Error("Please fill in all required fields")
      }

      // Check if business exists
      const { data: business, error: businessError } = await supabase
        .from("businesses")
        .select("*")
        .eq("email", formData.email)
        .single()

      if (businessError) {
        console.error("Business lookup error:", businessError)
        throw new Error("Business not found. Please check your email or register first.")
      }

      // Simple password check (in a real app, use proper password hashing)
      if (btoa(formData.password) !== business.password_hash) {
        throw new Error("Invalid password.")
      }

      // Store business info in localStorage
      localStorage.setItem("businessId", business.id)
      localStorage.setItem("businessEmail", business.email)
      localStorage.setItem("businessName", business.name)

      console.log("Business sign in successful")

      toast({
        title: "Success!",
        description: "You have been signed in.",
      })

      router.push("/business/dashboard")
    } catch (error: any) {
      console.error("Business sign in error:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to sign in.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-50 to-blue-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full">
        <Card className="border-2 border-violet-200 shadow-lg">
          <CardHeader className="bg-violet-100">
            <div className="flex items-center gap-2">
              <Link href="/">
                <Button variant="ghost" size="icon" className="rounded-full">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <CardTitle className="text-violet-800">Business Sign In</CardTitle>
            </div>
            <CardDescription>Sign in to your business account</CardDescription>
          </CardHeader>

          <form onSubmit={handleSignIn}>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your business email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between pt-6 pb-6 px-6">
              <Link href="/business/register">
                <Button variant="outline" type="button">
                  Need an account?
                </Button>
              </Link>
              <Button type="submit" className="bg-violet-600 hover:bg-violet-700" disabled={isLoading}>
                {isLoading ? "Signing in..." : "Sign In"}
                <LogIn className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}
