
import React, { useState, useEffect } from 'react';
import { format, subDays, startOfMonth, endOfMonth, parseISO } from 'date-fns';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Loader2, BarChart, CircleDollarSign, Calendar as CalendarIcon, Filter, Download } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface SummaryData {
  totalSales: number;
  totalExpenses: number;
  totalCollections: number;
  pendingPayments: number;
}

interface ReportData {
  sales: any[];
  expenses: any[];
  collections: any[];
}

const ReportsPage = () => {
  const [activeTab, setActiveTab] = useState('sales');
  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month' | 'custom'>('today');
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [isLoading, setIsLoading] = useState(false);
  const [summaryData, setSummaryData] = useState<SummaryData>({
    totalSales: 0,
    totalExpenses: 0,
    totalCollections: 0,
    pendingPayments: 0
  });
  const [reportData, setReportData] = useState<ReportData>({
    sales: [],
    expenses: [],
    collections: []
  });
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  
  // Set date range based on selection
  useEffect(() => {
    const today = new Date();
    
    switch (dateRange) {
      case 'today':
        setStartDate(today);
        setEndDate(today);
        break;
      case 'week':
        setStartDate(subDays(today, 7));
        setEndDate(today);
        break;
      case 'month':
        setStartDate(startOfMonth(today));
        setEndDate(endOfMonth(today));
        break;
      // For custom, we don't update dates here
      default:
        break;
    }
  }, [dateRange]);
  
  // Fetch report data when dates change
  useEffect(() => {
    fetchReportData();
  }, [startDate, endDate, activeTab]);
  
  const fetchReportData = async () => {
    setIsLoading(true);
    
    try {
      // Format dates for Supabase queries
      const startDateStr = format(startDate, 'yyyy-MM-dd');
      const endDateStr = format(endDate, 'yyyy-MM-dd');
      const endOfDayStr = `${endDateStr}T23:59:59`;
      
      // Fetch sales data
      const { data: salesData } = await supabase
        .from('sales')
        .select(`
          *,
          godown:locations(name)
        `)
        .gte('sale_date', `${startDateStr}T00:00:00`)
        .lte('sale_date', endOfDayStr);
      
      // Fetch expenses data
      const { data: expensesData } = await supabase
        .from('expenses')
        .select(`
          *,
          location:locations(name)
        `)
        .gte('expense_date', `${startDateStr}T00:00:00`)
        .lte('expense_date', endOfDayStr);
      
      // Fetch collections data
      const { data: collectionsData } = await supabase
        .from('collections')
        .select(`
          *,
          location:locations(name)
        `)
        .gte('collection_date', `${startDateStr}T00:00:00`)
        .lte('collection_date', endOfDayStr);
      
      // Calculate summary data
      const totalSales = salesData?.reduce((sum, sale) => sum + (sale.sale_amount || 0), 0) || 0;
      const totalExpenses = expensesData?.reduce((sum, expense) => sum + (expense.amount || 0), 0) || 0;
      const totalCollections = collectionsData?.reduce((sum, collection) => sum + (collection.amount_paid || 0), 0) || 0;
      const pendingPayments = salesData?.reduce((sum, sale) => 
        sum + (sale.payment_status !== 'paid' ? (sale.amount_due || 0) : 0), 0) || 0;
      
      setSummaryData({
        totalSales,
        totalExpenses,
        totalCollections,
        pendingPayments
      });
      
      setReportData({
        sales: salesData || [],
        expenses: expensesData || [],
        collections: collectionsData || []
      });
    } catch (error) {
      console.error('Error fetching report data:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;
    
    if (!startDate || (startDate && endDate)) {
      // If no start date is selected or both dates are already selected, set start date
      setStartDate(date);
      setEndDate(date);
    } else {
      // If start date is already selected, set end date
      if (date < startDate) {
        setStartDate(date);
      } else {
        setEndDate(date);
      }
    }
  };
  
  const handleExportCSV = () => {
    let data = [];
    let filename = '';
    
    switch (activeTab) {
      case 'sales':
        data = reportData.sales;
        filename = `sales-report-${format(startDate, 'yyyy-MM-dd')}-to-${format(endDate, 'yyyy-MM-dd')}`;
        break;
      case 'expenses':
        data = reportData.expenses;
        filename = `expenses-report-${format(startDate, 'yyyy-MM-dd')}-to-${format(endDate, 'yyyy-MM-dd')}`;
        break;
      case 'collections':
        data = reportData.collections;
        filename = `collections-report-${format(startDate, 'yyyy-MM-dd')}-to-${format(endDate, 'yyyy-MM-dd')}`;
        break;
    }
    
    if (data.length === 0) return;
    
    // Convert data to CSV
    const replacer = (key: string, value: any) => value === null ? '' : value;
    const header = Object.keys(data[0]);
    const csv = [
      header.join(','),
      ...data.map(row => header.map(fieldName => JSON.stringify(row[fieldName], replacer)).join(','))
    ].join('\r\n');
    
    // Download the CSV file
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', `${filename}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };
  
  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold tracking-tight">Reports & Analytics</h1>
          <Button onClick={handleExportCSV} disabled={
            (activeTab === 'sales' && reportData.sales.length === 0) ||
            (activeTab === 'expenses' && reportData.expenses.length === 0) ||
            (activeTab === 'collections' && reportData.collections.length === 0)
          }>
            <Download className="mr-2 h-4 w-4" /> Export CSV
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Sales</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <CircleDollarSign className="h-5 w-5 mr-2 text-green-500" />
                <span className="text-2xl font-bold">₹{summaryData.totalSales.toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Expenses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <CircleDollarSign className="h-5 w-5 mr-2 text-red-500" />
                <span className="text-2xl font-bold">₹{summaryData.totalExpenses.toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Collections</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <CircleDollarSign className="h-5 w-5 mr-2 text-blue-500" />
                <span className="text-2xl font-bold">₹{summaryData.totalCollections.toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending Payments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <CircleDollarSign className="h-5 w-5 mr-2 text-yellow-500" />
                <span className="text-2xl font-bold">₹{summaryData.pendingPayments.toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="flex flex-col md:flex-row justify-between gap-4 md:items-center">
          <div className="flex gap-2">
            <Select value={dateRange} onValueChange={(value) => setDateRange(value as any)}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Select date range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">Last 7 days</SelectItem>
                <SelectItem value="month">This month</SelectItem>
                <SelectItem value="custom">Custom range</SelectItem>
              </SelectContent>
            </Select>
            
            {dateRange === 'custom' && (
              <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="min-w-[240px] justify-start text-left">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(startDate, 'MMM dd, yyyy')} - {format(endDate, 'MMM dd, yyyy')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="range"
                    selected={{
                      from: startDate,
                      to: endDate,
                    }}
                    onSelect={(range) => {
                      if (range?.from) setStartDate(range.from);
                      if (range?.to) setEndDate(range.to);
                      setDatePickerOpen(false);
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            )}
          </div>
          
          <div>
            <Label className="mr-2">
              Date range: {format(startDate, 'MMM dd, yyyy')} - {format(endDate, 'MMM dd, yyyy')}
            </Label>
          </div>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="sales">Sales</TabsTrigger>
            <TabsTrigger value="expenses">Expenses</TabsTrigger>
            <TabsTrigger value="collections">Collections</TabsTrigger>
          </TabsList>
          
          <TabsContent value="sales" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart className="mr-2 h-5 w-5" />
                  Sales Report
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : reportData.sales.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No sales data found for the selected date range.
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Buyer</TableHead>
                        <TableHead>Material</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Due Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reportData.sales.map((sale) => (
                        <TableRow key={sale.id}>
                          <TableCell>{format(parseISO(sale.sale_date), 'MMM dd, yyyy')}</TableCell>
                          <TableCell>{sale.buyer_name}</TableCell>
                          <TableCell className="capitalize">{sale.material}</TableCell>
                          <TableCell>{sale.quantity} {sale.unit}</TableCell>
                          <TableCell>₹{sale.sale_amount.toLocaleString()}</TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              sale.payment_status === 'paid' 
                                ? 'bg-green-100 text-green-800' 
                                : sale.payment_status === 'pending'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-red-100 text-red-800'
                            }`}>
                              {sale.payment_status.replace('_', ' ')}
                            </span>
                          </TableCell>
                          <TableCell>
                            {sale.payment_status !== 'paid' ? `₹${sale.amount_due.toLocaleString()}` : '-'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="expenses" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart className="mr-2 h-5 w-5" />
                  Expenses Report
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : reportData.expenses.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No expenses data found for the selected date range.
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Paid To</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Notes</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reportData.expenses.map((expense) => (
                        <TableRow key={expense.id}>
                          <TableCell>{format(parseISO(expense.expense_date), 'MMM dd, yyyy')}</TableCell>
                          <TableCell className="capitalize">{expense.category}</TableCell>
                          <TableCell>₹{expense.amount.toLocaleString()}</TableCell>
                          <TableCell>{expense.paid_to}</TableCell>
                          <TableCell>{expense.location?.name || 'N/A'}</TableCell>
                          <TableCell>{expense.notes || 'N/A'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="collections" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart className="mr-2 h-5 w-5" />
                  Collections Report
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : reportData.collections.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No collections data found for the selected date range.
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Material</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Amount Paid</TableHead>
                        <TableHead>Commission</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reportData.collections.map((collection) => (
                        <TableRow key={collection.id}>
                          <TableCell>{format(parseISO(collection.collection_date), 'MMM dd, yyyy')}</TableCell>
                          <TableCell>{collection.location?.name || 'N/A'}</TableCell>
                          <TableCell className="capitalize">{collection.material}</TableCell>
                          <TableCell>{collection.quantity} {collection.unit}</TableCell>
                          <TableCell>₹{collection.amount_paid.toLocaleString()}</TableCell>
                          <TableCell>
                            {collection.commission_agent ? 
                              `₹${collection.commission_amount || 0} (${collection.commission_agent})` : 
                              'N/A'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default ReportsPage;
