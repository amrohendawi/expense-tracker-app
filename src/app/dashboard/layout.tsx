import { getUserSettingsAction } from "@/app/actions/settings-actions";
import { CurrencyProvider } from "@/context/currency-context";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Get user settings server-side before rendering
  const userSettings = await getUserSettingsAction();
  
  return (
    <CurrencyProvider initialCurrency={userSettings.currency}>
      {children}
    </CurrencyProvider>
  );
}
