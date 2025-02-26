"use client"

import { SignIn } from "@clerk/nextjs";
import Image from "next/image";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-r from-blue-100 to-purple-100 p-4">
      <div className="mb-8 flex flex-col items-center">
        <Image src="/logo.svg" alt="ExpenseTracker Logo" width={48} height={48} />
        <h1 className="mt-4 text-3xl font-bold">ExpenseTracker</h1>
        <p className="text-muted-foreground">Manage your finances with ease</p>
      </div>
      <div className="w-full max-w-md rounded-lg border bg-card p-8 shadow-lg">
        <SignIn 
          path="/sign-in" 
          routing="path" 
          signUpUrl="/sign-up" 
          redirectUrl="/dashboard"
        />
      </div>
    </div>
  );
}
