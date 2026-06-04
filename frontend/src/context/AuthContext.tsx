"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface AuthContextType {
  user: string | null;
  login: (username: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<string | null>(null);

  useEffect(() => {
    // Check local storage on initial load
    const storedUser = localStorage.getItem("userName");
    if (storedUser) {
      setUser(storedUser);
    }
  }, []);

  const login = (username: string) => {
    setUser(username);
    localStorage.setItem("userName", username);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("userName");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
