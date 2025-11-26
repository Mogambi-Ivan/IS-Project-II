// frontend/src/context/UserContext.jsx
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

const UserContext = createContext(null);
const STORAGE_KEY = "landRegistryUserProfile";

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);

  // Load user profile from localStorage on start
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        setUser(JSON.parse(raw));
      }
    } catch (err) {
      console.error("Failed to load stored user profile:", err);
    }
  }, []);

  function login(profile) {
    setUser(profile);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    } catch (err) {
      console.error("Failed to store user profile:", err);
    }
  }

  function logout() {
    setUser(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (err) {
      console.error("Failed to clear user profile:", err);
    }
  }

  const value = {
    user,
    role: user?.role || null,
    name: user?.name || "",
    nationalId: user?.nationalId || "",
    wallet: user?.wallet || "",
    login,
    logout,
  };

  return (
    <UserContext.Provider value={value}>{children}</UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
