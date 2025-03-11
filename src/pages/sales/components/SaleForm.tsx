
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
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

type MaterialType = 'mixed_plastic' | 'paper' | 'cardboard' | 'metal' | 'glass' | 'organic' | 'electronic' | 'other';
type PaymentStatus = 'paid' | 'pending' | 'payment_required';

const materialTypes: MaterialType[] = [
  'mixed_plastic',
  'paper',
  'cardboard',
  'metal',
  'glass',
  'organic',
  'electronic',
  'other'
];

interface SaleFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const SaleForm: React.FC<SaleFormProps> = ({ onSuccess, onCancel }) => {
  const { toast } = useToast();
  const [godowns, setGodowns] = useState<any[]>([]);
  const [selectedGodownId, setSelectedGodownId] = useState<string>('');
  const [buyerName, setBuyerName] = useState<string>('');
  const [material, setMaterial] = useState<MaterialType>('mixed_plastic');
  const [quantity, setQuantity] = useState<string>('');
  const [unit, setUnit] = useState<string>('kg');
  const [saleAmount, setSaleAmount] = useState<string>('');
  const [saleDate, setSaleDate] = useState<Date>(new Date());
  const [notes, setNotes] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLoadingGodowns, setIsLoadingGodowns] = useState<boolean>(true);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('paid');
  const [amountPaid, setAmountPaid] = useState<string>('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch godowns on component mount
  useEffect(() => {
    const fetchGodowns = async () => {
      setIsLoadingGodowns(true);
      try {
        const { data, error } = await supabase
          .from('locations')
          .select('*')
          .eq('type', 'godown');
          
        if (error) throw error;
        
        setGodowns(data || []);
        if (data && data.length > 0) {
          setSelectedGodownId(data[0].id.toString());
        }
      } catch (error) {
        console.error('Error fetching godowns:', error);
        toast({
          title: 'Error',
          description: 'Failed to load godowns. Please try again.',
          variant: 'destructive'
        });
      } finally {
        setIsLoadingGodowns(false);
      }
    };

    fetchGodowns();
  }, [toast]);

  // Calculate due amount based on total and amount paid
  const calculateDueAmount = () => {
    const total = parseFloat(saleAmount) || 0;
    const paid = parseFloat(amountPaid) || 0;
    return Math.max(0, total - paid).toFixed(2);
  };

  // Update amount paid when total changes or payment status changes
  useEffect(() => {
    if (paymentStatus === 'paid') {
      setAmountPaid(saleAmount);
    } else if (paymentStatus === 'payment_required') {
      setAmountPaid('0');
    }
  }, [paymentStatus, saleAmount]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!selectedGodownId) newErrors.godown = 'Godown is required';
    if (!buyerName.trim()) newErrors.buyerName = 'Buyer name is required';
    if (!material) newErrors.material = 'Material is required';
    
    if (!quantity.trim()) {
      newErrors.quantity = 'Quantity is required';
    } else if (isNaN(parseFloat(quantity)) || parseFloat(quantity) <= 0) {
      newErrors.quantity = 'Quantity must be a positive number';
    }
    
    if (!unit.trim()) newErrors.unit = 'Unit is required';
    
    if (!saleAmount.trim()) {
      newErrors.saleAmount = 'Sale amount is required';
    } else if (isNaN(parseFloat(saleAmount)) || parseFloat(saleAmount) <= 0) {
      newErrors.saleAmount = 'Sale amount must be a positive number';
    }
    
    if (paymentStatus !== 'paid' && paymentStatus !== 'payment_required') {
      if (!amountPaid.trim()) {
        newErrors.amountPaid = 'Amount paid is required';
      } else if (isNaN(parseFloat(amountPaid))) {
        newErrors.amountPaid = 'Amount paid must be a number';
      } else if (parseFloat(amountPaid) < 0) {
        newErrors.amountPaid = 'Amount paid cannot be negative';
      } else if (parseFloat(amountPaid) > parseFloat(saleAmount)) {
        newErrors.amountPaid = 'Amount paid cannot exceed total amount';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);

    const totalAmount = parseFloat(saleAmount);
    let paidAmount = 0;
    let dueAmount = 0;
    let status: PaymentStatus = 'paid';
    
    // Set payment details based on payment status
    if (paymentStatus === 'paid') {
      paidAmount = totalAmount;
      dueAmount = 0;
      status = 'paid';
    } else if (paymentStatus === 'payment_required') {
      paidAmount = 0;
      dueAmount = totalAmount;
      status = 'payment_required';
    } else {
      // Partial payment
      paidAmount = parseFloat(amountPaid) || 0;
      dueAmount = totalAmount - paidAmount;
      status = paidAmount > 0 ? 'pending' : 'payment_required';
    }
    
    try {
      const { error } = await supabase
        .from('sales')
        .insert([
          {
            godown_id: parseInt(selectedGodownId),
            buyer_name: buyerName,
            material,
            quantity: parseFloat(quantity),
            unit,
            sale_amount: totalAmount,
            payment_status: status,
            amount_due: dueAmount,
            sale_date: format(saleDate, 'yyyy-MM-dd'),
            notes
          }
        ]);
      
      if (error) throw error;
      
      toast({
        title: 'Sale recorded',
        description: 'New sale has been successfully recorded.',
      });
      onSuccess();
    } catch (error) {
      console.error('Error creating sale:', error);
      toast({
        title: 'Error',
        description: 'Failed to record sale. Please try again.',
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
          Enter details of the sale transaction.
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="godown" className="text-right">
            Godown*
          </Label>
          <div className="col-span-3">
            <Select
              disabled={isLoadingGodowns}
              value={selectedGodownId}
              onValueChange={setSelectedGodownId}
            >
              <SelectTrigger className={errors.godown ? "border-red-500" : ""}>
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
            {errors.godown && <p className="text-red-500 text-sm mt-1">{errors.godown}</p>}
          </div>
        </div>

        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="buyer-name" className="text-right">
            Buyer Name*
          </Label>
          <div className="col-span-3">
            <Input
              id="buyer-name"
              value={buyerName}
              onChange={(e) => setBuyerName(e.target.value)}
              placeholder="Enter buyer name"
              className={errors.buyerName ? "border-red-500" : ""}
            />
            {errors.buyerName && <p className="text-red-500 text-sm mt-1">{errors.buyerName}</p>}
          </div>
        </div>

        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="material" className="text-right">
            Material*
          </Label>
          <div className="col-span-3">
            <Select
              value={material}
              onValueChange={(value) => setMaterial(value as MaterialType)}
            >
              <SelectTrigger className={errors.material ? "border-red-500" : ""}>
                <SelectValue placeholder="Select material" />
              </SelectTrigger>
              <SelectContent>
                {materialTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.material && <p className="text-red-500 text-sm mt-1">{errors.material}</p>}
          </div>
        </div>

        <div className="grid grid-cols-4 items-center gap-4">
          <Label className="text-right">
            Quantity & Unit*
          </Label>
          <div className="col-span-3 grid grid-cols-2 gap-2">
            <div>
              <Input
                type="number"
                step="0.01"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="Quantity"
                className={errors.quantity ? "border-red-500" : ""}
              />
              {errors.quantity && <p className="text-red-500 text-sm mt-1">{errors.quantity}</p>}
            </div>
            <div>
              <Input
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="Unit (kg, tons, etc.)"
                className={errors.unit ? "border-red-500" : ""}
              />
              {errors.unit && <p className="text-red-500 text-sm mt-1">{errors.unit}</p>}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="sale-amount" className="text-right">
            Sale Amount (₹)*
          </Label>
          <div className="col-span-3">
            <Input
              id="sale-amount"
              type="number"
              step="0.01"
              value={saleAmount}
              onChange={(e) => setSaleAmount(e.target.value)}
              placeholder="0.00"
              className={errors.saleAmount ? "border-red-500" : ""}
            />
            {errors.saleAmount && <p className="text-red-500 text-sm mt-1">{errors.saleAmount}</p>}
          </div>
        </div>

        <div className="grid grid-cols-4 items-center gap-4">
          <Label className="text-right">
            Payment Status*
          </Label>
          <div className="col-span-3">
            <RadioGroup 
              value={paymentStatus} 
              onValueChange={(value) => setPaymentStatus(value as PaymentStatus)}
              className="flex space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="paid" id="paid" />
                <Label htmlFor="paid" className="cursor-pointer">Paid in Full</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="pending" id="pending" />
                <Label htmlFor="pending" className="cursor-pointer">Partially Paid</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="payment_required" id="payment_required" />
                <Label htmlFor="payment_required" className="cursor-pointer">No Payment</Label>
              </div>
            </RadioGroup>
          </div>
        </div>

        {paymentStatus === 'pending' && (
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="amount-paid" className="text-right">
              Amount Paid (₹)*
            </Label>
            <div className="col-span-3">
              <Input
                id="amount-paid"
                type="number"
                step="0.01"
                value={amountPaid}
                onChange={(e) => setAmountPaid(e.target.value)}
                placeholder="0.00"
                className={errors.amountPaid ? "border-red-500" : ""}
              />
              {errors.amountPaid && <p className="text-red-500 text-sm mt-1">{errors.amountPaid}</p>}
              <p className="text-sm text-muted-foreground mt-1">
                Amount Due: ₹{calculateDueAmount()}
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="sale-date" className="text-right">
            Sale Date
          </Label>
          <div className="col-span-3">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={`w-full justify-start text-left font-normal ${
                    errors.saleDate ? "border-red-500" : ""
                  }`}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {saleDate ? format(saleDate, 'PPP') : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={saleDate}
                  onSelect={(date) => date && setSaleDate(date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            {errors.saleDate && <p className="text-red-500 text-sm mt-1">{errors.saleDate}</p>}
          </div>
        </div>

        <div className="grid grid-cols-4 items-start gap-4">
          <Label htmlFor="notes" className="text-right pt-2">
            Notes
          </Label>
          <Textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Additional details about the sale"
            className="col-span-3"
          />
        </div>
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Save Sale'}
        </Button>
      </DialogFooter>
    </form>
  );
};

export default SaleForm;
