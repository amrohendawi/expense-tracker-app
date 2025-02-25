"use client"

import { SignIn } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

export default function SignInPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <SignIn 
        path="/sign-in" 
        routing="path" 
        signUpUrl="/sign-up" 
        redirectUrl="/dashboard"
      />
    </div>
  );
}
