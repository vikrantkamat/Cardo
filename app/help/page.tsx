"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { ArrowLeft, Search, MessageCircle, Phone, Mail, Users, Building2, Gift } from "lucide-react"

export default function HelpCenter() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <ArrowLeft className="h-5 w-5 text-gray-600" />
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Gift className="h-4 w-4 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">Cardo Help Center</h1>
            </div>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">How can we help you?</h1>
          <p className="text-xl text-gray-600 mb-8">Find answers to common questions and get support</p>

          {/* Search Bar */}
          <div className="max-w-md mx-auto relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input placeholder="Search for help..." className="pl-10 py-3 text-lg" />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
            <CardHeader className="text-center">
              <MessageCircle className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <CardTitle>Live Chat</CardTitle>
              <CardDescription>Get instant help from our support team</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">Start Chat</Button>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
            <CardHeader className="text-center">
              <Mail className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <CardTitle>Email Support</CardTitle>
              <CardDescription>Send us a detailed message</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">
                Send Email
              </Button>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
            <CardHeader className="text-center">
              <Phone className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <CardTitle>Phone Support</CardTitle>
              <CardDescription>Call us during business hours</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">
                Call Now
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* FAQ Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* For Customers */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Users className="h-8 w-8 text-blue-600" />
                <CardTitle className="text-2xl">For Customers</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-900">Getting Started</h3>
                <ul className="space-y-2 text-gray-600">
                  <li>• How do I create an account?</li>
                  <li>• How do I find participating businesses?</li>
                  <li>• How do I scan QR codes?</li>
                  <li>• How do punch cards work?</li>
                </ul>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold text-gray-900">Rewards & Redemption</h3>
                <ul className="space-y-2 text-gray-600">
                  <li>• How do I redeem rewards?</li>
                  <li>• When do my punches expire?</li>
                  <li>• Can I transfer punches to another account?</li>
                  <li>• What if I lose my phone?</li>
                </ul>
              </div>

              <Link href="/user/auth">
                <Button className="w-full mt-4">Get Started as Customer</Button>
              </Link>
            </CardContent>
          </Card>

          {/* For Businesses */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Building2 className="h-8 w-8 text-purple-600" />
                <CardTitle className="text-2xl">For Businesses</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-900">Setup & Management</h3>
                <ul className="space-y-2 text-gray-600">
                  <li>• How do I register my business?</li>
                  <li>• How do I create loyalty programs?</li>
                  <li>• How do I generate QR codes?</li>
                  <li>• How do I track customer activity?</li>
                </ul>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold text-gray-900">Analytics & Growth</h3>
                <ul className="space-y-2 text-gray-600">
                  <li>• How do I view customer analytics?</li>
                  <li>• How do I create custom rewards?</li>
                  <li>• How do I manage my customer list?</li>
                  <li>• How do I export customer data?</li>
                </ul>
              </div>

              <Link href="/business/register">
                <Button className="w-full mt-4">Register Your Business</Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Contact Information */}
        <Card className="border-0 shadow-lg mt-12">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Still Need Help?</CardTitle>
            <CardDescription>Our support team is here to assist you</CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <Mail className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <h3 className="font-semibold">Email</h3>
                <p className="text-gray-600">support@cardo.com</p>
              </div>
              <div>
                <Phone className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <h3 className="font-semibold">Phone</h3>
                <p className="text-gray-600">1-800-CARDO-1</p>
              </div>
              <div>
                <MessageCircle className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <h3 className="font-semibold">Live Chat</h3>
                <p className="text-gray-600">Available 24/7</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
