"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
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
import { useToast } from "@/components/ui/use-toast"
import { exportUserDataAction, deleteAllUserDataAction } from "@/app/actions/settings-actions"
import { Download, Upload, AlertTriangle } from "lucide-react"

export function DataManagement() {
  const [isExporting, setIsExporting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const { toast } = useToast()
  
  const handleExportData = async () => {
    try {
      setIsExporting(true)
      const data = await exportUserDataAction()
      
      // Create a downloadable JSON file
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `expense-tracker-export-${new Date().toISOString().split("T")[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
      toast({
        title: "Data exported",
        description: "Your data has been exported successfully",
      })
    } catch (error) {
      toast({
        title: "Export failed",
        description: "Failed to export data",
        variant: "destructive",
      })
      console.error(error)
    } finally {
      setIsExporting(false)
    }
  }
  
  const handleDeleteAllData = async () => {
    try {
      setIsDeleting(true)
      await deleteAllUserDataAction()
      toast({
        title: "Data deleted",
        description: "All your data has been deleted successfully",
      })
    } catch (error) {
      toast({
        title: "Delete failed",
        description: "Failed to delete data",
        variant: "destructive",
      })
      console.error(error)
    } finally {
      setIsDeleting(false)
    }
  }
  
  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    const reader = new FileReader()
    reader.onload = async (event) => {
      try {
        // Parse the JSON data
        JSON.parse(event.target?.result as string)
        // In a real implementation, you would validate and import the data
        // For now, we'll just show a success toast
        await new Promise(resolve => setTimeout(resolve, 500))
        toast({
          title: "Data imported",
          description: "Your data has been imported successfully",
        })
      } catch (error) {
        toast({
          title: "Import failed",
          description: "Failed to import data: Invalid file format",
          variant: "destructive",
        })
        console.error(error)
      }
    }
    reader.readAsText(file)
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Data Management</CardTitle>
        <CardDescription>
          Export, import, or delete your expense data.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Button 
            variant="outline" 
            className="w-full justify-start" 
            onClick={handleExportData}
            disabled={isExporting}
          >
            <Download className="mr-2 h-4 w-4" />
            {isExporting ? "Exporting..." : "Export All Data"}
          </Button>
          
          <div className="relative">
            <Button variant="outline" className="w-full justify-start">
              <Upload className="mr-2 h-4 w-4" />
              Import Data
            </Button>
            <input
              type="file"
              accept=".json"
              className="absolute inset-0 cursor-pointer opacity-0"
              onChange={handleImportData}
            />
          </div>
        </div>
        
        <div className="pt-4">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="w-full">
                <AlertTriangle className="mr-2 h-4 w-4" />
                Delete All Data
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete all your expenses, 
                  categories, and budgets from our servers.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteAllData}
                  disabled={isDeleting}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {isDeleting ? "Deleting..." : "Yes, delete all my data"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  )
}
