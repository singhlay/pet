import React, { createContext, useContext, useState, useEffect } from "react";
import { User, AuthUser } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";
import { authService } from "../lib/supabase/auth.ts";
import { toast } from "react-hot-toast";
import { userService } from "../lib/supabase/services/userService.ts";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setIsAuthenticated: (value: boolean) => void;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        // Only set authenticated if email is verified
        if (session.user.email_confirmed_at) {
          //   setUser(session.user);
          authService.getCurrentUser().then((res: User | null) => {
            if (res) {
              userService.getUserInfo(res.id).then((data: any) => {
                if (data) {
                  setUser({ ...res, ...data });
                  setIsAuthenticated(true);
                }
              });
            }
          });
        } else {
          // If email is not verified, sign out
          supabase.auth.signOut();
          toast.error("Please verify your email before signing in");
        }
      }
      setIsLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN") {
        if (session?.user.email_confirmed_at) {
          setUser(session.user);
          setIsAuthenticated(true);
        } else {
          // If email is not verified, sign out
          await supabase.auth.signOut();
          toast.error("Please verify your email before signing in");
        }
      } else if (event === "SIGNED_OUT") {
        setUser(null);
        setIsAuthenticated(false);
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;

      if (data.user) {
        // Don't set user or authenticated state on signup
        // Wait for email verification
        toast.success("Please check your email to verify your account");
      }
    } catch (error) {
      console.error("Error signing up:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (!data.user) {
        throw new Error("No user data returned");
      }

      if (!data.user.email_confirmed_at) {
        await supabase.auth.signOut();
        throw new Error("Please verify your email before signing in");
      }

      // Fetch additional user info and update the user state
      if (data.user) {
        const userInfo = await userService.getUserInfo(data.user.id);
        if (userInfo) {
          setUser({ ...data.user, ...userInfo });
          setIsAuthenticated(true);
        }
      }
    } catch (error) {
      console.error("Error signing in:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error("Error signing out:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/update-password`,
      });

      if (error) throw error;
    } catch (error) {
      console.error("Error resetting password:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        setUser,
        setIsAuthenticated,
        signUp,
        signIn,
        signOut,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
