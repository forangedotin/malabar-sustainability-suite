
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, getCurrentUser, getUserRole, getProfile } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import { User } from '@supabase/supabase-js';

type Profile = {
  id: string;
  first_name: string;
  last_name: string;
  role: 'admin' | 'manager';
  phone?: string;
};

type AuthContextType = {
  user: User | null;
  profile: Profile | null;
  role: string | null;
  isAdmin: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean }>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const initAuth = async () => {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);

        if (currentUser) {
          const userRole = await getUserRole();
          setRole(userRole);
          
          const userProfile = await getProfile();
          setProfile(userProfile);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();

    // Set up auth state change listener
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        setUser(session.user);
        const userRole = await getUserRole();
        setRole(userRole);
        const userProfile = await getProfile();
        setProfile(userProfile);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setRole(null);
        setProfile(null);
      }
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast({
          title: 'Login failed',
          description: error.message,
          variant: 'destructive',
        });
        return { success: false };
      }

      setUser(data.user);
      
      const userRole = await getUserRole();
      setRole(userRole);
      
      const userProfile = await getProfile();
      setProfile(userProfile);
      
      return { success: true };
    } catch (error: any) {
      toast({
        title: 'Login error',
        description: error.message,
        variant: 'destructive',
      });
      return { success: false };
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setRole(null);
      setProfile(null);
    } catch (error: any) {
      toast({
        title: 'Sign out error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        role,
        isAdmin: role === 'admin',
        isLoading,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
