import { createContext, useContext, useEffect, useState } from "react";
import api from "../../services/api";

export type Session = {
  user_id: number;
  org_id: number;
  email: string;
} | null;

type AuthCtx = {
  session: Session;
  isAuthenticated: boolean;
  login: (s: Session) => void;
  logout: () => Promise<void>;
  loading: boolean;
};

const AuthContext = createContext<AuthCtx | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session>(null);
  const [loading, setLoading] = useState(true);

  // 1️⃣ Load user session from backend cookie
  useEffect(() => {
    async function loadUser() {
      try {
        const res = await api.get("/api/v1/auth/me", { withCredentials: true });
        setSession(res.data);
      } catch {
        setSession(null);
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, []);

  const login = (s: Session) => setSession(s);

  const logout = async () => {
    await api.post("/api/v1/auth/logout", {}, { withCredentials: true });
    setSession(null);
  };

  return (
    <AuthContext.Provider
      value={{ session, isAuthenticated: !!session, login, logout, loading }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("AuthContext not found");
  return ctx;
}
