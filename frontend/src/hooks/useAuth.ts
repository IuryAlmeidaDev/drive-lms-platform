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
    // Para novos visitantes, inicia sem autenticação para escolher como acessar
    return null;
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
    const isIury = cleanEmail === "iury.colombo@gmail.com";
    const cleanName = isIury
      ? "Iury Colombo"
      : name || cleanEmail.split("@")[0].replace(/[._-]/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());

    const userPicture = isIury
      ? "https://lh3.googleusercontent.com/a/ACg8ocJLxhrBNOpTMDm-iTKLRQE2cPVjmWW3S82UslzuYshxg8HtN8V4=s96-c"
      : picture || undefined;

    const newUser: User = {
      id: "u_" + Math.random().toString(36).substring(2, 9),
      email: cleanEmail,
      name: cleanName,
      picture: userPicture,
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
