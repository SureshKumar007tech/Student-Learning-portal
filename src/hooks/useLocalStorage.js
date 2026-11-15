import { useDebugValue, useEffect, useState } from "react";

function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // storage unavailable (private mode / quota) — keep in-memory value
    }
  }, [key, value]);

  useDebugValue(`Stored: ${key}`);

  return [value, setValue];
}

export default useLocalStorage;