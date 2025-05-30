"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertTriangle, Trash2, Shield } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

interface AccountDeletionProps {
  userId: string
  userEmail: string
}

export function AccountDeletion({ userId, userEmail }: AccountDeletionProps) {
  const { toast } = useToast()
  const router = useRouter()
  const [confirmEmail, setConfirmEmail] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDeleteAccount = async () => {
    if (confirmEmail !== userEmail) {
      toast({
        title: "Email Mismatch",
        description: "Please enter your correct email address to confirm deletion.",
        variant: "destructive",
      })
      return
    }

    setIsDeleting(true)

    try {
      // Delete user's punchcards first (cascade will handle related data)
      const { error: punchcardsError } = await supabase.from("punchcards").delete().eq("user_id", userId)

      if (punchcardsError) throw punchcardsError

      // Delete user's recommendations
      const { error: recommendationsError } = await supabase.from("user_recommendations").delete().eq("user_id", userId)

      if (recommendationsError) throw recommendationsError

      // Delete punch history
      const { error: historyError } = await supabase.from("punch_history").delete().eq("user_id", userId)

      if (historyError) throw historyError

      // Delete redemption history
      const { error: redemptionError } = await supabase.from("redemption_history").delete().eq("user_id", userId)

      if (redemptionError) throw redemptionError

      // Finally delete the user
      const { error: userError } = await supabase.from("users").delete().eq("id", userId)

      if (userError) throw userError

      // Clear localStorage
      localStorage.removeItem("userId")
      localStorage.removeItem("userEmail")
      localStorage.removeItem("userName")

      toast({
        title: "Account Deleted",
        description: "Your account has been permanently deleted.",
      })

      // Redirect to home page
      router.push("/")
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete account.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Card className="border-red-200 bg-red-50/50">
      <CardHeader>
        <CardTitle className="text-red-700 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          Delete Account
        </CardTitle>
        <CardDescription className="text-red-600">
          Permanently delete your account and all associated data
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-red-100 border border-red-200 rounded-lg p-4">
          <h4 className="font-medium text-red-800 mb-2 flex items-center gap-2">
            <Shield className="h-4 w-4" />
            What will be deleted:
          </h4>
          <ul className="text-sm text-red-700 space-y-1">
            <li>• Your profile information and account details</li>
            <li>• All your punchcards and punch history</li>
            <li>• Your favorite businesses and preferences</li>
            <li>• All redemption history and rewards</li>
            <li>• Any recommendations and analytics data</li>
          </ul>
        </div>

        <div className="bg-yellow-100 border border-yellow-200 rounded-lg p-4">
          <h4 className="font-medium text-yellow-800 mb-2">⚠️ This action cannot be undone</h4>
          <p className="text-sm text-yellow-700">
            Once you delete your account, all your data will be permanently removed from our servers. You will lose all
            your punch progress and rewards.
          </p>
        </div>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" className="w-full">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete My Account
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete your account and remove all your data from
                our servers.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="confirmEmail">
                  Type your email address <strong>{userEmail}</strong> to confirm:
                </Label>
                <Input
                  id="confirmEmail"
                  type="email"
                  placeholder="Enter your email address"
                  value={confirmEmail}
                  onChange={(e) => setConfirmEmail(e.target.value)}
                />
              </div>
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setConfirmEmail("")}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteAccount}
                disabled={confirmEmail !== userEmail || isDeleting}
                className="bg-red-600 hover:bg-red-700"
              >
                {isDeleting ? "Deleting..." : "Yes, delete my account"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  )
}
