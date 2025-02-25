import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  const { userId } = auth();
  
  // Clerk sign-in and sign-up URLs
  const signInUrl = "/sign-in";
  const signUpUrl = "/sign-up";

  // Redirect authenticated users to dashboard
  if (userId) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="px-4 lg:px-6 h-14 flex items-center">
        <Link className="flex items-center justify-center" href="/">
          <span className="font-bold text-xl">Smart Expense Tracker</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link
            className="text-sm font-medium hover:underline underline-offset-4"
            href={signInUrl}
          >
            Sign In
          </Link>
          <Link
            className="text-sm font-medium hover:underline underline-offset-4"
            href={signUpUrl}
          >
            Sign Up
          </Link>
        </nav>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                    Take Control of Your Finances
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    Smart Expense Tracker helps you monitor your expenses, set budgets, and make better financial decisions.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Link href={signUpUrl}>
                    <Button size="lg">
                      Get Started
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href={signInUrl}>
                    <Button size="lg" variant="outline">
                      Sign In
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <div className="relative h-[350px] w-[350px] sm:h-[400px] sm:w-[400px] md:h-[450px] md:w-[450px] lg:h-[500px] lg:w-[500px]">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full opacity-20 blur-3xl"></div>
                  <div className="relative bg-white dark:bg-gray-950 border rounded-xl shadow-lg p-6 h-full flex flex-col justify-between">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="font-semibold text-lg">Monthly Overview</h3>
                        <span className="text-sm text-muted-foreground">February 2025</span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Food</span>
                          <span className="font-medium">$350.00</span>
                        </div>
                        <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                          <div className="bg-blue-500 h-full w-[70%]"></div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Transportation</span>
                          <span className="font-medium">$120.00</span>
                        </div>
                        <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                          <div className="bg-purple-500 h-full w-[40%]"></div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Entertainment</span>
                          <span className="font-medium">$200.00</span>
                        </div>
                        <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                          <div className="bg-pink-500 h-full w-[55%]"></div>
                        </div>
                      </div>
                    </div>
                    <div className="pt-4 border-t">
                      <div className="flex justify-between">
                        <span className="font-semibold">Total Spent</span>
                        <span className="font-bold">$670.00</span>
                      </div>
                      <div className="flex justify-between mt-1">
                        <span className="text-sm text-muted-foreground">Budget</span>
                        <span className="text-sm">$1,000.00</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-100 dark:bg-gray-900">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">Key Features</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl">
                  Everything you need to manage your personal finances effectively.
                </p>
              </div>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:gap-8">
                <div className="flex flex-col items-center space-y-2 rounded-lg border p-6">
                  <div className="rounded-full bg-blue-100 dark:bg-blue-900 p-3">
                    <svg
                      className="h-6 w-6 text-blue-500 dark:text-blue-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      ></path>
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold">Expense Tracking</h3>
                  <p className="text-sm text-muted-foreground">
                    Easily record and categorize your daily expenses.
                  </p>
                </div>
                <div className="flex flex-col items-center space-y-2 rounded-lg border p-6">
                  <div className="rounded-full bg-purple-100 dark:bg-purple-900 p-3">
                    <svg
                      className="h-6 w-6 text-purple-500 dark:text-purple-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                      ></path>
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold">Budget Management</h3>
                  <p className="text-sm text-muted-foreground">
                    Set budgets for different categories and track your progress.
                  </p>
                </div>
                <div className="flex flex-col items-center space-y-2 rounded-lg border p-6">
                  <div className="rounded-full bg-pink-100 dark:bg-pink-900 p-3">
                    <svg
                      className="h-6 w-6 text-pink-500 dark:text-pink-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
                      ></path>
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold">Visual Reports</h3>
                  <p className="text-sm text-muted-foreground">
                    Visualize your spending patterns with intuitive charts and graphs.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full border-t px-4 md:px-6">
        <p className="text-xs text-muted-foreground">
          2025 Smart Expense Tracker. All rights reserved.
        </p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Terms of Service
          </Link>
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  );
}
