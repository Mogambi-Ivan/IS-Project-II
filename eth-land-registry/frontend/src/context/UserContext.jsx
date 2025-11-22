// frontend/src/context/UserContext.jsx
import { createContext, useContext, useState } from "react";

const UserContext = createContext(null);

export function UserProvider({ children }) {
  const [role, setRole] = useState(null); // "owner" | "admin" | "government"

  const login = (selectedRole) => {
    setRole(selectedRole);
  };

  const logout = () => {
    setRole(null);
    // clear anything you want on logout, e.g. localStorage.removeItem("something");
  };

  return (
    <UserContext.Provider value={{ role, login, logout }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) {
    throw new Error("useUser must be used inside <UserProvider>");
  }
  return ctx;
}
