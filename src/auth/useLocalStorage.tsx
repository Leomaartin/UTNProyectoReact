import { useState } from "react";

function useLocalStorage(key, initialValue) {
  const [storeValue, setStoreValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (!item || item === "undefined") return initialValue;
      return JSON.parse(item);
    } catch (error) {
      console.log(error);
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      setStoreValue(value);
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.log(error);
    }
  };

  return [storeValue, setValue];
}

export default useLocalStorage;
