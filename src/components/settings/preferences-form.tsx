"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { updateUserSettingsAction, type UserSettings } from "@/app/actions/settings-actions"
import { useCurrency } from "@/context/currency-context";

interface PreferencesFormProps {
  initialSettings: UserSettings
}

export function PreferencesForm({ initialSettings }: PreferencesFormProps) {
  const [settings, setSettings] = useState<UserSettings>(initialSettings)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()
  const { setCurrency } = useCurrency();
  
  const handleChange = (key: keyof UserSettings, value: string | boolean | number) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setIsSubmitting(true)
      await updateUserSettingsAction(settings)
      setCurrency(settings.currency); // Update currency context after saving
      toast({
        title: "Settings saved",
        description: "Your preferences have been updated.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings.",
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
          <CardTitle>Preferences</CardTitle>
          <CardDescription>
            Customize your expense tracker experience.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currency">Default Currency</Label>
            <Select 
              value={settings.currency} 
              onValueChange={(value) => handleChange("currency", value)}
            >
              <SelectTrigger id="currency">
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USD">USD - US Dollar</SelectItem>
                <SelectItem value="EUR">EUR - Euro</SelectItem>
                <SelectItem value="GBP">GBP - British Pound</SelectItem>
                <SelectItem value="JPY">JPY - Japanese Yen</SelectItem>
                <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
                <SelectItem value="AUD">AUD - Australian Dollar</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="language">Language</Label>
            <Select 
              value={settings.language} 
              onValueChange={(value) => handleChange("language", value)}
            >
              <SelectTrigger id="language">
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="English">English</SelectItem>
                <SelectItem value="Spanish">Spanish</SelectItem>
                <SelectItem value="French">French</SelectItem>
                <SelectItem value="German">German</SelectItem>
                <SelectItem value="Chinese">Chinese</SelectItem>
                <SelectItem value="Japanese">Japanese</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="theme">Theme Color</Label>
            <div className="flex gap-2">
              <Input 
                id="theme" 
                type="color" 
                value={settings.theme}
                onChange={(e) => handleChange("theme", e.target.value)}
                className="w-16 h-10 p-1"
              />
              <div 
                className="flex-1 h-10 rounded-md border"
                style={{ backgroundColor: settings.theme }}
              ></div>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="autoSave">Auto Save</Label>
              <div className="text-sm text-muted-foreground">
                Automatically save changes as you make them
              </div>
            </div>
            <Switch 
              id="autoSave" 
              checked={settings.autoSave}
              onCheckedChange={(checked) => handleChange("autoSave", checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="darkMode">Dark Mode</Label>
              <div className="text-sm text-muted-foreground">
                Toggle between light and dark mode
              </div>
            </div>
            <Switch 
              id="darkMode" 
              checked={settings.darkMode}
              onCheckedChange={(checked) => handleChange("darkMode", checked)}
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
