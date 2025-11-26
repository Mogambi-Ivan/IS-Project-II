// frontend/src/context/UserContext.jsx
import React, { createContext, useContext, useState } from "react";

const UserContext = createContext(null);

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);

  function login(profile) {
    setUser(profile);
  }

  function logout() {
    setUser(null);
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
