import { getUserSettingsAction } from "@/app/actions/settings-actions";
import Providers from "@/components/providers";
import CategoryInitializer from "@/components/category-initializer";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const userSettings = await getUserSettingsAction() || { currency: 'USD' };

  return (
    <Providers currency={userSettings.currency}>
      {/* Component that initializes categories client-side */}
      <CategoryInitializer />
      {children}
    </Providers>
  );
}
