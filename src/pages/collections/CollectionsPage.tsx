
import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
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
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Search,
  Plus,
  RefreshCw,
  CalendarDays,
  Loader2,
  PackageOpen,
  MapPin,
  Banknote
} from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { getLocations, createCollection, getDailyCollections } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';

// Define the material types enum to match the database enum
type MaterialType = 'mixed_plastic' | 'paper' | 'cardboard' | 'metal' | 'glass' | 'organic' | 'electronic' | 'other';

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

const CollectionsPage = () => {
  const [collections, setCollections] = useState([]);
  const [locations, setLocations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [openAddCollection, setOpenAddCollection] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const { toast } = useToast();
  
  // Form states
  const [locationId, setLocationId] = useState('');
  const [material, setMaterial] = useState<MaterialType>('mixed_plastic');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('kg');
  const [amountPaid, setAmountPaid] = useState('');
  const [notes, setNotes] = useState('');

  const fetchCollections = async () => {
    setIsLoading(true);
    try {
      const collectionsData = await getDailyCollections(selectedDate);
      setCollections(collectionsData || []);
    } catch (error) {
      console.error('Error fetching collections:', error);
      toast({
        title: 'Failed to fetch collections',
        description: 'Could not load collection data. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchLocations = async () => {
    try {
      const locationsData = await getLocations('collection_point');
      setLocations(locationsData || []);
    } catch (error) {
      console.error('Error fetching locations:', error);
      toast({
        title: 'Data loading error',
        description: 'Could not load necessary location data.',
        variant: 'destructive'
      });
    }
  };

  useEffect(() => {
    fetchCollections();
    fetchLocations();
  }, [selectedDate]);

  const handleAddCollection = async (e) => {
    e.preventDefault();
    
    if (!locationId || !material || !quantity || !unit || !amountPaid) {
      toast({
        title: 'Missing information',
        description: 'Please fill in all required fields.',
        variant: 'destructive'
      });
      return;
    }
    
    try {
      const result = await createCollection(
        Number(locationId),
        material as MaterialType,
        Number(quantity),
        unit,
        Number(amountPaid),
        notes
      );
      
      if (result.success) {
        setOpenAddCollection(false);
        resetForm();
        fetchCollections();
        toast({
          title: 'Collection recorded',
          description: 'The collection has been recorded successfully.'
        });
      }
    } catch (error) {
      console.error('Error recording collection:', error);
      toast({
        title: 'Failed to record collection',
        description: 'Please try again later.',
        variant: 'destructive'
      });
    }
  };

  const resetForm = () => {
    setLocationId('');
    setMaterial('mixed_plastic');
    setQuantity('');
    setUnit('kg');
    setAmountPaid('');
    setNotes('');
  };

  const filteredCollections = collections.filter(collection => 
    collection.location?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    collection.material?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    collection.quantity?.toString().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'PPp');
    } catch (error) {
      return 'Invalid date';
    }
  };

  // Format the material type for display
  const formatMaterialType = (type: string) => {
    return type?.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase());
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Collections</h1>
            <p className="text-muted-foreground">
              Record and manage waste collections from different locations
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <Dialog open={openAddCollection} onOpenChange={setOpenAddCollection}>
              <DialogTrigger asChild>
                <Button className="w-full sm:w-auto">
                  <Plus className="mr-2 h-4 w-4" />
                  Record Collection
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <form onSubmit={handleAddCollection}>
                  <DialogHeader>
                    <DialogTitle>Record New Collection</DialogTitle>
                    <DialogDescription>
                      Enter collection details to track waste materials collected.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="location">Collection Point</Label>
                      <Select
                        value={locationId}
                        onValueChange={setLocationId}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select collection point" />
                        </SelectTrigger>
                        <SelectContent>
                          {locations.map((location) => (
                            <SelectItem key={location.id} value={location.id.toString()}>
                              {location.name} ({location.district})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="material">Material Type</Label>
                        <Select
                          value={material}
                          onValueChange={(value) => setMaterial(value as MaterialType)}
                          required
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select material" />
                          </SelectTrigger>
                          <SelectContent>
                            {materialTypes.map((type) => (
                              <SelectItem key={type} value={type}>
                                {formatMaterialType(type)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-2">
                          <Label htmlFor="quantity">Quantity</Label>
                          <Input
                            id="quantity"
                            type="number"
                            placeholder="0.00"
                            value={quantity}
                            onChange={(e) => setQuantity(e.target.value)}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="unit">Unit</Label>
                          <Input
                            id="unit"
                            placeholder="kg, tons"
                            value={unit}
                            onChange={(e) => setUnit(e.target.value)}
                            required
                          />
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="amountPaid">Amount Paid</Label>
                      <Input
                        id="amountPaid"
                        type="number"
                        placeholder="0.00"
                        value={amountPaid}
                        onChange={(e) => setAmountPaid(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="notes">Notes</Label>
                      <Textarea
                        id="notes"
                        placeholder="Additional details about the collection"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit">Record Collection</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2">
          <div className="w-full sm:w-auto">
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="flex w-full items-center space-x-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search collections by location, material..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
            <Button variant="outline" size="icon" onClick={fetchCollections}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Collection Records</CardTitle>
            <CardDescription>
              Total collections: {collections.length}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredCollections.length > 0 ? (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Collection Point</TableHead>
                      <TableHead>Material</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Amount Paid</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCollections.map((collection) => (
                      <TableRow key={collection.id}>
                        <TableCell>
                          <div className="flex items-center">
                            <MapPin className="mr-1 h-3 w-3" />
                            {collection.location?.name}
                            <Badge variant="outline" className="ml-2 text-xs">
                              {collection.location?.district}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <PackageOpen className="mr-1 h-3 w-3" />
                            {formatMaterialType(collection.material)}
                          </div>
                        </TableCell>
                        <TableCell>
                          {collection.quantity} {collection.unit}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Banknote className="mr-1 h-3 w-3" />
                            {collection.amount_paid}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center text-xs">
                            <CalendarDays className="mr-1 h-3 w-3" />
                            {formatDate(collection.collection_date)}
                          </div>
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate">
                          {collection.notes}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-8 text-center">
                <PackageOpen className="h-10 w-10 text-muted-foreground" />
                <h3 className="mt-2 text-lg font-semibold">No collections found</h3>
                {searchQuery ? (
                  <p className="text-muted-foreground">
                    No results for "{searchQuery}". Try another search term.
                  </p>
                ) : (
                  <p className="text-muted-foreground">
                    No collections have been recorded for {selectedDate}. Choose another date or add a new collection.
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default CollectionsPage;
