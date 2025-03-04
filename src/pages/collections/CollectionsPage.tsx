
import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { createCollection, getLocations } from '@/lib/supabase';
import { supabase } from '@/lib/supabase';
import { Loader2, Plus, Filter } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface Collection {
  id: number;
  location_id: number;
  collected_by: string;
  material: string;
  quantity: number;
  unit: string;
  amount_paid: number;
  notes?: string;
  collection_date: string;
  location: {
    name: string;
    district: string;
    type: string;
  };
}

interface Location {
  id: number;
  name: string;
  type: string;
  district: string;
}

const materialTypes = [
  'plastic',
  'metal',
  'paper',
  'glass',
  'organic',
  'other',
];

const units = [
  'kg',
  'ton',
  'piece',
];

const CollectionsPage = () => {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  // Form state
  const [formState, setFormState] = useState({
    locationId: '',
    material: 'plastic',
    quantity: '',
    unit: 'kg',
    amountPaid: '',
    notes: '',
  });

  // Filter state
  const [filters, setFilters] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    location: '',
    material: '',
  });

  useEffect(() => {
    Promise.all([
      fetchCollections(),
      fetchLocations(),
    ]);
  }, []);

  useEffect(() => {
    fetchCollections();
  }, [filters]);

  const fetchCollections = async () => {
    setIsLoading(true);
    
    try {
      let query = supabase
        .from('collections')
        .select(`
          *,
          location:locations(name, district, type)
        `)
        .order('collection_date', { ascending: false });
      
      // Apply date filter
      if (filters.date) {
        const startDate = new Date(filters.date);
        startDate.setHours(0, 0, 0, 0);
        
        const endDate = new Date(filters.date);
        endDate.setHours(23, 59, 59, 999);
        
        query = query
          .gte('collection_date', startDate.toISOString())
          .lte('collection_date', endDate.toISOString());
      }
      
      // Apply location filter
      if (filters.location) {
        query = query.eq('location_id', filters.location);
      }
      
      // Apply material filter
      if (filters.material) {
        query = query.eq('material', filters.material);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      setCollections(data || []);
    } catch (error) {
      console.error('Error fetching collections:', error);
      toast({
        title: 'Error',
        description: 'Failed to load collections',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchLocations = async () => {
    try {
      const data = await getLocations();
      setLocations(data);
    } catch (error) {
      console.error('Error fetching locations:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleFilterChange = (name: string, value: string) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const { locationId, material, quantity, unit, amountPaid, notes } = formState;
    
    if (!locationId) {
      toast({
        title: 'Error',
        description: 'Please select a location',
        variant: 'destructive',
      });
      return;
    }
    
    const result = await createCollection(
      parseInt(locationId),
      material,
      parseFloat(quantity),
      unit,
      parseFloat(amountPaid),
      notes
    );
    
    if (result.success) {
      setIsDialogOpen(false);
      fetchCollections();
      resetForm();
    }
  };

  const resetForm = () => {
    setFormState({
      locationId: '',
      material: 'plastic',
      quantity: '',
      unit: 'kg',
      amountPaid: '',
      notes: '',
    });
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Collections</h1>
            <p className="text-muted-foreground">
              Record and manage waste collections from various locations
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Collection
              </Button>
            </DialogTrigger>
            <DialogContent>
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle>Record New Collection</DialogTitle>
                  <DialogDescription>
                    Enter the details of the waste collection
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="locationId">Location</Label>
                    <Select
                      value={formState.locationId}
                      onValueChange={(value) => handleSelectChange('locationId', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select location" />
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
                  <div className="space-y-2">
                    <Label htmlFor="material">Material Type</Label>
                    <Select
                      value={formState.material}
                      onValueChange={(value) => handleSelectChange('material', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select material" />
                      </SelectTrigger>
                      <SelectContent>
                        {materialTypes.map((material) => (
                          <SelectItem key={material} value={material}>
                            {material.charAt(0).toUpperCase() + material.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="quantity">Quantity</Label>
                      <Input
                        id="quantity"
                        name="quantity"
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="Enter quantity"
                        value={formState.quantity}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="unit">Unit</Label>
                      <Select
                        value={formState.unit}
                        onValueChange={(value) => handleSelectChange('unit', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select unit" />
                        </SelectTrigger>
                        <SelectContent>
                          {units.map((unit) => (
                            <SelectItem key={unit} value={unit}>
                              {unit}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="amountPaid">Amount Paid (₹)</Label>
                    <Input
                      id="amountPaid"
                      name="amountPaid"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="Enter amount paid"
                      value={formState.amountPaid}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes (Optional)</Label>
                    <Textarea
                      id="notes"
                      name="notes"
                      placeholder="Enter any additional notes"
                      value={formState.notes}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">Save Collection</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={filters.date}
                  onChange={(e) => handleFilterChange('date', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Select
                  value={filters.location}
                  onValueChange={(value) => handleFilterChange('location', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All locations" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All locations</SelectItem>
                    {locations.map((location) => (
                      <SelectItem key={location.id} value={location.id.toString()}>
                        {location.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="material">Material</Label>
                <Select
                  value={filters.material}
                  onValueChange={(value) => handleFilterChange('material', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All materials" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All materials</SelectItem>
                    {materialTypes.map((material) => (
                      <SelectItem key={material} value={material}>
                        {material.charAt(0).toUpperCase() + material.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
          <CardFooter className="border-t px-6 py-4">
            <Button
              variant="outline"
              onClick={() => {
                setFilters({
                  date: format(new Date(), 'yyyy-MM-dd'),
                  location: '',
                  material: '',
                });
              }}
            >
              Reset Filters
            </Button>
          </CardFooter>
        </Card>

        <div className="rounded-md border">
          <div className="relative w-full overflow-auto">
            <table className="w-full caption-bottom text-sm">
              <thead className="[&_tr]:border-b">
                <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                  <th className="h-12 px-4 text-left align-middle font-medium">Date & Time</th>
                  <th className="h-12 px-4 text-left align-middle font-medium">Location</th>
                  <th className="h-12 px-4 text-left align-middle font-medium">Material</th>
                  <th className="h-12 px-4 text-left align-middle font-medium">Quantity</th>
                  <th className="h-12 px-4 text-left align-middle font-medium">Amount Paid</th>
                </tr>
              </thead>
              <tbody className="[&_tr:last-child]:border-0">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="p-4 text-center">
                      <Loader2 className="mx-auto h-6 w-6 animate-spin text-primary" />
                    </td>
                  </tr>
                ) : collections.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-4 text-center">
                      <div className="py-8 text-center">
                        <Filter className="mx-auto h-8 w-8 text-muted-foreground" />
                        <h3 className="mt-2 text-lg font-semibold">No collections found</h3>
                        <p className="text-sm text-muted-foreground">
                          Try adjusting your filters or add a new collection.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  collections.map((collection) => (
                    <tr
                      key={collection.id}
                      className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                    >
                      <td className="p-4 align-middle">
                        {format(new Date(collection.collection_date), 'dd/MM/yyyy hh:mm a')}
                      </td>
                      <td className="p-4 align-middle">
                        {collection.location.name}
                        <div className="text-xs text-muted-foreground">
                          {collection.location.district}
                        </div>
                      </td>
                      <td className="p-4 align-middle capitalize">{collection.material}</td>
                      <td className="p-4 align-middle">
                        {collection.quantity} {collection.unit}
                      </td>
                      <td className="p-4 align-middle">₹{collection.amount_paid}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CollectionsPage;
