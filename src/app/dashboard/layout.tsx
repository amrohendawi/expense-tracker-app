import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { createUserIfNotExists } from "@/lib/db";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // Create user in our database if they don't exist
  await createUserIfNotExists();

  return <>{children}</>;
}
