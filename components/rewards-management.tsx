"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Edit, Plus, Trash2, Gift } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface Reward {
  id: string
  business_id: string
  name: string
  description: string
  punches_required: number
  image_type?: "emoji" | "text" | "upload"
  image_value?: string
  is_active: boolean
  created_at: string
}

interface RewardsManagementProps {
  businessId: string
}

export function RewardsManagement({ businessId }: RewardsManagementProps) {
  const { toast } = useToast()
  const [rewards, setRewards] = useState<Reward[]>([])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [currentReward, setCurrentReward] = useState<Reward | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    punches_required: 10,
    image_type: "emoji" as "emoji" | "text" | "upload",
    image_value: "🎁",
    image_file: null as File | null,
  })

  useEffect(() => {
    loadRewards()
  }, [businessId])

  const loadRewards = async () => {
    try {
      const { data, error } = await supabase
        .from("business_rewards")
        .select("*")
        .eq("business_id", businessId)
        .order("created_at", { ascending: false })

      if (error) throw error
      setRewards(data || [])
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load rewards.",
        variant: "destructive",
      })
    }
  }

  const handleImageUpload = (file: File) => {
    setFormData({ ...formData, image_file: file, image_type: "upload" })
  }

  const uploadImageToSupabase = async (file: File, businessId: string, rewardId: string) => {
    try {
      const fileExt = file.name.split(".").pop()
      const fileName = `${businessId}/${rewardId}.${fileExt}`

      const { data, error } = await supabase.storage.from("reward-images").upload(fileName, file, { upsert: true })

      if (error) throw error

      const {
        data: { publicUrl },
      } = supabase.storage.from("reward-images").getPublicUrl(fileName)

      return publicUrl
    } catch (error) {
      console.error("Image upload error:", error)
      return null
    }
  }

  const handleAddReward = async () => {
    setIsLoading(true)
    try {
      let imageUrl = null

      // Handle image based on type
      if (formData.image_type === "emoji" || formData.image_type === "text") {
        imageUrl = formData.image_value
      }

      const { data, error } = await supabase
        .from("business_rewards")
        .insert({
          business_id: businessId,
          name: formData.name,
          description: formData.description,
          punches_required: formData.punches_required,
          image_type: formData.image_type,
          image_value: imageUrl,
          is_active: true,
        })
        .select()
        .single()

      if (error) throw error

      // Upload image file if needed
      if (formData.image_type === "upload" && formData.image_file) {
        const uploadedUrl = await uploadImageToSupabase(formData.image_file, businessId, data.id)
        if (uploadedUrl) {
          const { error: updateError } = await supabase
            .from("business_rewards")
            .update({ image_value: uploadedUrl })
            .eq("id", data.id)

          if (!updateError) {
            data.image_value = uploadedUrl
          }
        }
      }

      setRewards([data, ...rewards])
      resetForm()
      setIsAddDialogOpen(false)

      toast({
        title: "Success! ✨",
        description: "Reward added successfully.",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add reward.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleEditReward = async () => {
    if (!currentReward) return

    setIsLoading(true)
    try {
      let imageUrl = currentReward.image_value

      // Handle image based on type
      if (formData.image_type === "emoji" || formData.image_type === "text") {
        imageUrl = formData.image_value
      } else if (formData.image_type === "upload" && formData.image_file) {
        const uploadedUrl = await uploadImageToSupabase(formData.image_file, businessId, currentReward.id)
        if (uploadedUrl) {
          imageUrl = uploadedUrl
        }
      }

      const { data, error } = await supabase
        .from("business_rewards")
        .update({
          name: formData.name,
          description: formData.description,
          punches_required: formData.punches_required,
          image_type: formData.image_type,
          image_value: imageUrl,
        })
        .eq("id", currentReward.id)
        .select()
        .single()

      if (error) throw error

      setRewards(rewards.map((reward) => (reward.id === currentReward.id ? data : reward)))
      resetForm()
      setIsEditDialogOpen(false)

      toast({
        title: "Success! ✨",
        description: "Reward updated successfully.",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update reward.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteReward = async (rewardId: string) => {
    try {
      const { error } = await supabase.from("business_rewards").delete().eq("id", rewardId)

      if (error) throw error

      setRewards(rewards.filter((reward) => reward.id !== rewardId))

      toast({
        title: "Success",
        description: "Reward deleted successfully.",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete reward.",
        variant: "destructive",
      })
    }
  }

  const toggleRewardStatus = async (rewardId: string, isActive: boolean) => {
    try {
      const { error } = await supabase.from("business_rewards").update({ is_active: !isActive }).eq("id", rewardId)

      if (error) throw error

      setRewards(rewards.map((reward) => (reward.id === rewardId ? { ...reward, is_active: !isActive } : reward)))

      toast({
        title: "Success",
        description: `Reward ${!isActive ? "activated" : "deactivated"}.`,
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update reward status.",
        variant: "destructive",
      })
    }
  }

  const openEditDialog = (reward: Reward) => {
    setCurrentReward(reward)
    setFormData({
      name: reward.name,
      description: reward.description,
      punches_required: reward.punches_required,
      image_type: reward.image_type || "emoji",
      image_value: reward.image_value || "🎁",
      image_file: null,
    })
    setIsEditDialogOpen(true)
  }

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      punches_required: 10,
      image_type: "emoji",
      image_value: "🎁",
      image_file: null,
    })
    setCurrentReward(null)
  }

  const openAddDialog = () => {
    resetForm()
    setIsAddDialogOpen(true)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-slate-800">Reward Management</h3>
          <p className="text-sm text-slate-600">Create and manage custom rewards for your customers</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button
              className="bg-gradient-to-r from-slate-600 to-blue-600 hover:from-slate-700 hover:to-blue-700"
              onClick={openAddDialog}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Reward
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Reward</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="rewardName">Reward Name</Label>
                <Input
                  id="rewardName"
                  placeholder="e.g., Free Coffee"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="rewardDescription">Description</Label>
                <Textarea
                  id="rewardDescription"
                  placeholder="Describe the reward in detail..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="punchesRequired">Punches Required</Label>
                <Input
                  id="punchesRequired"
                  type="number"
                  min="1"
                  max="50"
                  value={formData.punches_required}
                  onChange={(e) =>
                    setFormData({ ...formData, punches_required: Number.parseInt(e.target.value) || 10 })
                  }
                />
              </div>

              {/* Image Selection */}
              <div className="space-y-3">
                <Label>Reward Image</Label>
                <Tabs
                  value={formData.image_type}
                  onValueChange={(value) => setFormData({ ...formData, image_type: value as any })}
                >
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="emoji">Emoji</TabsTrigger>
                    <TabsTrigger value="text">Text</TabsTrigger>
                    <TabsTrigger value="upload">Upload</TabsTrigger>
                  </TabsList>

                  <TabsContent value="emoji" className="space-y-2">
                    <div className="grid grid-cols-6 gap-2">
                      {["🎁", "☕", "🥐", "🍰", "🥤", "🍕", "🍔", "🌮", "🍜", "🍦", "🧁", "🥗"].map((emoji) => (
                        <Button
                          key={emoji}
                          type="button"
                          variant={formData.image_value === emoji ? "default" : "outline"}
                          className="h-12 text-2xl"
                          onClick={() => setFormData({ ...formData, image_value: emoji })}
                        >
                          {emoji}
                        </Button>
                      ))}
                    </div>
                    <Input
                      placeholder="Or type custom emoji..."
                      value={formData.image_type === "emoji" ? formData.image_value : ""}
                      onChange={(e) => setFormData({ ...formData, image_value: e.target.value })}
                    />
                  </TabsContent>

                  <TabsContent value="text" className="space-y-2">
                    <Input
                      placeholder="Enter text (e.g., FREE, 50% OFF)"
                      value={formData.image_type === "text" ? formData.image_value : ""}
                      onChange={(e) => setFormData({ ...formData, image_value: e.target.value })}
                    />
                    <p className="text-xs text-slate-500">This text will be displayed as the reward icon</p>
                  </TabsContent>

                  <TabsContent value="upload" className="space-y-2">
                    <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 text-center">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) handleImageUpload(file)
                        }}
                        className="hidden"
                        id="image-upload"
                      />
                      <label htmlFor="image-upload" className="cursor-pointer">
                        <div className="space-y-2">
                          <div className="mx-auto w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
                            📷
                          </div>
                          <p className="text-sm font-medium">Click to upload image</p>
                          <p className="text-xs text-slate-500">PNG, JPG up to 2MB</p>
                        </div>
                      </label>
                      {formData.image_file && (
                        <p className="text-xs text-green-600 mt-2">✓ {formData.image_file.name}</p>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>

                {/* Preview */}
                <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg">
                  <span className="text-sm text-slate-600">Preview:</span>
                  <div className="w-8 h-8 bg-white rounded-md flex items-center justify-center border">
                    {formData.image_type === "upload" && formData.image_file ? (
                      <img
                        src={URL.createObjectURL(formData.image_file) || "/placeholder.svg"}
                        alt="Preview"
                        className="w-full h-full object-cover rounded-md"
                      />
                    ) : (
                      <span className={formData.image_type === "text" ? "text-xs font-bold" : "text-lg"}>
                        {formData.image_value || "🎁"}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleAddReward}
                  disabled={!formData.name || !formData.description || isLoading}
                  className="bg-gradient-to-r from-slate-600 to-blue-600 hover:from-slate-700 hover:to-blue-700"
                >
                  {isLoading ? "Adding..." : "Add Reward"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {rewards.length > 0 ? (
          rewards.map((reward) => (
            <Card key={reward.id} className="border-0 shadow-md bg-white/80 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="flex-1">
                  <CardTitle className="text-base flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-50 rounded-md flex items-center justify-center border">
                      {reward.image_type === "upload" && reward.image_value ? (
                        <img
                          src={reward.image_value || "/placeholder.svg"}
                          alt={reward.name}
                          className="w-full h-full object-cover rounded-md"
                        />
                      ) : (
                        <span className={reward.image_type === "text" ? "text-xs font-bold text-blue-600" : "text-lg"}>
                          {reward.image_value || "🎁"}
                        </span>
                      )}
                    </div>
                    {reward.name}
                    {!reward.is_active && <Badge variant="secondary">Inactive</Badge>}
                  </CardTitle>
                  <CardDescription className="mt-1">{reward.description}</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" onClick={() => openEditDialog(reward)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => toggleRewardStatus(reward.id, reward.is_active)}>
                    <span className="text-xs">{reward.is_active ? "🟢" : "🔴"}</span>
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDeleteReward(reward.id)}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-blue-50 text-blue-700">
                    {reward.punches_required} punches required
                  </Badge>
                  <Badge
                    variant="outline"
                    className={reward.is_active ? "bg-green-50 text-green-700" : "bg-gray-50 text-gray-700"}
                  >
                    {reward.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="border-0 shadow-md bg-white/80 backdrop-blur-sm">
            <CardContent className="text-center py-8">
              <Gift className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-500 text-lg font-medium">No rewards configured yet</p>
              <p className="text-slate-400 text-sm">Add your first reward to get started!</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Reward</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="editRewardName">Reward Name</Label>
              <Input
                id="editRewardName"
                placeholder="e.g., Free Coffee"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="editRewardDescription">Description</Label>
              <Textarea
                id="editRewardDescription"
                placeholder="Describe the reward in detail..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="editPunchesRequired">Punches Required</Label>
              <Input
                id="editPunchesRequired"
                type="number"
                min="1"
                max="50"
                value={formData.punches_required}
                onChange={(e) => setFormData({ ...formData, punches_required: Number.parseInt(e.target.value) || 10 })}
              />
            </div>

            {/* Image Selection - Same as Add Dialog */}
            <div className="space-y-3">
              <Label>Reward Image</Label>
              <Tabs
                value={formData.image_type}
                onValueChange={(value) => setFormData({ ...formData, image_type: value as any })}
              >
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="emoji">Emoji</TabsTrigger>
                  <TabsTrigger value="text">Text</TabsTrigger>
                  <TabsTrigger value="upload">Upload</TabsTrigger>
                </TabsList>

                <TabsContent value="emoji" className="space-y-2">
                  <div className="grid grid-cols-6 gap-2">
                    {["🎁", "☕", "🥐", "🍰", "🥤", "🍕", "🍔", "🌮", "🍜", "🍦", "🧁", "🥗"].map((emoji) => (
                      <Button
                        key={emoji}
                        type="button"
                        variant={formData.image_value === emoji ? "default" : "outline"}
                        className="h-12 text-2xl"
                        onClick={() => setFormData({ ...formData, image_value: emoji })}
                      >
                        {emoji}
                      </Button>
                    ))}
                  </div>
                  <Input
                    placeholder="Or type custom emoji..."
                    value={formData.image_type === "emoji" ? formData.image_value : ""}
                    onChange={(e) => setFormData({ ...formData, image_value: e.target.value })}
                  />
                </TabsContent>

                <TabsContent value="text" className="space-y-2">
                  <Input
                    placeholder="Enter text (e.g., FREE, 50% OFF)"
                    value={formData.image_type === "text" ? formData.image_value : ""}
                    onChange={(e) => setFormData({ ...formData, image_value: e.target.value })}
                  />
                  <p className="text-xs text-slate-500">This text will be displayed as the reward icon</p>
                </TabsContent>

                <TabsContent value="upload" className="space-y-2">
                  <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 text-center">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) handleImageUpload(file)
                      }}
                      className="hidden"
                      id="edit-image-upload"
                    />
                    <label htmlFor="edit-image-upload" className="cursor-pointer">
                      <div className="space-y-2">
                        <div className="mx-auto w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
                          📷
                        </div>
                        <p className="text-sm font-medium">Click to upload image</p>
                        <p className="text-xs text-slate-500">PNG, JPG up to 2MB</p>
                      </div>
                    </label>
                    {formData.image_file && <p className="text-xs text-green-600 mt-2">✓ {formData.image_file.name}</p>}
                  </div>
                </TabsContent>
              </Tabs>

              {/* Preview */}
              <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg">
                <span className="text-sm text-slate-600">Preview:</span>
                <div className="w-8 h-8 bg-white rounded-md flex items-center justify-center border">
                  {formData.image_type === "upload" && formData.image_file ? (
                    <img
                      src={URL.createObjectURL(formData.image_file) || "/placeholder.svg"}
                      alt="Preview"
                      className="w-full h-full object-cover rounded-md"
                    />
                  ) : formData.image_type === "upload" && formData.image_value ? (
                    <img
                      src={formData.image_value || "/placeholder.svg"}
                      alt="Current"
                      className="w-full h-full object-cover rounded-md"
                    />
                  ) : (
                    <span className={formData.image_type === "text" ? "text-xs font-bold" : "text-lg"}>
                      {formData.image_value || "🎁"}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleEditReward}
                disabled={!formData.name || !formData.description || isLoading}
                className="bg-gradient-to-r from-slate-600 to-blue-600 hover:from-slate-700 hover:to-blue-700"
              >
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
