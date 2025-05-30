"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Copy, Mail, Users, CheckCircle } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"

interface EmailListProps {
  businessId: string
}

export function EmailList({ businessId }: EmailListProps) {
  const { toast } = useToast()
  const [customers, setCustomers] = useState<any[]>([])
  const [emailList, setEmailList] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    loadCustomers()
  }, [businessId])

  const loadCustomers = async () => {
    try {
      const { data, error } = await supabase
        .from("punchcards")
        .select(`
          *,
          users (
            id,
            name,
            email
          )
        `)
        .eq("business_id", businessId)
        .not("users.email", "is", null)

      if (error) throw error

      setCustomers(data || [])

      // Create email list
      const emails = data
        ?.map((customer) => customer.users?.email)
        .filter((email) => email)
        .filter((email, index, self) => self.indexOf(email) === index) // Remove duplicates
        .join(", ")

      setEmailList(emails || "")
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load customer emails.",
        variant: "destructive",
      })
    }
  }

  const copyEmailList = async () => {
    try {
      await navigator.clipboard.writeText(emailList)
      setCopied(true)
      toast({
        title: "Copied! ✨",
        description: "Email list copied to clipboard.",
      })

      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy email list.",
        variant: "destructive",
      })
    }
  }

  const uniqueEmails = customers
    .map((customer) => customer.users?.email)
    .filter((email) => email)
    .filter((email, index, self) => self.indexOf(email) === index)

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-slate-800">Customer Email List</h3>
          <p className="text-sm text-slate-600">Manage your customer mailing list</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-slate-600 to-blue-600 hover:from-slate-700 hover:to-blue-700">
              <Mail className="h-4 w-4 mr-2" />
              View Email List
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Customer Email List
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="bg-blue-50 text-blue-700">
                  <Users className="h-3 w-3 mr-1" />
                  {uniqueEmails.length} customers
                </Badge>
                <Button
                  onClick={copyEmailList}
                  variant="outline"
                  size="sm"
                  className={copied ? "bg-green-50 border-green-200" : ""}
                >
                  {copied ? (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy All
                    </>
                  )}
                </Button>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Email Addresses (comma-separated)</label>
                <Textarea
                  value={emailList}
                  readOnly
                  className="min-h-[200px] font-mono text-sm"
                  placeholder="No customer emails found..."
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-800 mb-2">How to use this email list:</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Copy the email list above</li>
                  <li>• Paste into your email client's BCC field</li>
                  <li>• Send newsletters, promotions, or updates</li>
                  <li>• Always respect customer privacy and unsubscribe requests</li>
                </ul>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-0 shadow-md bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Mail className="h-4 w-4 text-blue-600" />
            Email Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-800">{customers.length}</p>
              <p className="text-sm text-blue-600">Total Customers</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-800">{uniqueEmails.length}</p>
              <p className="text-sm text-green-600">Email Addresses</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <p className="text-2xl font-bold text-purple-800">
                {customers.length > 0 ? Math.round((uniqueEmails.length / customers.length) * 100) : 0}%
              </p>
              <p className="text-sm text-purple-600">Email Coverage</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {uniqueEmails.length > 0 && (
        <Card className="border-0 shadow-md bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-base">Recent Customer Emails</CardTitle>
            <CardDescription>Preview of your customer email list</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {uniqueEmails.slice(0, 10).map((email, index) => (
                <div key={index} className="flex items-center gap-2 p-2 bg-slate-50 rounded-md">
                  <Mail className="h-3 w-3 text-slate-400" />
                  <span className="text-sm text-slate-700">{email}</span>
                </div>
              ))}
              {uniqueEmails.length > 10 && (
                <p className="text-xs text-slate-500 text-center pt-2">And {uniqueEmails.length - 10} more emails...</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
