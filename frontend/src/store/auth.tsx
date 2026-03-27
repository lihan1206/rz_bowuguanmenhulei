import { createContext, type ReactNode, useContext, useEffect, useState } from "react";

import { api } from "../api/services";
import type { UserInfo } from "../api/types";

interface AuthCtx {
  user: UserInfo | null;
  loading: boolean;
  refreshUser: () => Promise<void>;
  setUser: (user: UserInfo | null) => void;
}

const AuthContext = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);

  async function refreshUser() {
    try {
      const current = await api.me();
      setUser(current);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refreshUser();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        refreshUser,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("认证上下文未挂载");
  }
  return ctx;
}
