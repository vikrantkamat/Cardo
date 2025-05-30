"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Edit, Plus, Trash2 } from "lucide-react"

interface LoyaltyRule {
  id: number
  name: string
  punchesRequired: number
  reward: string
}

interface LoyaltyRulesProps {
  rules: LoyaltyRule[]
  setRules: (rules: LoyaltyRule[]) => void
}

export function LoyaltyRules({ rules, setRules }: LoyaltyRulesProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [currentRule, setCurrentRule] = useState<LoyaltyRule | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    punchesRequired: 10,
    reward: "",
  })

  const handleAddRule = () => {
    const newRule = {
      id: Date.now(),
      name: formData.name,
      punchesRequired: formData.punchesRequired,
      reward: formData.reward,
    }
    setRules([...rules, newRule])
    resetForm()
    setIsAddDialogOpen(false)
  }

  const handleEditRule = () => {
    if (!currentRule) return

    const updatedRules = rules.map((rule) =>
      rule.id === currentRule.id
        ? {
            ...rule,
            name: formData.name,
            punchesRequired: formData.punchesRequired,
            reward: formData.reward,
          }
        : rule,
    )

    setRules(updatedRules)
    resetForm()
    setIsEditDialogOpen(false)
  }

  const handleDeleteRule = (id: number) => {
    const updatedRules = rules.filter((rule) => rule.id !== id)
    setRules(updatedRules)
  }

  const openEditDialog = (rule: LoyaltyRule) => {
    setCurrentRule(rule)
    setFormData({
      name: rule.name,
      punchesRequired: rule.punchesRequired,
      reward: rule.reward,
    })
    setIsEditDialogOpen(true)
  }

  const resetForm = () => {
    setFormData({
      name: "",
      punchesRequired: 10,
      reward: "",
    })
    setCurrentRule(null)
  }

  const openAddDialog = () => {
    resetForm()
    setIsAddDialogOpen(true)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-violet-600 hover:bg-violet-700" onClick={openAddDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Add Rule
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Loyalty Rule</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="ruleName">Rule Name</Label>
                <Input
                  id="ruleName"
                  placeholder="e.g., Standard Loyalty"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="punchesRequired">Punches Required</Label>
                <Input
                  id="punchesRequired"
                  type="number"
                  min="1"
                  value={formData.punchesRequired}
                  onChange={(e) => setFormData({ ...formData, punchesRequired: Number.parseInt(e.target.value) || 10 })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reward">Reward</Label>
                <Input
                  id="reward"
                  placeholder="e.g., Free Coffee"
                  value={formData.reward}
                  onChange={(e) => setFormData({ ...formData, reward: e.target.value })}
                />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleAddRule}
                  disabled={!formData.name || !formData.reward}
                  className="bg-violet-600 hover:bg-violet-700"
                >
                  Add Rule
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {rules.length > 0 ? (
          rules.map((rule) => (
            <Card key={rule.id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div>
                  <CardTitle className="text-base">{rule.name}</CardTitle>
                  <CardDescription>
                    Collect {rule.punchesRequired} punches to earn: {rule.reward}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="icon" onClick={() => openEditDialog(rule)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Edit Loyalty Rule</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="editRuleName">Rule Name</Label>
                          <Input
                            id="editRuleName"
                            placeholder="e.g., Standard Loyalty"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="editPunchesRequired">Punches Required</Label>
                          <Input
                            id="editPunchesRequired"
                            type="number"
                            min="1"
                            value={formData.punchesRequired}
                            onChange={(e) =>
                              setFormData({ ...formData, punchesRequired: Number.parseInt(e.target.value) || 10 })
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="editReward">Reward</Label>
                          <Input
                            id="editReward"
                            placeholder="e.g., Free Coffee"
                            value={formData.reward}
                            onChange={(e) => setFormData({ ...formData, reward: e.target.value })}
                          />
                        </div>
                        <div className="flex justify-end gap-2 pt-4">
                          <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                            Cancel
                          </Button>
                          <Button
                            onClick={handleEditRule}
                            disabled={!formData.name || !formData.reward}
                            className="bg-violet-600 hover:bg-violet-700"
                          >
                            Save Changes
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                  <Button variant="ghost" size="icon" onClick={() => handleDeleteRule(rule.id)}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-violet-50 text-violet-700">
                    {rule.punchesRequired} punches
                  </Badge>
                  <span className="text-sm text-gray-500">→</span>
                  <Badge variant="outline" className="bg-green-50 text-green-700">
                    {rule.reward}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="text-center py-6">
              <p className="text-gray-500">No loyalty rules configured yet.</p>
              <p className="text-sm text-gray-400 mt-1">Add your first rule to get started!</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
