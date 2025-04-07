"use client";

import { CurrencyProvider } from "./currency-provider";

export default function Providers({
  children,
  currency,
}: {
  children: React.ReactNode;
  currency: string;
}) {
  return (
    <CurrencyProvider initialCurrency={currency}>
      {children}
    </CurrencyProvider>
  );
}
