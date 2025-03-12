
import React, { useState, useEffect } from 'react';
import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { recordExpense, getLocations, updateExpense } from '@/lib/supabase';

interface Location {
  id: number;
  name: string;
  type: string;
}

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

interface ExpenseFormProps {
  expense?: Expense;
  onSuccess: () => void;
  onCancel: () => void;
}

const EXPENSE_CATEGORIES = [
  'fuel',
  'maintenance',
  'repairs',
  'salary',
  'rent',
  'utilities',
  'supplies',
  'food',
  'transportation',
  'other'
];

const ExpenseForm: React.FC<ExpenseFormProps> = ({ expense, onSuccess, onCancel }) => {
  const { toast } = useToast();
  const [category, setCategory] = useState<string>(expense?.category || '');
  const [amount, setAmount] = useState<string>(expense ? expense.amount.toString() : '');
  const [paidTo, setPaidTo] = useState<string>(expense?.paid_to || '');
  const [locationId, setLocationId] = useState<string>(expense?.location_id?.toString() || '');
  const [notes, setNotes] = useState<string>(expense?.notes || '');
  const [locations, setLocations] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const isEditing = Boolean(expense);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const locationsData = await getLocations();
        setLocations(locationsData || []);
      } catch (error) {
        console.error('Error fetching locations:', error);
        toast({
          title: 'Error',
          description: 'Failed to load locations. Please try again.',
          variant: 'destructive'
        });
      }
    };

    fetchLocations();
  }, [toast]);

  // Effect to update form when expense prop changes
  useEffect(() => {
    if (expense) {
      setCategory(expense.category || '');
      setAmount(expense.amount?.toString() || '');
      setPaidTo(expense.paid_to || '');
      setLocationId(expense.location_id?.toString() || '');
      setNotes(expense.notes || '');
    }
  }, [expense]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!category || !amount || !paidTo) {
      toast({
        title: 'Missing information',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }
    
    setIsLoading(true);
    try {
      const parsedAmount = parseFloat(amount);
      if (isNaN(parsedAmount)) {
        throw new Error('Invalid amount value');
      }
      
      let result;
      const parsedLocationId = locationId ? parseInt(locationId) : undefined;
      
      if (isEditing && expense) {
        // Update existing expense
        result = await updateExpense(
          expense.id,
          category,
          parsedAmount,
          paidTo,
          parsedLocationId,
          notes || undefined
        );
      } else {
        // Create new expense
        result = await recordExpense(
          category,
          parsedAmount,
          paidTo,
          parsedLocationId,
          notes || undefined
        );
      }
      
      if (result.success) {
        toast({
          title: isEditing ? 'Expense updated' : 'Expense recorded',
          description: isEditing 
            ? `Expense of ₹${parsedAmount} has been updated successfully` 
            : `Expense of ₹${parsedAmount} has been recorded successfully`,
        });
        onSuccess();
      } else {
        throw new Error(typeof result.error === 'object' && result.error !== null && 'message' in result.error 
          ? result.error.message 
          : 'Failed to process expense');
      }
    } catch (error) {
      console.error('Error with expense:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to process expense. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-h-[80vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>{isEditing ? 'Edit Expense' : 'Record New Expense'}</DialogTitle>
        <DialogDescription>
          {isEditing ? 'Update the expense details.' : 'Enter the expense details to record it in the system.'}
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="category" className="text-right">
            Category*
          </Label>
          <Select
            value={category}
            onValueChange={setCategory}
            required
          >
            <SelectTrigger id="category" className="col-span-3">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {EXPENSE_CATEGORIES.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="amount" className="text-right">
            Amount (₹)*
          </Label>
          <Input
            id="amount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter expense amount"
            className="col-span-3"
            min="0"
            step="0.01"
            required
          />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="paid-to" className="text-right">
            Paid To*
          </Label>
          <Input
            id="paid-to"
            value={paidTo}
            onChange={(e) => setPaidTo(e.target.value)}
            placeholder="Enter recipient name"
            className="col-span-3"
            required
          />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="location" className="text-right">
            Location
          </Label>
          <Select
            value={locationId}
            onValueChange={setLocationId}
          >
            <SelectTrigger id="location" className="col-span-3">
              <SelectValue placeholder="Select location (optional)" />
            </SelectTrigger>
            <SelectContent>
              {locations.map((location) => (
                <SelectItem key={location.id} value={location.id.toString()}>
                  {location.name} ({location.type === 'godown' ? 'Godown' : 'Collection Point'})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="notes" className="text-right">
            Notes
          </Label>
          <Textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Additional notes (optional)"
            className="col-span-3"
            rows={3}
          />
        </div>
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (isEditing ? 'Updating...' : 'Recording...') : (isEditing ? 'Update Expense' : 'Record Expense')}
        </Button>
      </DialogFooter>
    </form>
  );
};

export default ExpenseForm;
