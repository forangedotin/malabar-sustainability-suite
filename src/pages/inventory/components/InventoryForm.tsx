
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
import { useToast } from '@/hooks/use-toast';
import { updateInventory, getLocations } from '@/lib/supabase';

interface Location {
  id: number;
  name: string;
  type: string;
}

interface InventoryFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const MATERIAL_TYPES = [
  'plastic', 
  'paper', 
  'glass', 
  'metal', 
  'organic', 
  'electronic', 
  'textile', 
  'rubber', 
  'wood', 
  'other'
];

const InventoryForm: React.FC<InventoryFormProps> = ({ onSuccess, onCancel }) => {
  const { toast } = useToast();
  const [godownId, setGodownId] = useState<string>('');
  const [godowns, setGodowns] = useState<Location[]>([]);
  const [material, setMaterial] = useState<string>('');
  const [customMaterial, setCustomMaterial] = useState<string>('');
  const [quantity, setQuantity] = useState<string>('');
  const [operation, setOperation] = useState<'add'>('add');
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!godownId || (!material && !customMaterial) || !quantity) {
      toast({
        title: 'Missing information',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }
    
    const materialValue = material === 'other' ? customMaterial : material;
    
    setIsLoading(true);
    try {
      const result = await updateInventory(
        parseInt(godownId),
        materialValue,
        parseFloat(quantity),
        operation
      );
      
      if (result.success) {
        toast({
          title: 'Inventory updated',
          description: `${quantity} units of ${materialValue} have been added to inventory`,
        });
        onSuccess();
      } else {
        // Fixed: Extract the error message properly
        let errorMessage = 'Failed to update inventory';
        
        if (result.error) {
          if (typeof result.error === 'object' && result.error !== null && 'message' in result.error) {
            errorMessage = result.error.message as string;
          } else if (typeof result.error === 'string') {
            errorMessage = result.error;
          }
        }
        
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('Error updating inventory:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update inventory. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <DialogHeader>
        <DialogTitle>Add Stock to Inventory</DialogTitle>
        <DialogDescription>
          Enter the inventory details to add stock to the selected godown.
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
              {MATERIAL_TYPES.map((type) => (
                <SelectItem key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {material === 'other' && (
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="custom-material" className="text-right">
              Specify Material*
            </Label>
            <Input
              id="custom-material"
              value={customMaterial}
              onChange={(e) => setCustomMaterial(e.target.value)}
              placeholder="Enter material name"
              className="col-span-3"
              required={material === 'other'}
            />
          </div>
        )}
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
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Adding Stock...' : 'Add Stock'}
        </Button>
      </DialogFooter>
    </form>
  );
};

export default InventoryForm;
