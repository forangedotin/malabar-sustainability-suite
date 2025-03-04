
import { useState, useEffect } from 'react';
import { 
  BarChart, 
  PackageOpen, 
  ShoppingCart, 
  Truck, 
  TrendingUp,
  Calendar,
  BarChart3,
  TrendingDown
} from 'lucide-react';
import { StatsCard } from '@/components/StatsCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EmptyState } from '@/components/EmptyState';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

export default function Dashboard() {
  const { user, role } = useAuth();
  const [greeting, setGreeting] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Set greeting based on time of day
  useEffect(() => {
    const hour = new Date().getHours();
    
    if (hour < 12) {
      setGreeting('Good morning');
    } else if (hour < 18) {
      setGreeting('Good afternoon');
    } else {
      setGreeting('Good evening');
    }
    
    // Simulate loading data
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  // For demo purposes we'll show some sample data
  const demoData = {
    todayCollections: 15,
    todayWeight: '423 kg',
    todayRevenue: '₹ 8,250',
    stock: '1,245 kg',
    pendingSales: 8,
    pendingPayments: '₹ 14,500'
  };
  
  return (
    <div className="animate-fade-in">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">{greeting}</h1>
        <p className="text-muted-foreground mt-1">
          Here's what's happening with your operations today
        </p>
      </header>
      
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="collection">Collection</TabsTrigger>
          <TabsTrigger value="sales">Sales</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <StatsCard
              title="Today's Collections"
              value={demoData.todayCollections}
              icon={<PackageOpen className="h-5 w-5" />}
              description="Total collection entries today"
              trend={{
                value: 12,
                direction: "up",
                label: "from yesterday"
              }}
            />
            
            <StatsCard
              title="Collected Weight"
              value={demoData.todayWeight}
              icon={<TrendingUp className="h-5 w-5" />}
              description="Total weight collected today"
              trend={{
                value: 8,
                direction: "up",
                label: "from yesterday"
              }}
            />
            
            <StatsCard
              title="Current Stock"
              value={demoData.stock}
              icon={<Truck className="h-5 w-5" />}
              description="Total inventory across all godowns"
              trend={{
                value: 5,
                direction: "up",
                label: "from last week"
              }}
            />
          </div>
          
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium">Recent Activity</CardTitle>
                <CardDescription>
                  Your team's latest actions
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-3">
                    {[...Array(4)].map((_, i) => (
                      <ActivitySkeleton key={i} />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <ActivityItem
                      icon={<PackageOpen className="h-4 w-4" />}
                      title="New Collection Recorded"
                      description="Plastic - PET (45kg) at Kozhikode Central"
                      time="10 minutes ago"
                    />
                    <ActivityItem
                      icon={<ShoppingCart className="h-4 w-4" />}
                      title="Sale Completed"
                      description="Paper - Cardboard (230kg) to Kerala Recyclers Ltd"
                      time="1 hour ago"
                    />
                    <ActivityItem
                      icon={<Truck className="h-4 w-4" />}
                      title="Stock Transferred"
                      description="Metal - Mixed (120kg) from Malappuram to Thrissur"
                      time="3 hours ago"
                    />
                    <ActivityItem
                      icon={<TrendingDown className="h-4 w-4" />}
                      title="Expense Recorded"
                      description="Vehicle Fuel (₹ 2,500) by Anish K"
                      time="Yesterday"
                    />
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium">Quick Actions</CardTitle>
                <CardDescription>
                  Common tasks you can perform
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <QuickAction
                    icon={<PackageOpen className="h-5 w-5" />}
                    title="Record Collection"
                    href="/collections/new"
                  />
                  <QuickAction
                    icon={<ShoppingCart className="h-5 w-5" />}
                    title="Record Sale"
                    href="/sales/new"
                  />
                  <QuickAction
                    icon={<Calendar className="h-5 w-5" />}
                    title="View Schedule"
                    href="/schedule"
                  />
                  <QuickAction
                    icon={<BarChart3 className="h-5 w-5" />}
                    title="View Reports"
                    href="/reports"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="collection" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <StatsCard
              title="Today's Collections"
              value={demoData.todayCollections}
              icon={<PackageOpen className="h-5 w-5" />}
              description="Total collection entries today"
            />
            
            <StatsCard
              title="Total Weight"
              value={demoData.todayWeight}
              icon={<TrendingUp className="h-5 w-5" />}
              description="Total weight collected today"
            />
            
            <StatsCard
              title="Amount Paid"
              value={demoData.todayRevenue}
              icon={<BarChart className="h-5 w-5" />}
              description="Total amount paid for collections"
            />
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Recent Collections</CardTitle>
              <CardDescription>
                The most recent waste collections recorded by your team
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <CollectionSkeleton key={i} />
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  <EmptyState
                    icon={<PackageOpen className="h-5 w-5 text-muted-foreground" />}
                    title="No recent collections"
                    description="Collections will appear here once they are recorded. Add your first collection to get started."
                    action={{
                      label: "Record Collection",
                      onClick: () => {
                        /* navigate to collection page */
                      },
                    }}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="sales" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <StatsCard
              title="Pending Sales"
              value={demoData.pendingSales}
              icon={<ShoppingCart className="h-5 w-5" />}
              description="Sales with pending payments"
            />
            
            <StatsCard
              title="Pending Amount"
              value={demoData.pendingPayments}
              icon={<TrendingDown className="h-5 w-5" />}
              description="Total pending payments"
            />
            
            <StatsCard
              title="This Month"
              value="₹ 145,250"
              icon={<BarChart className="h-5 w-5" />}
              description="Total sales value this month"
              trend={{
                value: 12,
                direction: "up",
                label: "from last month"
              }}
            />
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Recent Sales</CardTitle>
              <CardDescription>
                The most recent sales recorded by your team
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <SaleSkeleton key={i} />
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  <EmptyState
                    icon={<ShoppingCart className="h-5 w-5 text-muted-foreground" />}
                    title="No recent sales"
                    description="Sales will appear here once they are recorded. Add your first sale to get started."
                    action={{
                      label: "Record Sale",
                      onClick: () => {
                        /* navigate to sales page */
                      },
                    }}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface ActivityItemProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  time: string;
}

function ActivityItem({ icon, title, description, time }: ActivityItemProps) {
  return (
    <div className="flex items-start space-x-3">
      <div className="rounded-full bg-primary/10 p-2 mt-0.5">
        <div className="text-primary">{icon}</div>
      </div>
      <div className="flex-1 space-y-1">
        <p className="text-sm font-medium leading-none">{title}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
        <p className="text-xs text-muted-foreground">{time}</p>
      </div>
    </div>
  );
}

function ActivitySkeleton() {
  return (
    <div className="flex items-start space-x-3 animate-pulse">
      <div className="rounded-full bg-muted h-8 w-8" />
      <div className="flex-1 space-y-2">
        <div className="h-3 bg-muted rounded w-1/3" />
        <div className="h-2 bg-muted rounded w-3/4" />
        <div className="h-2 bg-muted rounded w-1/4" />
      </div>
    </div>
  );
}

function CollectionSkeleton() {
  return (
    <div className="rounded-lg border p-4 animate-pulse">
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <div className="h-4 bg-muted rounded w-32" />
          <div className="h-3 bg-muted rounded w-24" />
        </div>
        <div className="h-10 w-16 bg-muted rounded" />
      </div>
      <div className="mt-4 space-y-2">
        <div className="h-3 bg-muted rounded w-full" />
        <div className="h-3 bg-muted rounded w-4/5" />
      </div>
    </div>
  );
}

function SaleSkeleton() {
  return (
    <div className="rounded-lg border p-4 animate-pulse">
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <div className="h-4 bg-muted rounded w-40" />
          <div className="h-3 bg-muted rounded w-28" />
        </div>
        <div className="h-10 w-24 bg-muted rounded" />
      </div>
      <div className="mt-4 space-y-2">
        <div className="h-3 bg-muted rounded w-full" />
        <div className="h-3 bg-muted rounded w-4/5" />
      </div>
    </div>
  );
}

interface QuickActionProps {
  icon: React.ReactNode;
  title: string;
  href: string;
}

function QuickAction({ icon, title, href }: QuickActionProps) {
  return (
    <a
      href={href}
      className={cn(
        "group flex flex-col items-center justify-center rounded-lg border bg-card p-4 transition-colors",
        "hover:border-primary/20 hover:bg-primary/5"
      )}
    >
      <div className="mb-2 rounded-full bg-primary/10 p-2.5 group-hover:bg-primary/20">
        <div className="text-primary">{icon}</div>
      </div>
      <div className="text-sm font-medium">{title}</div>
    </a>
  );
}
