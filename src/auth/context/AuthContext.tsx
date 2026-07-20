import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import api from "../../services/api";
import i18n from "../../i18n";

export type Session = {
  user_id: number;
  org_id: number;
  org_code: string;
  email: string;
  name: string | null;
  picture_url: string | null;
  preferred_language: string;
} | null;

type AuthCtx = {
  session: Session;
  org_code?: string;
  isAuthenticated: boolean;
  login: (s: Session) => void;
  logout: () => Promise<void>;
  updateSession: (patch: Partial<NonNullable<Session>>) => void;
  loading: boolean;
};

const AuthContext = createContext<AuthCtx | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session>(null);
  const [loading, setLoading] = useState(true);

  // 1️⃣ Load user session from backend cookie
  useEffect(() => {
    const controller = new AbortController();

    async function loadUser() {
      try {
        const res = await api.get("/api/v1/auth/me", {
          signal: controller.signal,
        });
        setSession(res.data);
      } catch (err) {
        if (!axios.isCancel(err)) setSession(null);
      } finally {
        // Don't flip loading off for a stale/aborted run (e.g. StrictMode's
        // dev-only double-invoke) — only the run that actually finished should.
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    loadUser();

    return () => controller.abort();
  }, []);

  // 2️⃣ Keep the UI language in sync with whichever session is active —
  // covers both the initial /me load and every subsequent login.
  useEffect(() => {
    if (session?.preferred_language) {
      i18n.changeLanguage(session.preferred_language);
    }
  }, [session?.preferred_language]);

  const login = (s: Session) => setSession(s);

  const updateSession = (patch: Partial<NonNullable<Session>>) => {
    setSession((prev) => (prev ? { ...prev, ...patch } : prev));
  };

  const logout = async () => {
    await api.post("/api/v1/auth/logout", {}, { withCredentials: true });
    setSession(null);
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        org_code: session?.org_code,
        isAuthenticated: !!session,
        login,
        logout,
        updateSession,
        loading,
      }}
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
