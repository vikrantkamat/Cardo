"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Shield, Eye, EyeOff } from "lucide-react"
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

    try {
      if (password === "Slag6Added") {
        // Store developer session
        localStorage.setItem("developerAuth", "authenticated")
        localStorage.setItem("developerLoginTime", Date.now().toString())

        toast({
          title: "Developer Access Granted",
          description: "Welcome to the Cardo Developer Dashboard",
        })

        router.push("/developer/dashboard")
      } else {
        throw new Error("Invalid developer password")
      }
    } catch (error: any) {
      toast({
        title: "Access Denied",
        description: "Invalid developer credentials",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-900 via-gray-900 to-black flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-red-600/20 to-orange-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-gray-600/20 to-red-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Grid pattern overlay */}
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

      <div className="max-w-md w-full relative z-10">
        <Card className="border-red-800 shadow-2xl bg-gray-900/90 backdrop-blur-sm">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-red-600 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Shield className="h-8 w-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-red-400">Developer Access</CardTitle>
            <CardDescription className="text-gray-400">Restricted area - Authorized personnel only</CardDescription>
          </CardHeader>

          <form onSubmit={handleLogin}>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-300">
                  Developer Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter developer password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-red-500 pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white shadow-lg"
                disabled={isLoading}
              >
                {isLoading ? "Authenticating..." : "Access Dashboard"}
              </Button>

              <div className="text-center">
                <p className="text-xs text-gray-500">This area is monitored and logged for security purposes</p>
              </div>
            </CardContent>
          </form>
        </Card>

        {/* Warning notice */}
        <div className="mt-6 p-4 bg-red-900/30 border border-red-800 rounded-lg backdrop-blur-sm">
          <div className="flex items-center gap-2 text-red-400 text-sm">
            <Shield className="h-4 w-4" />
            <span className="font-medium">Security Notice</span>
          </div>
          <p className="text-red-300 text-xs mt-1">
            Unauthorized access attempts are logged and may result in legal action
          </p>
        </div>
      </div>
    </div>
  )
}
