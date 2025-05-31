"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Building2, Users, LogIn, UserPlus, ArrowRight, CreditCard, Shield } from "lucide-react"

export default function WelcomePage() {
  const [isBusinessLoggedIn, setIsBusinessLoggedIn] = useState(false)
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false)
  const [businessName, setBusinessName] = useState("")
  const [userName, setUserName] = useState("")

  useEffect(() => {
    // Check if business is logged in
    const businessId = localStorage.getItem("businessId")
    const storedBusinessName = localStorage.getItem("businessName")
    if (businessId && storedBusinessName) {
      setIsBusinessLoggedIn(true)
      setBusinessName(storedBusinessName)
    }

    // Check if user is logged in
    const userId = localStorage.getItem("userId")
    const storedUserName = localStorage.getItem("userName")
    if (userId && storedUserName) {
      setIsUserLoggedIn(true)
      setUserName(storedUserName)
    }
  }, [])

  const handleBusinessLogout = () => {
    localStorage.removeItem("businessId")
    localStorage.removeItem("businessName")
    localStorage.removeItem("businessEmail")
    setIsBusinessLoggedIn(false)
    setBusinessName("")
  }

  const handleUserLogout = () => {
    localStorage.removeItem("userId")
    localStorage.removeItem("userName")
    localStorage.removeItem("userEmail")
    setIsUserLoggedIn(false)
    setUserName("")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Enhanced Grid gradient background */}
      <div className="absolute inset-0 opacity-40">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-400/20 via-blue-400/15 to-indigo-400/20"></div>
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(rgba(71, 85, 105, 0.08) 1px, transparent 1px),
              linear-gradient(90deg, rgba(71, 85, 105, 0.08) 1px, transparent 1px),
              linear-gradient(rgba(59, 130, 246, 0.06) 1px, transparent 1px),
              linear-gradient(90deg, rgba(59, 130, 246, 0.06) 1px, transparent 1px),
              linear-gradient(rgba(99, 102, 241, 0.04) 1px, transparent 1px),
              linear-gradient(90deg, rgba(99, 102, 241, 0.04) 1px, transparent 1px)
            `,
            backgroundSize: "80px 80px, 80px 80px, 40px 40px, 40px 40px, 20px 20px, 20px 20px",
            backgroundPosition: "0 0, 0 0, 0 0, 0 0, 0 0, 0 0",
          }}
        ></div>
        {/* Additional diagonal grid overlay */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(45deg, rgba(71, 85, 105, 0.03) 1px, transparent 1px),
              linear-gradient(-45deg, rgba(59, 130, 246, 0.03) 1px, transparent 1px)
            `,
            backgroundSize: "60px 60px, 60px 60px",
          }}
        ></div>
      </div>

      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-indigo-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-slate-400/20 to-blue-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-indigo-400/10 to-blue-400/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="max-w-md w-full space-y-8 relative z-10">
        {/* Logo and Header */}
        <div className="text-center animate-fade-in">
          <div className="flex items-center justify-center mb-4">
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-slate-600 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg transform rotate-3 hover:rotate-6 transition-transform duration-300">
                <CreditCard className="h-8 w-8 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full animate-bounce delay-500"></div>
            </div>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-slate-700 via-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2 tracking-tight">
            Cardo
          </h1>
          <p className="text-slate-600 mb-8 text-lg font-medium">Smart loyalty rewards, simplified</p>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {/* Business Card */}
          <Card className="overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-[1.02] border-0 shadow-lg bg-white/80 backdrop-blur-sm group">
            <CardHeader className="bg-gradient-to-r from-slate-600 to-blue-600 text-white pb-4 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-slate-600/90 to-blue-600/90"></div>
              <div className="relative z-10">
                <CardTitle className="flex items-center gap-3 text-white">
                  <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                    <Building2 className="h-5 w-5" />
                  </div>
                  For Businesses
                </CardTitle>
                <CardDescription className="text-blue-100">
                  Create and manage loyalty programs effortlessly
                </CardDescription>
              </div>
              <div className="absolute -right-8 -top-8 w-24 h-24 bg-white/10 rounded-full group-hover:scale-110 transition-transform duration-500"></div>
            </CardHeader>
            <CardContent className="pt-6">
              {isBusinessLoggedIn ? (
                <div className="space-y-4">
                  <div className="p-4 bg-gradient-to-r from-slate-50 to-blue-50 rounded-lg border border-slate-200">
                    <p className="text-sm text-slate-600 mb-1">Welcome back</p>
                    <p className="font-semibold text-slate-800">{businessName}</p>
                  </div>
                  <div className="flex gap-3">
                    <Link href="/business/dashboard" className="flex-1">
                      <Button className="w-full bg-gradient-to-r from-slate-600 to-blue-600 hover:from-slate-700 hover:to-blue-700 text-white shadow-md hover:shadow-lg transition-all duration-200 group">
                        Dashboard
                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      onClick={handleBusinessLogout}
                      className="px-4 border-slate-300 hover:bg-slate-50"
                    >
                      Logout
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-slate-600 mb-4 leading-relaxed">
                    Set up your business, create loyalty programs, and scan customer QR codes to build lasting
                    relationships.
                  </p>
                  <div className="flex gap-3">
                    <Link href="/business/register" className="flex-1">
                      <Button className="w-full bg-gradient-to-r from-slate-600 to-blue-600 hover:from-slate-700 hover:to-blue-700 text-white shadow-md hover:shadow-lg transition-all duration-200">
                        <UserPlus className="h-4 w-4 mr-2" />
                        Get Started
                      </Button>
                    </Link>
                    <Link href="/business/signin" className="flex-1">
                      <Button variant="outline" className="w-full border-slate-300 hover:bg-slate-50">
                        <LogIn className="h-4 w-4 mr-2" />
                        Sign In
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* User Card */}
          <Card className="overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-[1.02] border-0 shadow-lg bg-white/80 backdrop-blur-sm group">
            <CardHeader className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white pb-4 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/90 to-blue-600/90"></div>
              <div className="relative z-10">
                <CardTitle className="flex items-center gap-3 text-white">
                  <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                    <Users className="h-5 w-5" />
                  </div>
                  For Customers
                </CardTitle>
                <CardDescription className="text-blue-100">
                  Collect rewards at your favorite local businesses
                </CardDescription>
              </div>
              <div className="absolute -right-8 -top-8 w-24 h-24 bg-white/10 rounded-full group-hover:scale-110 transition-transform duration-500"></div>
            </CardHeader>
            <CardContent className="pt-6">
              {isUserLoggedIn ? (
                <div className="space-y-4">
                  <div className="p-4 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg border border-indigo-200">
                    <p className="text-sm text-indigo-600 mb-1">Welcome back</p>
                    <p className="font-semibold text-indigo-800">{userName}</p>
                  </div>
                  <div className="flex gap-3">
                    <Link href="/user/businesses" className="flex-1">
                      <Button className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white shadow-md hover:shadow-lg transition-all duration-200 group">
                        Explore
                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                    <Link href="/user/punchcards" className="flex-1">
                      <Button variant="outline" className="w-full border-indigo-300 hover:bg-indigo-50">
                        My Cards
                      </Button>
                    </Link>
                  </div>
                  <Button
                    variant="ghost"
                    onClick={handleUserLogout}
                    className="w-full text-sm text-slate-500 hover:text-slate-700"
                  >
                    Logout
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-slate-600 mb-4 leading-relaxed">
                    Discover participating businesses, collect punches, and redeem exclusive rewards near you.
                  </p>
                  <div className="flex gap-3">
                    <Link href="/user/auth" className="flex-1">
                      <Button className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white shadow-md hover:shadow-lg transition-all duration-200">
                        <UserPlus className="h-4 w-4 mr-2" />
                        Join Now
                      </Button>
                    </Link>
                    <Link href="/user/auth" className="flex-1">
                      <Button variant="outline" className="w-full border-indigo-300 hover:bg-indigo-50">
                        <LogIn className="h-4 w-4 mr-2" />
                        Sign In
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Footer with Developer Access */}
        <div className="flex flex-col items-center pt-8 space-y-4">
          <div className="flex items-center gap-2 text-slate-400">
            <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse delay-200"></div>
            <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse delay-400"></div>
          </div>

          {/* Quick Links */}
          <div className="flex flex-wrap justify-center gap-4 text-xs">
            <Link href="/help" className="text-slate-400 hover:text-slate-600 transition-colors">
              Help Center
            </Link>
            <Link href="/contact" className="text-slate-400 hover:text-slate-600 transition-colors">
              Contact Us
            </Link>
            <Link href="/privacy" className="text-slate-400 hover:text-slate-600 transition-colors">
              Privacy Policy
            </Link>
          </div>

          {/* Developer Access Link */}
          <Link href="/developer/login">
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-slate-400 hover:text-red-600 transition-colors duration-300"
            >
              <Shield className="h-3 w-3 mr-1" />
              Developer Access
            </Button>
          </Link>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
      `}</style>
    </div>
  )
}
