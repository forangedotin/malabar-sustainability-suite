
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  MapPin,
  PackageOpen,
  Truck,
  ShoppingCart,
  ArrowRightLeft,
  BarChart3,
  Settings,
  Users,
  LogOut,
  LifeBuoy
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { signOut } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

export function Sidebar() {
  const { role } = useAuth();
  const location = useLocation();
  
  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };
  
  const handleSignOut = async () => {
    await signOut();
  };
  
  return (
    <div className="h-full flex flex-col border-r bg-card">
      {/* Logo */}
      <div className="p-6">
        <Logo />
      </div>
      
      {/* Nav links */}
      <nav className="flex-1 px-4 pb-4 space-y-1 overflow-y-auto">
        <NavItem icon={LayoutDashboard} href="/" title="Dashboard" active={isActive('/')} />
        
        {/* Locations */}
        <NavItem 
          icon={MapPin} 
          href="/locations" 
          title="Locations" 
          active={isActive('/locations')} 
        />
        
        {/* Collections */}
        <NavItem 
          icon={PackageOpen} 
          href="/collections" 
          title="Collections" 
          active={isActive('/collections')} 
        />
        
        {/* Inventory */}
        <NavItem 
          icon={Truck} 
          href="/inventory" 
          title="Inventory" 
          active={isActive('/inventory')} 
        />
        
        {/* Stock Transfers */}
        <NavItem 
          icon={ArrowRightLeft} 
          href="/transfers" 
          title="Stock Transfers" 
          active={isActive('/transfers')} 
        />
        
        {/* Sales */}
        <NavItem 
          icon={ShoppingCart} 
          href="/sales" 
          title="Sales" 
          active={isActive('/sales')} 
        />
        
        {/* Reports */}
        <NavItem 
          icon={BarChart3} 
          href="/reports" 
          title="Reports" 
          active={isActive('/reports')} 
        />
        
        {/* Admin only sections */}
        {role === 'admin' && (
          <>
            <div className="pt-4 mt-4 border-t">
              <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Administration
              </h3>
            </div>
            
            <NavItem 
              icon={Users} 
              href="/managers" 
              title="Managers" 
              active={isActive('/managers')} 
            />
            
            <NavItem 
              icon={Settings} 
              href="/settings" 
              title="Settings" 
              active={isActive('/settings')} 
            />
          </>
        )}
      </nav>
      
      {/* Bottom links */}
      <div className="border-t p-4">
        <div className="space-y-2">
          <NavItem 
            icon={LifeBuoy} 
            href="/help" 
            title="Help & Support" 
            active={isActive('/help')} 
          />
          
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full justify-start"
            onClick={handleSignOut}
          >
            <LogOut className="mr-2 h-4 w-4" />
            <span>Sign out</span>
          </Button>
        </div>
      </div>
    </div>
  );
}

function Logo() {
  return (
    <Link to="/" className="flex items-center space-x-2">
      <div className="h-10 w-10 bg-gradient-to-br from-eco-green-500 to-eco-blue-600 rounded-md flex items-center justify-center text-white font-bold text-lg">
        ME
      </div>
      <div>
        <h1 className="text-lg font-semibold">Malabar Eco</h1>
        <p className="text-xs text-muted-foreground">Waste Management</p>
      </div>
    </Link>
  );
}

interface NavItemProps {
  icon: React.ElementType;
  href: string;
  title: string;
  active: boolean;
}

function NavItem({ icon: Icon, href, title, active }: NavItemProps) {
  return (
    <Link
      to={href}
      className={cn(
        "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
        active 
          ? "bg-primary/10 text-primary" 
          : "text-muted-foreground hover:text-foreground hover:bg-muted"
      )}
    >
      <Icon className={cn("mr-3 h-5 w-5", active ? "text-primary" : "")} />
      <span>{title}</span>
    </Link>
  );
}
