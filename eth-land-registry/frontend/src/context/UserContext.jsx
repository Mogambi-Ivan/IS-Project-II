import { createContext, useContext, useState } from "react";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [role, setRole] = useState(null); // "admin" or "owner"
  const [wallet, setWallet] = useState(null);

  const loginAs = (selectedRole) => {
    setRole(selectedRole);
    setWallet("0x1234...MockWallet"); // mock until metamask fixed
  };

  const logout = () => {
    setRole(null);
    setWallet(null);
  };

  return (
    <UserContext.Provider value={{ role, wallet, loginAs, logout }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
