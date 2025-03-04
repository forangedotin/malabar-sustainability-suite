
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/auth';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Truck,
  Package,
  TrendingUp,
  DollarSign,
  Loader2,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { format } from 'date-fns';
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

interface Stats {
  totalCollections: number;
  todayCollections: number;
  totalSales: number;
  totalExpenses: number;
  inventoryValue: number;
  recentSales: Array<{
    id: number;
    buyer_name: string;
    material: string;
    quantity: number;
    sale_amount: number;
    sale_date: string;
  }>;
  collectionTrend: Array<{
    date: string;
    amount: number;
  }>;
  materialDistribution: Array<{
    material: string;
    quantity: number;
  }>;
}

const Dashboard = () => {
  const { profile } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);
      try {
        // Today's date range
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999);

        // Fetch total collections
        const { count: totalCollections } = await supabase
          .from('collections')
          .select('*', { count: 'exact', head: true });

        // Fetch today's collections
        const { count: todayCollections } = await supabase
          .from('collections')
          .select('*', { count: 'exact', head: true })
          .gte('collection_date', today.toISOString())
          .lte('collection_date', todayEnd.toISOString());

        // Fetch total sales
        const { data: salesData } = await supabase
          .from('sales')
          .select('sale_amount');
        const totalSales = salesData?.reduce((sum, item) => sum + Number(item.sale_amount), 0) || 0;

        // Fetch total expenses
        const { data: expensesData } = await supabase
          .from('expenses')
          .select('amount');
        const totalExpenses = expensesData?.reduce((sum, item) => sum + Number(item.amount), 0) || 0;

        // Fetch inventory value (simplified calculation)
        const { data: inventoryData } = await supabase
          .from('inventory')
          .select('*');
        const inventoryValue = inventoryData?.reduce((sum, item) => sum + Number(item.quantity), 0) || 0;

        // Fetch recent sales
        const { data: recentSales = [] } = await supabase
          .from('sales')
          .select('id, buyer_name, material, quantity, sale_amount, sale_date')
          .order('sale_date', { ascending: false })
          .limit(5);

        // Generate collection trend (last 7 days)
        const collectionTrend = [];
        const materialMap = new Map();

        for (let i = 6; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          const startDate = new Date(date);
          startDate.setHours(0, 0, 0, 0);
          
          const endDate = new Date(date);
          endDate.setHours(23, 59, 59, 999);
          
          const { data: dayCollections } = await supabase
            .from('collections')
            .select('material, amount_paid')
            .gte('collection_date', startDate.toISOString())
            .lte('collection_date', endDate.toISOString());
            
          const dayAmount = dayCollections?.reduce((sum, item) => {
            // Accumulate material quantities for distribution chart
            const material = item.material;
            materialMap.set(material, (materialMap.get(material) || 0) + 1);
            
            return sum + Number(item.amount_paid);
          }, 0) || 0;
          
          collectionTrend.push({
            date: format(date, 'dd/MM'),
            amount: dayAmount
          });
        }

        // Convert material map to array
        const materialDistribution = Array.from(materialMap.entries()).map(([material, quantity]) => ({
          material,
          quantity
        }));

        setStats({
          totalCollections: totalCollections || 0,
          todayCollections: todayCollections || 0,
          totalSales,
          totalExpenses,
          inventoryValue,
          recentSales,
          collectionTrend,
          materialDistribution
        });
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <Layout>
        <div className="flex h-[calc(100vh-8rem)] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Welcome, {profile?.first_name || 'User'}
          </h1>
          <p className="text-muted-foreground">
            Here's an overview of Malabar Eco Solutions' operations
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Collections</CardTitle>
              <Truck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalCollections}</div>
              <p className="text-xs text-muted-foreground">
                +{stats?.todayCollections} today
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Inventory Value</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{stats?.inventoryValue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Estimated value
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{stats?.totalSales.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                From all recorded sales
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{stats?.totalExpenses.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                All recorded expenses
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Collection Trend</CardTitle>
              <CardDescription>
                Daily collection amounts for the past week
              </CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats?.collectionTrend}>
                  <XAxis
                    dataKey="date"
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `₹${value}`}
                  />
                  <Tooltip formatter={(value: number) => [`₹${value}`, 'Amount']} />
                  <Bar 
                    dataKey="amount" 
                    fill="hsl(142 72% 29%)" 
                    radius={[4, 4, 0, 0]} 
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Recent Sales</CardTitle>
              <CardDescription>
                Latest sales transactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats?.recentSales.length ? (
                  stats.recentSales.map((sale) => (
                    <div key={sale.id} className="flex items-center">
                      <div className="ml-4 space-y-1">
                        <p className="text-sm font-medium leading-none">{sale.buyer_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {sale.quantity} units of {sale.material}
                        </p>
                      </div>
                      <div className="ml-auto font-medium">₹{sale.sale_amount.toLocaleString()}</div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No recent sales</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
