"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { PlusCircle, UserRound } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"

interface Customer {
  id: string
  punches: number
  last_punch_at: string
  users: {
    id: string
    name: string
    email: string
  }
}

interface CustomerListProps {
  customers: Customer[]
  business: any
}

export function CustomerList({ customers, business }: CustomerListProps) {
  const { toast } = useToast()
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)

  const addPunch = async (customerId: string, punchcardId: string) => {
    setIsUpdating(true)
    try {
      // Get current punchcard
      const { data: currentPunchcard, error: fetchError } = await supabase
        .from("punchcards")
        .select("punches")
        .eq("id", punchcardId)
        .single()

      if (fetchError) throw fetchError

      const newPunches = currentPunchcard.punches + 1

      // Update punchcard
      const { error: updateError } = await supabase
        .from("punchcards")
        .update({
          punches: newPunches,
          last_punch_at: new Date().toISOString(),
        })
        .eq("id", punchcardId)

      if (updateError) throw updateError

      // Add to punch history
      await supabase.from("punch_history").insert({
        punchcard_id: punchcardId,
        business_id: business.id,
        user_id: customerId,
      })

      toast({
        title: "Punch Added!",
        description: `Customer now has ${newPunches} punches.`,
      })

      // Refresh the page to show updated data
      window.location.reload()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add punch.",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Punches</TableHead>
              <TableHead>Last Visit</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.length > 0 ? (
              customers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{customer.users?.name || "Anonymous"}</div>
                      <div className="text-sm text-gray-500">{customer.users?.email || "No email"}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={`${
                        customer.punches >= business.punches_required
                          ? "bg-green-50 text-green-700"
                          : "bg-violet-50 text-violet-700"
                      } hover:bg-violet-50`}
                    >
                      {customer.punches} / {business.punches_required} punches
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {customer.last_punch_at ? new Date(customer.last_punch_at).toLocaleDateString() : "Never"}
                  </TableCell>
                  <TableCell className="text-right">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="sm" onClick={() => setSelectedCustomer(customer)}>
                          View
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Customer Details</DialogTitle>
                        </DialogHeader>
                        {selectedCustomer && (
                          <div className="space-y-4">
                            <div className="flex flex-col items-center justify-center">
                              <div className="h-20 w-20 rounded-full bg-violet-100 flex items-center justify-center mb-2">
                                <UserRound className="h-10 w-10 text-violet-600" />
                              </div>
                              <h3 className="text-lg font-medium">{selectedCustomer.users?.name || "Anonymous"}</h3>
                              <p className="text-gray-500">{selectedCustomer.users?.email || "No email"}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4 pt-4">
                              <div className="bg-gray-50 p-4 rounded-md text-center">
                                <p className="text-sm text-gray-500">Punches</p>
                                <p className="text-2xl font-bold text-violet-700">
                                  {selectedCustomer.punches} / {business.punches_required}
                                </p>
                              </div>
                              <div className="bg-gray-50 p-4 rounded-md text-center">
                                <p className="text-sm text-gray-500">Last Visit</p>
                                <p className="text-lg font-medium">
                                  {selectedCustomer.last_punch_at
                                    ? new Date(selectedCustomer.last_punch_at).toLocaleDateString()
                                    : "Never"}
                                </p>
                              </div>
                            </div>

                            {selectedCustomer.punches >= business.punches_required && (
                              <div className="bg-green-50 border border-green-200 p-4 rounded-md text-center">
                                <p className="text-green-800 font-medium">🎉 Reward Ready!</p>
                                <p className="text-sm text-green-600">Customer can redeem: {business.reward}</p>
                              </div>
                            )}

                            <div className="pt-4 flex justify-center">
                              <Button
                                className="bg-violet-600 hover:bg-violet-700"
                                onClick={() => addPunch(selectedCustomer.users.id, selectedCustomer.id)}
                                disabled={isUpdating}
                              >
                                <PlusCircle className="h-4 w-4 mr-2" />
                                {isUpdating ? "Adding..." : "Add Punch"}
                              </Button>
                            </div>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-6 text-gray-500">
                  No customers found. Start scanning QR codes to see customers here.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
