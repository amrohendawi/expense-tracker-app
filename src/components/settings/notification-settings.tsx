"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/components/ui/use-toast"
import { updateUserSettingsAction, type UserSettings } from "@/app/actions/settings-actions"

interface NotificationSettingsProps {
  initialSettings: UserSettings
}

export function NotificationSettings({ initialSettings }: NotificationSettingsProps) {
  const [settings, setSettings] = useState({
    emailNotifications: initialSettings.emailNotifications,
    budgetAlerts: initialSettings.budgetAlerts,
    weeklySummary: initialSettings.weeklySummary,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()
  
  const handleChange = (key: string, value: boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setIsSubmitting(true)
      await updateUserSettingsAction(settings)
      toast({
        title: "Notification settings saved",
        description: "Your notification preferences have been updated",
      })
    } catch (error) {
      toast({
        title: "Save failed",
        description: "Failed to save notification settings",
        variant: "destructive",
      })
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }
  
  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Notification Settings</CardTitle>
          <CardDescription>
            Configure how you want to receive notifications.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="emailNotifications">Email Notifications</Label>
              <div className="text-sm text-muted-foreground">
                Receive notifications via email
              </div>
            </div>
            <Switch 
              id="emailNotifications" 
              checked={settings.emailNotifications}
              onCheckedChange={(checked) => handleChange("emailNotifications", checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="budgetAlerts">Budget Alerts</Label>
              <div className="text-sm text-muted-foreground">
                Get notified when you&apos;re approaching your budget limits
              </div>
            </div>
            <Switch 
              id="budgetAlerts" 
              checked={settings.budgetAlerts}
              onCheckedChange={(checked) => handleChange("budgetAlerts", checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="weeklySummary">Weekly Summary</Label>
              <div className="text-sm text-muted-foreground">
                Receive a weekly summary of your expenses
              </div>
            </div>
            <Switch 
              id="weeklySummary" 
              checked={settings.weeklySummary}
              onCheckedChange={(checked) => handleChange("weeklySummary", checked)}
            />
          </div>
          
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </CardContent>
      </Card>
    </form>
  )
}
