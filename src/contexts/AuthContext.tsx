
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase, getCurrentUser, getUserRole } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import { UserRole } from '@/types';

type AuthContextType = {
  user: any | null;
  role: UserRole | null;
  isLoading: boolean;
  isAdmin: boolean;
  isManager: boolean;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  role: null,
  isLoading: true,
  isAdmin: false,
  isManager: false,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<any | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Check for current user on mount
    const initAuth = async () => {
      setIsLoading(true);
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser || null);
        
        if (currentUser) {
          const userRole = await getUserRole();
          setRole(userRole);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        toast({
          title: 'Authentication Error',
          description: 'There was a problem with authentication. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    initAuth();
    
    // Subscribe to auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          setUser(session.user);
          const userRole = await getUserRole();
          setRole(userRole);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setRole(null);
        }
      }
    );
    
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [toast]);
  
  const isAdmin = role === 'admin';
  const isManager = role === 'manager';
  
  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isLoading,
        isAdmin,
        isManager,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
