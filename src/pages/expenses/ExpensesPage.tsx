
import React, { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, DollarSign, Plus, Edit } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/lib/supabase';
import ExpenseForm from './components/ExpenseForm';

interface Expense {
  id: number;
  category: string;
  amount: number;
  paid_to: string;
  expense_date: string;
  notes?: string;
  location_id?: number;
  location?: {
    name: string;
  };
}

const ExpensesPage = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [openAddExpense, setOpenAddExpense] = useState(false);
  const [currentExpense, setCurrentExpense] = useState<Expense | null>(null);
  const [openEditExpense, setOpenEditExpense] = useState(false);

  const fetchExpenses = async () => {
    setIsLoading(true);
    setIsError(false);
    try {
      const { data, error } = await supabase
        .from('expenses')
        .select(`
          *,
          location:locations(name)
        `)
        .order('expense_date', { ascending: false });
          
      if (error) {
        throw error;
      }
      
      setExpenses(data || []);
    } catch (error) {
      console.error('Error fetching expenses:', error);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const handleExpenseAdded = () => {
    setOpenAddExpense(false);
    fetchExpenses();
  };

  const handleExpenseUpdated = () => {
    setOpenEditExpense(false);
    setCurrentExpense(null);
    fetchExpenses();
  };

  const handleEditExpense = (expense: Expense) => {
    setCurrentExpense(expense);
    setOpenEditExpense(true);
  };

  const handleAddExpenseClick = () => {
    setOpenAddExpense(true);
  };

  const handleAddDialogClose = () => {
    setOpenAddExpense(false);
  };

  const handleEditDialogClose = () => {
    setOpenEditExpense(false);
    setCurrentExpense(null);
  };

  const retryFetch = () => {
    fetchExpenses();
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold tracking-tight">Expense Management</h1>
          <Dialog open={openAddExpense} onOpenChange={setOpenAddExpense}>
            <DialogTrigger asChild>
              <Button onClick={handleAddExpenseClick}>
                <Plus className="mr-2 h-4 w-4" /> Record Expense
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <ExpenseForm 
                onSuccess={handleExpenseAdded} 
                onCancel={handleAddDialogClose} 
              />
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <DollarSign className="mr-2 h-5 w-5" />
              Recent Expenses
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : isError ? (
              <div className="text-center py-8 text-muted-foreground">
                <p className="mb-2">Failed to load expenses.</p>
                <Button variant="outline" onClick={retryFetch}>Retry</Button>
              </div>
            ) : expenses.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No expense records found. Start by recording an expense.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Paid To</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {expenses.map((expense) => (
                      <TableRow key={expense.id}>
                        <TableCell>{new Date(expense.expense_date).toLocaleDateString()}</TableCell>
                        <TableCell className="font-medium capitalize">{expense.category}</TableCell>
                        <TableCell>₹{expense.amount.toLocaleString()}</TableCell>
                        <TableCell>{expense.paid_to}</TableCell>
                        <TableCell>{expense.location?.name || 'N/A'}</TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm" onClick={() => handleEditExpense(expense)}>
                            <Edit className="h-4 w-4 mr-1" /> Edit
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Edit Expense Dialog */}
      <Dialog open={openEditExpense} onOpenChange={handleEditDialogClose}>
        <DialogContent className="sm:max-w-[600px]">
          {currentExpense && (
            <ExpenseForm 
              expense={currentExpense}
              onSuccess={handleExpenseUpdated} 
              onCancel={handleEditDialogClose} 
            />
          )}
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default ExpensesPage;
