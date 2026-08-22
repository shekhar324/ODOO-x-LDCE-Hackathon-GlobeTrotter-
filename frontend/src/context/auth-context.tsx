"use client";

import React, { createContext, useContext, useState } from "react";

interface User {
  name: string;
  email: string;
  avatar?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (email: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  login: () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("gt_auth") === "true";
    }
    return false;
  });

  const [user, setUser] = useState<User | null>(() => {
    if (typeof window !== "undefined" && localStorage.getItem("gt_auth") === "true") {
      const storedUser = localStorage.getItem("gt_user");
      if (storedUser) {
        try {
          return JSON.parse(storedUser);
        } catch {
          // ignore
        }
      }
      return {
        name: "Abhishek Thormothe",
        email: "abhishek@globetrotter.app",
        avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuAQXweEahHINIjm8wTk4JDPQ0oFqvkq_ylbrP9KZOVM3ErdkvsYfN-O3nhE6xnTr7U5DL98bVwQkNAVMsikB8LxTE735JTAOKStWBVQypt02_sCz75D4HF-eoeBgS_GiHgjyz8TCHr9LOXQUHfjXp014OEWPOMMyq0wmv0OK7cN6mSlrcAZgS7-9y6G5yQsrAwRH9jxotAX3H66zQfY-5KG2ZQQr3WHmspM4vVx1k2t9HLYX-qV_7oH",
      };
    }
    return null;
  });

  const login = (email: string) => {
    setIsAuthenticated(true);
    const userObj = {
      name: email.split("@")[0].replace(".", " ") || "Abhishek Thormothe",
      email: email || "abhishek@globetrotter.app",
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuAQXweEahHINIjm8wTk4JDPQ0oFqvkq_ylbrP9KZOVM3ErdkvsYfN-O3nhE6xnTr7U5DL98bVwQkNAVMsikB8LxTE735JTAOKStWBVQypt02_sCz75D4HF-eoeBgS_GiHgjyz8TCHr9LOXQUHfjXp014OEWPOMMyq0wmv0OK7cN6mSlrcAZgS7-9y6G5yQsrAwRH9jxotAX3H66zQfY-5KG2ZQQr3WHmspM4vVx1k2t9HLYX-qV_7oH",
    };
    setUser(userObj);
    localStorage.setItem("gt_auth", "true");
    localStorage.setItem("gt_user", JSON.stringify(userObj));
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem("gt_auth");
    localStorage.removeItem("gt_user");
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
