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

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrency] = useState("USD");
  
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const settings = await getUserSettingsAction();
        setCurrency(settings.currency);
      } catch (error) {
        console.error("Failed to load currency settings:", error);
      }
    };
    
    loadSettings();
  }, []);

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export const useCurrency = () => useContext(CurrencyContext);
