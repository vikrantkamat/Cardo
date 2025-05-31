"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { ArrowLeft, Shield, Eye, Lock, Users, Gift } from "lucide-react"

export default function PrivacyPolicy() {
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
              <h1 className="text-xl font-bold text-gray-900">Privacy Policy</h1>
            </div>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="h-8 w-8 text-blue-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
            <p className="text-xl text-gray-600">
              Your privacy is important to us. Learn how we protect and use your information.
            </p>
            <p className="text-sm text-gray-500 mt-2">Last updated: December 2024</p>
          </div>

          {/* Quick Overview */}
          <Card className="border-0 shadow-lg mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Quick Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <Lock className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <h3 className="font-semibold">Data Protection</h3>
                  <p className="text-sm text-gray-600">We use industry-standard encryption to protect your data</p>
                </div>
                <div className="text-center">
                  <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <h3 className="font-semibold">No Selling</h3>
                  <p className="text-sm text-gray-600">We never sell your personal information to third parties</p>
                </div>
                <div className="text-center">
                  <Shield className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <h3 className="font-semibold">Your Control</h3>
                  <p className="text-sm text-gray-600">You can access, update, or delete your data anytime</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Privacy Policy Content */}
          <div className="space-y-8">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>1. Information We Collect</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Personal Information</h4>
                  <ul className="list-disc list-inside text-gray-600 space-y-1">
                    <li>Name and email address when you create an account</li>
                    <li>Business information for business accounts</li>
                    <li>Location data (with your permission) to find nearby businesses</li>
                    <li>Communication preferences and settings</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Usage Information</h4>
                  <ul className="list-disc list-inside text-gray-600 space-y-1">
                    <li>Punch card activity and reward redemptions</li>
                    <li>App usage patterns and preferences</li>
                    <li>Device information and IP address</li>
                    <li>QR code scan history</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>2. How We Use Your Information</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside text-gray-600 space-y-2">
                  <li>Provide and improve our loyalty program services</li>
                  <li>Process punch card transactions and reward redemptions</li>
                  <li>Send you important updates about your account and rewards</li>
                  <li>Recommend nearby businesses based on your location</li>
                  <li>Analyze usage patterns to improve our platform</li>
                  <li>Prevent fraud and ensure platform security</li>
                  <li>Comply with legal obligations</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>3. Information Sharing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">With Businesses</h4>
                  <p className="text-gray-600">
                    We share your punch card activity with businesses you visit to enable reward tracking. Businesses
                    can see your name, email, and punch history for their specific location only.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Service Providers</h4>
                  <p className="text-gray-600">
                    We work with trusted third-party services for hosting, analytics, and customer support. These
                    providers are bound by strict confidentiality agreements.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Legal Requirements</h4>
                  <p className="text-gray-600">
                    We may disclose information when required by law or to protect our rights and the safety of our
                    users.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>4. Data Security</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside text-gray-600 space-y-2">
                  <li>All data is encrypted in transit and at rest using industry-standard protocols</li>
                  <li>Regular security audits and vulnerability assessments</li>
                  <li>Access controls and authentication for all team members</li>
                  <li>Secure data centers with 24/7 monitoring</li>
                  <li>Regular backups and disaster recovery procedures</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>5. Your Rights and Choices</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside text-gray-600 space-y-2">
                  <li>
                    <strong>Access:</strong> Request a copy of your personal data
                  </li>
                  <li>
                    <strong>Update:</strong> Correct or update your information anytime
                  </li>
                  <li>
                    <strong>Delete:</strong> Request deletion of your account and data
                  </li>
                  <li>
                    <strong>Opt-out:</strong> Unsubscribe from marketing communications
                  </li>
                  <li>
                    <strong>Data Portability:</strong> Export your data in a standard format
                  </li>
                  <li>
                    <strong>Location:</strong> Control location sharing in your device settings
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>6. Cookies and Tracking</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  We use cookies and similar technologies to improve your experience:
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-2">
                  <li>
                    <strong>Essential Cookies:</strong> Required for basic functionality
                  </li>
                  <li>
                    <strong>Analytics Cookies:</strong> Help us understand how you use our platform
                  </li>
                  <li>
                    <strong>Preference Cookies:</strong> Remember your settings and preferences
                  </li>
                </ul>
                <p className="text-gray-600 mt-4">
                  You can control cookies through your browser settings, but some features may not work properly if
                  disabled.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>7. Children's Privacy</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Our service is not intended for children under 13. We do not knowingly collect personal information
                  from children under 13. If you believe we have collected information from a child under 13, please
                  contact us immediately.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>8. Changes to This Policy</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  We may update this privacy policy from time to time. We will notify you of any material changes by
                  email or through our platform. Your continued use of our service after changes become effective
                  constitutes acceptance of the updated policy.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>9. Contact Us</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  If you have questions about this privacy policy or our data practices, please contact us:
                </p>
                <div className="space-y-2 text-gray-600">
                  <p>
                    <strong>Email:</strong> privacy@cardo.com
                  </p>
                  <p>
                    <strong>Phone:</strong> 1-800-CARDO-1
                  </p>
                  <p>
                    <strong>Address:</strong> 123 Innovation Drive, Tech City, TC 12345
                  </p>
                </div>
                <div className="mt-6 flex gap-4">
                  <Link href="/contact">
                    <Button>Contact Us</Button>
                  </Link>
                  <Link href="/help">
                    <Button variant="outline">Help Center</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
