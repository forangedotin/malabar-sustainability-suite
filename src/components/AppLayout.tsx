
import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useApp } from '@/contexts/AppContext';
import { Sidebar } from './Sidebar';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export function AppLayout() {
  const { user, isLoading } = useAuth();
  const { sidebarOpen, setSidebarOpen, isMobile } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [pageTransition, setPageTransition] = useState(false);
  
  // Effect to handle authentication redirect
  useEffect(() => {
    if (!isLoading && !user && !location.pathname.startsWith('/auth')) {
      navigate('/auth/login');
    }
  }, [isLoading, user, navigate, location.pathname]);
  
  // Effect for page transition animation
  useEffect(() => {
    setPageTransition(true);
    const timer = setTimeout(() => {
      setPageTransition(false);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [location.pathname]);
  
  if (isLoading) {
    return <LoadingScreen />;
  }
  
  if (!user && !location.pathname.startsWith('/auth')) {
    return null; // Will redirect via effect
  }
  
  return (
    <div className="h-screen flex overflow-hidden bg-background">
      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out lg:static lg:inset-0 lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <Sidebar />
      </div>
      
      {/* Overlay for mobile */}
      {sidebarOpen && isMobile && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden" 
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="h-16 flex items-center justify-between px-4 border-b">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </Button>
          
          <div className="lg:hidden mx-auto">
            <LogoSmall />
          </div>
          
          <div className="hidden lg:block">
            <h1 className="text-xl font-medium text-green-800">Malabar Eco Solutions</h1>
          </div>
          
          <div className="w-10"></div> {/* Placeholder for balance */}
        </header>
        
        {/* Main container */}
        <main 
          className={cn(
            "flex-1 overflow-auto transition-opacity duration-300 ease-in-out",
            pageTransition ? "animate-fade-in" : ""
          )}
        >
          <div className="container mx-auto py-6 px-4 md:px-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

function LoadingScreen() {
  return (
    <div className="h-screen flex items-center justify-center bg-background">
      <div className="space-y-4 w-full max-w-md px-8">
        <LogoSmall />
        <div className="text-center">
          <h2 className="text-2xl font-medium mb-2 text-green-800">Malabar Eco Solutions</h2>
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
        <div className="space-y-2 mt-6">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
          <Skeleton className="h-4 w-3/5" />
        </div>
      </div>
    </div>
  );
}

function LogoSmall() {
  return (
    <div className="flex items-center">
      <img 
        src="/lovable-uploads/3d98cd6b-fac4-45ba-ab02-ca6bd954c997.png" 
        alt="Malabar Eco Solutions Logo" 
        className="h-10" 
      />
      <span className="ml-2 font-medium text-lg text-green-800">MES</span>
    </div>
  );
}
