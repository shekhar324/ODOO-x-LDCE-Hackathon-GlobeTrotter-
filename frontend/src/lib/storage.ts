export const LOCAL_STORAGE_KEYS = [
  "GT_LOCAL_TRIPS",
  "GT_LOCAL_CALENDAR_EVENTS",
  "GT_LOCAL_STOPS",
  "GT_LOCAL_ACTIVITIES",
];

export function clearUserDataLocalStorage(): void {
  if (typeof window === "undefined") return;
  try {
    for (const key of LOCAL_STORAGE_KEYS) {
      localStorage.removeItem(key);
    }
  } catch (err) {
    console.warn("Failed to clear user local storage:", err);
  }
}
