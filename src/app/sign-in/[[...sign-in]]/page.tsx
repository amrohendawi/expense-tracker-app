"use client"

import { SignIn } from "@clerk/nextjs";
import Image from "next/image";
import { DollarSign } from "lucide-react";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-r from-blue-50 to-indigo-50 p-4">
      <div className="mb-8 flex flex-col items-center">
        <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 text-primary">
          <DollarSign className="h-6 w-6" />
        </div>
        <h1 className="mt-4 text-3xl font-bold">ExpenseTracker</h1>
        <p className="text-muted-foreground">Manage your finances with ease</p>
      </div>
      <div className="w-full max-w-md">
        <SignIn 
          path="/sign-in" 
          routing="path" 
          signUpUrl="/sign-up" 
          redirectUrl="/dashboard"
          appearance={{
            elements: {
              rootBox: "mx-auto",
              card: "shadow-none bg-transparent",
              formButtonPrimary: "bg-primary hover:bg-primary/90",
            }
          }}
        />
      </div>
    </div>
  );
}
