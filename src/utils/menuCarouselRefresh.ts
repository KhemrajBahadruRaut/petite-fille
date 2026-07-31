const MENU_CAROUSEL_CHANNEL = "petite-fille-menu-carousel";
const MENU_CAROUSEL_STORAGE_KEY = "petite-fille:menu-carousel-updated-at";
const MENU_CAROUSEL_WINDOW_EVENT = "menu-carousel-refresh";

export function announceMenuCarouselRefresh(): void {
  if (typeof window === "undefined") return;

  const version = Date.now().toString();

  try {
    window.localStorage.setItem(MENU_CAROUSEL_STORAGE_KEY, version);
  } catch {
    // Live polling remains available if browser storage is unavailable.
  }

  if (typeof BroadcastChannel !== "undefined") {
    const channel = new BroadcastChannel(MENU_CAROUSEL_CHANNEL);
    channel.postMessage(version);
    channel.close();
  }

  window.dispatchEvent(new Event(MENU_CAROUSEL_WINDOW_EVENT));
}

export function subscribeToMenuCarouselRefresh(
  refresh: () => void,
): () => void {
  if (typeof window === "undefined") return () => undefined;

  const handleStorage = (event: StorageEvent) => {
    if (event.key === MENU_CAROUSEL_STORAGE_KEY) refresh();
  };
  const handleWindowRefresh = () => refresh();
  const channel =
    typeof BroadcastChannel !== "undefined"
      ? new BroadcastChannel(MENU_CAROUSEL_CHANNEL)
      : null;

  if (channel) channel.onmessage = refresh;
  window.addEventListener("storage", handleStorage);
  window.addEventListener(MENU_CAROUSEL_WINDOW_EVENT, handleWindowRefresh);

  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(MENU_CAROUSEL_WINDOW_EVENT, handleWindowRefresh);
    channel?.close();
  };
}
