"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Shield, Eye, EyeOff, AlertTriangle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function DeveloperLogin() {
  const router = useRouter()
  const { toast } = useToast()
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Check password
    if (password === "Slag6Added") {
      // Store authentication in localStorage
      localStorage.setItem("developerAuth", "authenticated")
      localStorage.setItem("developerLoginTime", Date.now().toString())

      toast({
        title: "🔓 Access Granted",
        description: "Welcome to the Cardo Developer Dashboard",
        variant: "default",
      })

      // Redirect to dashboard
      router.push("/developer/dashboard")
    } else {
      toast({
        title: "🚫 Access Denied",
        description: "Invalid developer password",
        variant: "destructive",
      })
    }

    setIsLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-900 via-gray-900 to-black relative overflow-hidden flex items-center justify-center">
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

      {/* Warning banner */}
      <div className="absolute top-0 left-0 right-0 bg-red-600/90 backdrop-blur-sm border-b border-red-500 p-3 z-10">
        <div className="container mx-auto flex items-center justify-center gap-2 text-white">
          <AlertTriangle className="h-5 w-5" />
          <span className="font-medium">RESTRICTED ACCESS - AUTHORIZED PERSONNEL ONLY</span>
        </div>
      </div>

      <Card className="w-full max-w-md bg-gray-900/90 border-red-800 backdrop-blur-sm relative z-10 mt-16">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-gradient-to-br from-red-600 to-orange-600 rounded-lg flex items-center justify-center mb-4">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-red-400">Developer Access</CardTitle>
          <CardDescription className="text-gray-400">
            Enter developer credentials to access the Cardo management dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-300">
                Developer Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter developer password"
                  className="bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-red-500 pr-10"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 text-gray-400 hover:text-white"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading || !password}
              className="w-full bg-red-600 hover:bg-red-700 text-white"
            >
              {isLoading ? "Authenticating..." : "🔓 Access Dashboard"}
            </Button>
          </form>

          <div className="mt-6 p-3 bg-red-900/30 border border-red-800 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-red-400 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-red-200">
                <p className="font-medium mb-1">Security Notice:</p>
                <ul className="space-y-1">
                  <li>• All access attempts are logged</li>
                  <li>• Session expires after 24 hours</li>
                  <li>• Unauthorized access is prohibited</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-4 text-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/")}
              className="text-gray-400 hover:text-white"
            >
              ← Back to Main Site
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
