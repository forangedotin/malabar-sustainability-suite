
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/auth';
import {
  LayoutDashboard,
  MapPin,
  Truck,
  Package,
  TrendingUp,
  DollarSign,
  FileText,
  Users,
  Menu,
  X,
  LogOut,
  User,
  Route,
  Search,
  Car,
  Settings
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { useMediaQuery } from '@/hooks/use-media-query';
import { useToast } from '@/components/ui/use-toast';

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  adminOnly?: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ to, icon, label, adminOnly = false }) => {
  const { isAdmin } = useAuth();
  const location = useLocation();
  const isActive = location.pathname === to;

  if (adminOnly && !isAdmin) return null;

  return (
    <Link
      to={to}
      className={cn(
        'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all',
        isActive
          ? 'bg-green-100 text-green-800'
          : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
      )}
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
};

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const isMobile = useMediaQuery('(max-width: 768px)');
  const { toast } = useToast();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Signed out successfully",
        description: "You have been signed out of your account.",
      });
      navigate('/login');
    } catch (error) {
      console.error("Sign out error:", error);
      toast({
        title: "Sign out failed",
        description: "There was a problem signing out. Please try again.",
        variant: "destructive"
      });
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <aside
        className={cn(
          'fixed inset-y-0 z-50 flex w-64 flex-col border-r bg-background transition-transform duration-300 ease-in-out md:relative md:translate-x-0',
          isSidebarOpen || !isMobile ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-16 items-center border-b px-4">
          <Link to="/dashboard" className="flex items-center gap-2" onClick={closeSidebar}>
            <img 
              src="/lovable-uploads/3d98cd6b-fac4-45ba-ab02-ca6bd954c997.png" 
              alt="Malabar Eco Solutions Logo" 
              className="h-10" 
            />
            <span className="text-xl font-bold text-green-800">Malabar Eco</span>
          </Link>
          {isMobile && (
            <Button
              variant="ghost"
              size="icon"
              className="ml-auto md:hidden"
              onClick={toggleSidebar}
            >
              <X className="h-5 w-5" />
            </Button>
          )}
        </div>
        <nav className="flex-1 overflow-y-auto p-4">
          <div className="space-y-1">
            <NavItem to="/dashboard" icon={<LayoutDashboard className="h-5 w-5" />} label="Dashboard" />
            <NavItem to="/locations" icon={<MapPin className="h-5 w-5" />} label="Locations" />
            <NavItem to="/collections" icon={<Truck className="h-5 w-5" />} label="Collections" />
            <NavItem to="/inventory" icon={<Package className="h-5 w-5" />} label="Inventory" />
            <NavItem to="/sales" icon={<TrendingUp className="h-5 w-5" />} label="Sales" />
            <NavItem to="/expenses" icon={<DollarSign className="h-5 w-5" />} label="Expenses" />
            <NavItem to="/reports" icon={<FileText className="h-5 w-5" />} label="Reports" />
            <NavItem to="/settings" icon={<Settings className="h-5 w-5" />} label="Settings" />
            <NavItem to="/managers" icon={<Users className="h-5 w-5" />} label="Managers" adminOnly={true} />
            
            <div className="my-2 border-t pt-2">
              <h4 className="mb-1 px-3 text-xs font-semibold uppercase text-muted-foreground">
                Transport
              </h4>
              <NavItem to="/vehicles" icon={<Car className="h-5 w-5" />} label="Vehicles" />
              <NavItem to="/drivers" icon={<User className="h-5 w-5" />} label="Drivers" />
              <NavItem to="/trips" icon={<Route className="h-5 w-5" />} label="Trips" />
              <NavItem to="/token" icon={<Search className="h-5 w-5" />} label="Token Lookup" />
            </div>
          </div>
        </nav>
        <div className="border-t p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-green-600 text-white">
              {profile?.first_name?.[0] || profile?.last_name?.[0] || 'U'}
            </div>
            <div className="flex flex-1 flex-col overflow-hidden">
              <span className="truncate text-sm font-medium">
                {profile?.first_name} {profile?.last_name}
              </span>
              <span className="truncate text-xs text-muted-foreground capitalize">
                {profile?.role}
              </span>
            </div>
            <Button variant="ghost" size="icon" onClick={handleSignOut}>
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </aside>

      <main className="flex-1">
        <header className="flex h-16 items-center border-b px-4 md:hidden">
          <Button variant="ghost" size="icon" onClick={toggleSidebar}>
            <Menu className="h-5 w-5" />
          </Button>
          <div className="ml-4 font-bold text-green-800">Malabar Eco Solutions</div>
          <div className="ml-auto">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>
                  {profile?.first_name} {profile?.last_name}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <div className="p-4 md:p-6">{children}</div>
      </main>

      {isSidebarOpen && isMobile && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
          onClick={toggleSidebar}
        />
      )}
    </div>
  );
};

export default Layout;
