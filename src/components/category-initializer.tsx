"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { initializeCategoriesAction, getCategoriesAction } from "@/app/actions/category-actions";

export default function CategoryInitializer() {
  const router = useRouter();
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    async function initCategories() {
      if (initialized) return;
      
      try {
        // Initialize categories if needed
        await initializeCategoriesAction();
        
        // Check if categories were successfully created
        const categories = await getCategoriesAction();
        
        if (categories && categories.length > 0) {
          console.log("Categories initialized successfully:", categories.length);
          setInitialized(true);
          // Force a refresh to ensure the UI updates
          router.refresh();
        }
      } catch (error) {
        console.error("Failed to initialize categories:", error);
      }
    }

    // Run initialization once when component mounts
    initCategories();
  }, [router, initialized]);

  // This component doesn't render anything visible
  return null;
}
