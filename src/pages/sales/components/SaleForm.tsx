
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
import { recordSale, getLocations, getInventoryByGodown } from '@/lib/supabase';

interface Location {
  id: number;
  name: string;
  type: string;
}

interface InventoryItem {
  id: number;
  material: string;
  quantity: number;
}

interface SaleFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const PAYMENT_STATUSES = [
  { value: 'paid', label: 'Paid' },
  { value: 'pending', label: 'Pending' },
  { value: 'payment_required', label: 'Payment Required' }
];

const UNITS = ['kg', 'ton', 'pieces', 'bundles', 'liters'];

const SaleForm: React.FC<SaleFormProps> = ({ onSuccess, onCancel }) => {
  const { toast } = useToast();
  const [godownId, setGodownId] = useState<string>('');
  const [godowns, setGodowns] = useState<Location[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [buyerName, setBuyerName] = useState<string>('');
  const [material, setMaterial] = useState<string>('');
  const [quantity, setQuantity] = useState<string>('');
  const [unit, setUnit] = useState<string>('kg');
  const [saleAmount, setSaleAmount] = useState<string>('');
  const [paymentStatus, setPaymentStatus] = useState<string>('paid');
  const [amountDue, setAmountDue] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchGodowns = async () => {
      try {
        const locations = await getLocations('godown');
        setGodowns(locations || []);
        
        if (locations.length > 0) {
          setGodownId(locations[0].id.toString());
        }
      } catch (error) {
        console.error('Error fetching godowns:', error);
      }
    };

    fetchGodowns();
  }, []);

  useEffect(() => {
    const fetchInventory = async () => {
      if (godownId) {
        try {
          const data = await getInventoryByGodown(parseInt(godownId));
          setInventory(data || []);
        } catch (error) {
          console.error('Error fetching inventory:', error);
        }
      }
    };

    fetchInventory();
  }, [godownId]);

  useEffect(() => {
    // Reset amount due if payment status is 'paid'
    if (paymentStatus === 'paid') {
      setAmountDue('0');
    }
  }, [paymentStatus]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!godownId || !buyerName || !material || !quantity || !unit || !saleAmount || !paymentStatus) {
      toast({
        title: 'Missing information',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }
    
    setIsLoading(true);
    try {
      const result = await recordSale(
        parseInt(godownId),
        buyerName,
        material,
        parseFloat(quantity),
        unit,
        parseFloat(saleAmount),
        paymentStatus as 'paid' | 'pending' | 'payment_required',
        paymentStatus !== 'paid' ? parseFloat(amountDue || '0') : 0,
        notes || undefined
      );
      
      if (result.success) {
        toast({
          title: 'Sale recorded',
          description: `Sale to ${buyerName} has been recorded successfully`,
        });
        onSuccess();
      } else {
        throw new Error(result.error || 'Failed to record sale');
      }
    } catch (error) {
      console.error('Error recording sale:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to record sale. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <DialogHeader>
        <DialogTitle>Record New Sale</DialogTitle>
        <DialogDescription>
          Enter the sale details to record it in the system.
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="godown" className="text-right">
            Godown*
          </Label>
          <Select
            value={godownId}
            onValueChange={setGodownId}
            required
          >
            <SelectTrigger id="godown" className="col-span-3">
              <SelectValue placeholder="Select godown" />
            </SelectTrigger>
            <SelectContent>
              {godowns.map((godown) => (
                <SelectItem key={godown.id} value={godown.id.toString()}>
                  {godown.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="buyer-name" className="text-right">
            Buyer Name*
          </Label>
          <Input
            id="buyer-name"
            value={buyerName}
            onChange={(e) => setBuyerName(e.target.value)}
            placeholder="Enter buyer name"
            className="col-span-3"
            required
          />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="material" className="text-right">
            Material*
          </Label>
          <Select
            value={material}
            onValueChange={setMaterial}
            required
          >
            <SelectTrigger id="material" className="col-span-3">
              <SelectValue placeholder="Select material" />
            </SelectTrigger>
            <SelectContent>
              {inventory.map((item) => (
                <SelectItem key={item.id} value={item.material}>
                  {item.material} (Available: {item.quantity})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="quantity" className="text-right">
            Quantity*
          </Label>
          <Input
            id="quantity"
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="Enter quantity"
            className="col-span-3"
            min="0.01"
            step="0.01"
            required
          />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="unit" className="text-right">
            Unit*
          </Label>
          <Select
            value={unit}
            onValueChange={setUnit}
            required
          >
            <SelectTrigger id="unit" className="col-span-3">
              <SelectValue placeholder="Select unit" />
            </SelectTrigger>
            <SelectContent>
              {UNITS.map((u) => (
                <SelectItem key={u} value={u}>
                  {u}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="sale-amount" className="text-right">
            Sale Amount (₹)*
          </Label>
          <Input
            id="sale-amount"
            type="number"
            value={saleAmount}
            onChange={(e) => setSaleAmount(e.target.value)}
            placeholder="Enter total sale amount"
            className="col-span-3"
            min="0"
            step="0.01"
            required
          />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="payment-status" className="text-right">
            Payment Status*
          </Label>
          <Select
            value={paymentStatus}
            onValueChange={setPaymentStatus}
            required
          >
            <SelectTrigger id="payment-status" className="col-span-3">
              <SelectValue placeholder="Select payment status" />
            </SelectTrigger>
            <SelectContent>
              {PAYMENT_STATUSES.map((status) => (
                <SelectItem key={status.value} value={status.value}>
                  {status.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {paymentStatus !== 'paid' && (
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="amount-due" className="text-right">
              Amount Due (₹)
            </Label>
            <Input
              id="amount-due"
              type="number"
              value={amountDue}
              onChange={(e) => setAmountDue(e.target.value)}
              placeholder="Enter amount due"
              className="col-span-3"
              min="0"
              step="0.01"
              required={paymentStatus !== 'paid'}
            />
          </div>
        )}
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
          {isLoading ? 'Recording...' : 'Record Sale'}
        </Button>
      </DialogFooter>
    </form>
  );
};

export default SaleForm;
