/**
 * Safe storage helpers for Next.js applications
 * Handles localStorage access safely in both client and server contexts
 */

// Check if we're running on the client side
export const isClient = typeof window !== "undefined";

/**
 * Safely get an item from localStorage
 * @param key The key to retrieve from localStorage
 * @param defaultValue Optional default value if key doesn't exist or in server context
 * @returns The stored value or defaultValue
 */
export const getStorageItem = (
  key: string,
  defaultValue: string = ""
): string => {
  if (!isClient) return defaultValue;

  try {
    const item = localStorage.getItem(key);
    return item !== null ? item : defaultValue;
  } catch (error) {
    console.error(`Error getting ${key} from localStorage:`, error);
    return defaultValue;
  }
};

/**
 * Safely set an item in localStorage
 * @param key The key to set in localStorage
 * @param value The value to store
 * @returns true if successful, false otherwise
 */
export const setStorageItem = (key: string, value: string): boolean => {
  if (!isClient) return false;

  try {
    localStorage.setItem(key, value);
    return true;
  } catch (error) {
    console.error(`Error setting ${key} in localStorage:`, error);
    return false;
  }
};

/**
 * Safely remove an item from localStorage
 * @param key The key to remove from localStorage
 * @returns true if successful, false otherwise
 */
export const removeStorageItem = (key: string): boolean => {
  if (!isClient) return false;

  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`Error removing ${key} from localStorage:`, error);
    return false;
  }
};
