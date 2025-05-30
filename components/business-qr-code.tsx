"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { QRCode } from "@/components/qr-code"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"

interface BusinessQRCodeProps {
  businessId: string
  businessName: string
}

export function BusinessQRCode({ businessId, businessName }: BusinessQRCodeProps) {
  const { toast } = useToast()
  const [qrCode, setQrCode] = useState<string>("")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadBusinessQRCode()
  }, [businessId])

  const loadBusinessQRCode = async () => {
    try {
      const { data: qrData, error } = await supabase
        .from("business_qr_codes")
        .select("qr_code")
        .eq("business_id", businessId)
        .eq("is_active", true)
        .single()

      if (error) throw error

      setQrCode(qrData.qr_code)
    } catch (error: any) {
      console.error("QR code load error:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to load QR code.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <p>Loading QR code...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>{businessName}</CardTitle>
          <CardDescription>Business QR Code</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center">
          <QRCode value={qrCode} size={250} primaryColor="#6d28d9" />
          <p className="text-sm text-gray-500 mt-4 text-center">
            Display this QR code for customers to scan and collect punches
          </p>
          <p className="text-xs text-gray-400 mt-2">QR Code ID: {qrCode.slice(-8)}</p>
        </CardContent>
      </Card>
    </div>
  )
}
