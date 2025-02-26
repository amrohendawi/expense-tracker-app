"use client"

import { useState } from "react"
import { useUser } from "@clerk/nextjs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"

export function ProfileSettings() {
  const { user, isLoaded } = useUser()
  const [isUpdating, setIsUpdating] = useState(false)
  const { toast } = useToast()
  
  if (!isLoaded) {
    return <div>Loading...</div>
  }
  
  const handleUpdateProfile = async () => {
    try {
      setIsUpdating(true)
      // In a real implementation, you would update the user profile
      // For now, we'll just show a success toast
      await new Promise(resolve => setTimeout(resolve, 500))
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully",
      })
    } catch {
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Settings</CardTitle>
        <CardDescription>
          Manage your profile information and account details.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center gap-4">
          <Avatar className="h-20 w-20">
            <AvatarImage src={user?.imageUrl} alt={user?.fullName || ""} />
            <AvatarFallback>{user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="text-lg font-medium">{user?.fullName}</h3>
            <p className="text-sm text-muted-foreground">{user?.primaryEmailAddress?.emailAddress}</p>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input id="firstName" defaultValue={user?.firstName || ""} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input id="lastName" defaultValue={user?.lastName || ""} />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input 
              id="email" 
              defaultValue={user?.primaryEmailAddress?.emailAddress || ""} 
              disabled 
            />
            <p className="text-xs text-muted-foreground">
              Email changes must be done through your account provider.
            </p>
          </div>
        </div>
        
        <Button onClick={handleUpdateProfile} disabled={isUpdating}>
          {isUpdating ? "Updating..." : "Update Profile"}
        </Button>
      </CardContent>
    </Card>
  )
}
