"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { QRCode } from "@/components/qr-code"
import { UserQRCode } from "@/components/user-qr-code"
import { QrScanner } from "@/components/qr-scanner"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function TestQRPage() {
  const [scannedData, setScannedData] = useState<string>("")
  const [testUserId] = useState("test-user-12345")
  const [testBusinessCode] = useState("business-67890-qr-code")

  const handleScan = (data: string) => {
    setScannedData(data)
    console.log("Scanned QR data:", data)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center gap-2">
          <Link href="/">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-xl font-bold text-violet-800">QR Code Test</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* QR Scanner */}
          <Card>
            <CardHeader>
              <CardTitle>QR Scanner</CardTitle>
              <CardDescription>Test the camera-based QR code scanner</CardDescription>
            </CardHeader>
            <CardContent>
              <QrScanner onScan={handleScan} />
              {scannedData && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
                  <p className="text-sm font-medium text-green-800">Scanned Data:</p>
                  <p className="text-sm text-green-700 break-all">{scannedData}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* User QR Code */}
          <Card>
            <CardHeader>
              <CardTitle>User QR Code</CardTitle>
              <CardDescription>QR code that users show to businesses</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <UserQRCode userId={testUserId} primaryColor="#0d9488" />
              <p className="text-xs text-gray-500 mt-2 text-center">This QR contains: user-{testUserId}</p>
            </CardContent>
          </Card>

          {/* Business QR Code */}
          <Card>
            <CardHeader>
              <CardTitle>Business QR Code</CardTitle>
              <CardDescription>QR code that businesses display</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <QRCode value={testBusinessCode} primaryColor="#6d28d9" />
              <p className="text-xs text-gray-500 mt-2 text-center">This QR contains: {testBusinessCode}</p>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Instructions</CardTitle>
            <CardDescription>How to test the QR code functionality</CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>Click "Start Scanner" to activate the camera</li>
              <li>Allow camera permissions when prompted</li>
              <li>Point your camera at one of the QR codes on this page</li>
              <li>The scanner will automatically detect and decode the QR code</li>
              <li>The scanned data will appear below the scanner</li>
              <li>Use the rotate button to switch between front/back cameras</li>
            </ol>

            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> The QR codes are now real and scannable! You can test by:
              </p>
              <ul className="list-disc list-inside mt-2 text-sm text-blue-700">
                <li>Scanning the User QR code should show: "user-{testUserId}"</li>
                <li>Scanning the Business QR code should show: "{testBusinessCode}"</li>
                <li>The scanner works with any standard QR code</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
