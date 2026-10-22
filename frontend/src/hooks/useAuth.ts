import { useState, useEffect, useCallback } from "react";
import { User } from "@/types/course";

const STORAGE_KEY_AUTH = "curso_drive_auth_user";

export function useAuth() {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_AUTH);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error("Erro ao carregar usuário salvo", e);
    }
    // Usuário padrão inicial caso já tenha feito login anteriormente
    return {
      id: "u_iury",
      name: "Iury Colombo",
      email: "iury.colombo@gmail.com",
      picture: "https://lh3.googleusercontent.com/a/ACg8ocJLxhrBNOpTMDm-iTKLRQE2cPVjmWW3S82UslzuYshxg8HtN8V4=s96-c",
      isGuest: false,
    };
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_KEY_AUTH, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY_AUTH);
    }
  }, [user]);

  const loginWithEmail = useCallback((email: string, name?: string, picture?: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name || cleanEmail.split("@")[0];
    const newUser: User = {
      id: "u_" + Math.random().toString(36).substring(2, 9),
      email: cleanEmail,
      name: cleanName,
      picture: picture || undefined,
      isGuest: false,
    };
    setUser(newUser);
  }, []);

  const loginAsGuest = useCallback(() => {
    const guestUser: User = {
      id: "u_guest",
      name: "Visitante",
      email: "convidado@demo.com",
      isGuest: true,
    };
    setUser(guestUser);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  return {
    user,
    isAuthenticated: !!user,
    loginWithEmail,
    loginAsGuest,
    logout,
  };
}
