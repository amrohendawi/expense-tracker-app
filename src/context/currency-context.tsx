"use client";

import { createContext, useContext, ReactNode, useState, useEffect } from "react";
import { getUserSettingsAction } from "@/app/actions/settings-actions";

type CurrencyContextType = {
  currency: string;
  setCurrency: (currency: string) => void;
};

const CurrencyContext = createContext<CurrencyContextType>({
  currency: "USD",
  setCurrency: () => {},
});

export function CurrencyProvider({ 
  initialCurrency = "USD", 
  children 
}: { 
  initialCurrency?: string; 
  children: ReactNode 
}) {
  const [currency, setCurrency] = useState(initialCurrency);
  
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const settings = await getUserSettingsAction();
        if (settings.currency !== currency) {
          setCurrency(settings.currency);
        }
      } catch (error) {
        console.error("Failed to load currency settings:", error);
      }
    };
    
    loadSettings();
  }, [currency]);

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export const useCurrency = () => useContext(CurrencyContext);
