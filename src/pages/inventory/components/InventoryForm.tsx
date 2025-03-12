
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
import { updateInventory, getLocations, supabase } from '@/lib/supabase';

interface Location {
  id: number;
  name: string;
  type: string;
}

interface Material {
  id: number;
  name: string;
  category: string;
}

interface InventoryFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const InventoryForm: React.FC<InventoryFormProps> = ({ onSuccess, onCancel }) => {
  const { toast } = useToast();
  const [godownId, setGodownId] = useState<string>('');
  const [godowns, setGodowns] = useState<Location[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [materialId, setMaterialId] = useState<string>('');
  const [customMaterial, setCustomMaterial] = useState<string>('');
  const [customCategory, setCustomCategory] = useState<string>('');
  const [isAddingNewMaterial, setIsAddingNewMaterial] = useState<boolean>(false);
  const [quantity, setQuantity] = useState<string>('');
  const [operation, setOperation] = useState<'add'>('add');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [locationsData, materialsData] = await Promise.all([
          getLocations('godown'),
          fetchMaterials()
        ]);
        
        setGodowns(locationsData || []);
        setMaterials(materialsData || []);
        
        if (locationsData.length > 0) {
          setGodownId(locationsData[0].id.toString());
        }
        
        if (materialsData.length > 0) {
          setMaterialId(materialsData[0].id.toString());
        }
      } catch (error) {
        console.error('Error fetching form data:', error);
      }
    };

    fetchData();
  }, []);

  const fetchMaterials = async () => {
    const { data, error } = await supabase
      .from('materials')
      .select('*')
      .eq('is_active', true)
      .order('name');
      
    if (error) {
      console.error('Error fetching materials:', error);
      return [];
    }
    
    return data;
  };

  const handleAddNewMaterial = async () => {
    if (!customMaterial || !customCategory) {
      toast({
        title: 'Missing information',
        description: 'Please enter both material name and category',
        variant: 'destructive',
      });
      return;
    }
    
    const { data, error } = await supabase
      .from('materials')
      .insert({
        name: customMaterial,
        category: customCategory
      })
      .select()
      .single();
      
    if (error) {
      toast({
        title: 'Error adding material',
        description: error.message,
        variant: 'destructive',
      });
      return;
    }
    
    // Update materials list and select the new material
    const newMaterials = [...materials, data];
    setMaterials(newMaterials);
    setMaterialId(data.id.toString());
    
    // Reset new material form
    setCustomMaterial('');
    setCustomCategory('');
    setIsAddingNewMaterial(false);
    
    toast({
      title: 'Material added',
      description: `${data.name} has been added to materials`,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!godownId || !materialId || !quantity) {
      toast({
        title: 'Missing information',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }
    
    const selectedMaterial = materials.find(m => m.id.toString() === materialId)?.name || '';
    
    setIsLoading(true);
    try {
      const result = await updateInventory(
        parseInt(godownId),
        selectedMaterial,
        parseFloat(quantity),
        operation
      );
      
      if (result.success) {
        toast({
          title: 'Inventory updated',
          description: `${quantity} units of ${selectedMaterial} have been added to inventory`,
        });
        onSuccess();
      } else {
        // Extract the error message properly
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

        {isAddingNewMaterial ? (
          <>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="new-material" className="text-right">
                New Material*
              </Label>
              <Input
                id="new-material"
                value={customMaterial}
                onChange={(e) => setCustomMaterial(e.target.value)}
                placeholder="Enter material name"
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category" className="text-right">
                Category*
              </Label>
              <Input
                id="category"
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                placeholder="Enter material category"
                className="col-span-3"
                required
              />
            </div>
            <div className="flex justify-end mt-2 space-x-2">
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={() => setIsAddingNewMaterial(false)}
              >
                Cancel
              </Button>
              <Button 
                type="button" 
                size="sm"
                onClick={handleAddNewMaterial}
              >
                Add Material
              </Button>
            </div>
          </>
        ) : (
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="material" className="text-right">
              Material*
            </Label>
            <div className="col-span-3">
              <Select
                value={materialId}
                onValueChange={setMaterialId}
                required
              >
                <SelectTrigger id="material">
                  <SelectValue placeholder="Select material" />
                </SelectTrigger>
                <SelectContent>
                  {materials.map((material) => (
                    <SelectItem key={material.id} value={material.id.toString()}>
                      {material.name} ({material.category})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button 
                type="button" 
                variant="link" 
                className="mt-1 h-auto p-0"
                onClick={() => setIsAddingNewMaterial(true)}
              >
                Add new material
              </Button>
            </div>
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
