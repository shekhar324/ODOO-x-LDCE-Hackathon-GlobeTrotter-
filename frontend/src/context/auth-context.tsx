"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import type { Session, User as SupabaseUser } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import type { Tables } from "@/lib/supabase/types";

type Profile = Tables<"profiles">;

interface AuthContextType {
  /** True once we have resolved the session (initial loading done) */
  isLoading: boolean;
  /** Supabase session object, null when signed out */
  session: Session | null;
  /** Supabase auth user, null when signed out */
  user: SupabaseUser | null;
  /** GlobeTrotter profile row from public.profiles */
  profile: Profile | null;
  /** Whether the user is authenticated */
  isAuthenticated: boolean;
  /** Sign up with email + password + metadata */
  signUp: (email: string, password: string, metadata?: Record<string, string>) => Promise<{ error: Error | null }>;
  /** Sign in with email + password */
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  /** Sign out and clear local state */
  signOut: () => Promise<void>;
  /** Refresh the profile from the database */
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  isLoading: true,
  session: null,
  user: null,
  profile: null,
  isAuthenticated: false,
  signUp: async () => ({ error: null }),
  signIn: async () => ({ error: null }),
  signOut: async () => {},
  refreshProfile: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const supabase = createClient();

  const [isLoading, setIsLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);

  const fetchProfile = useCallback(
    async (userId: string) => {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();
      setProfile(data ?? null);
    },
    [supabase]
  );

  const refreshProfile = useCallback(async () => {
    if (user) await fetchProfile(user.id);
  }, [user, fetchProfile]);

  // Initialise: get current session and subscribe to auth changes
  useEffect(() => {
    let mounted = true;

    const init = async () => {
      const {
        data: { session: currentSession },
      } = await supabase.auth.getSession();

      if (!mounted) return;

      setSession(currentSession);
      setUser(currentSession?.user ?? null);

      if (currentSession?.user) {
        await fetchProfile(currentSession.user.id);
      }

      setIsLoading(false);
    };

    init();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      if (!mounted) return;

      setSession(newSession);
      setUser(newSession?.user ?? null);

      if (newSession?.user) {
        await fetchProfile(newSession.user.id);
      } else {
        setProfile(null);
      }

      setIsLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const signUp = useCallback(
    async (email: string, password: string, metadata?: Record<string, string>) => {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata ?? {},
        },
      });
      return { error: error as Error | null };
    },
    [supabase]
  );

  const signIn = useCallback(
    async (email: string, password: string) => {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      return { error: error as Error | null };
    },
    [supabase]
  );

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    setProfile(null);
  }, [supabase]);

  return (
    <AuthContext.Provider
      value={{
        isLoading,
        session,
        user,
        profile,
        isAuthenticated: !!session,
        signUp,
        signIn,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
