// src/stores/useCartHydrated.ts
import { useEffect, useState } from "react";
import { useCartStore } from "./cartStore";

export function useCartHydrated() {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const unsub = useCartStore.persist.onFinishHydration(() => setHydrated(true));
    if (useCartStore.persist.hasHydrated()) setHydrated(true);
    return unsub;
  }, []);

  return hydrated;
}