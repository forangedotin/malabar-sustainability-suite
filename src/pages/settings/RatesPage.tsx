
import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Plus, Calendar, DollarSign, Trash2, Save } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
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
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { useAuth } from '@/contexts/auth';

interface Rate {
  id: number;
  rate_type: string;
  material_type: string | null;
  entity_id: number | null;
  rate: number;
  effective_from: string;
  effective_to: string | null;
  created_at: string;
  created_by: string;
  notes: string | null;
}

const RATE_TYPES = [
  { value: 'material_purchase', label: 'Material Purchase' },
  { value: 'labor_loading', label: 'Labor - Loading/Unloading' },
  { value: 'labor_segregation', label: 'Labor - Segregation' },
  { value: 'labor_bailing', label: 'Labor - Bailing' },
  { value: 'material_sale', label: 'Material Sale' },
  { value: 'commission', label: 'Commission' },
];

const MATERIAL_TYPES = [
  { value: 'mixed_plastic', label: 'Mixed Plastic' },
  { value: 'paper', label: 'Paper' },
  { value: 'cardboard', label: 'Cardboard' },
  { value: 'metal', label: 'Metal' },
  { value: 'glass', label: 'Glass' },
  { value: 'organic', label: 'Organic' },
  { value: 'electronic', label: 'Electronic' },
  { value: 'textile', label: 'Textile' },
  { value: 'rubber', label: 'Rubber' },
  { value: 'wood', label: 'Wood' },
  { value: 'other', label: 'Other' },
];

const RatesPage = () => {
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();
  const [rates, setRates] = useState<Rate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [openAddRate, setOpenAddRate] = useState(false);
  const [activeRatesOnly, setActiveRatesOnly] = useState(true);
  
  // Form state
  const [rateType, setRateType] = useState('');
  const [materialType, setMaterialType] = useState('');
  const [rateValue, setRateValue] = useState('');
  const [effectiveFrom, setEffectiveFrom] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  const fetchRates = async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('rates')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (activeRatesOnly) {
        query = query.is('effective_to', null);
      }
      
      const { data, error } = await query;
          
      if (error) {
        throw error;
      }
      
      setRates(data || []);
    } catch (error) {
      console.error('Error fetching rates:', error);
      toast({
        title: 'Failed to fetch rates',
        description: 'There was an error loading the rates data.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRates();
  }, [activeRatesOnly]);

  const resetForm = () => {
    setRateType('');
    setMaterialType('');
    setRateValue('');
    setEffectiveFrom(new Date().toISOString().split('T')[0]);
    setNotes('');
  };

  const handleAddRate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!rateType || !rateValue) {
      toast({
        title: 'Missing information',
        description: 'Please fill in all required fields.',
        variant: 'destructive'
      });
      return;
    }
    
    try {
      const parsedRate = parseFloat(rateValue);
      
      if (isNaN(parsedRate) || parsedRate <= 0) {
        toast({
          title: 'Invalid rate',
          description: 'Please enter a valid positive number for the rate.',
          variant: 'destructive'
        });
        return;
      }
      
      // If adding a new rate, deactivate any current active rates of the same type
      if (activeRatesOnly) {
        const { error: updateError } = await supabase
          .from('rates')
          .update({ effective_to: new Date().toISOString() })
          .match({ 
            rate_type: rateType,
            material_type: materialType || null,
            effective_to: null
          });
          
        if (updateError) {
          console.error('Error deactivating current rates:', updateError);
        }
      }
      
      // Insert the new rate
      const { data, error } = await supabase
        .from('rates')
        .insert({
          rate_type: rateType,
          material_type: materialType || null,
          rate: parsedRate,
          effective_from: new Date(effectiveFrom).toISOString(),
          notes: notes || null,
          created_by: user?.id
        })
        .select();
          
      if (error) {
        throw error;
      }
      
      setOpenAddRate(false);
      resetForm();
      fetchRates();
      
      toast({
        title: 'Rate added successfully',
        description: 'The new rate has been added and will be used for future transactions.'
      });
    } catch (error) {
      console.error('Error adding rate:', error);
      toast({
        title: 'Failed to add rate',
        description: 'There was an error adding the new rate.',
        variant: 'destructive'
      });
    }
  };

  const formatRateType = (type: string) => {
    return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatMaterialType = (type: string | null) => {
    if (!type) return 'All Materials';
    return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Current';
    return format(new Date(dateString), 'PPp');
  };

  const deactivateRate = async (rateId: number) => {
    try {
      const { error } = await supabase
        .from('rates')
        .update({ effective_to: new Date().toISOString() })
        .eq('id', rateId);
          
      if (error) {
        throw error;
      }
      
      fetchRates();
      toast({
        title: 'Rate deactivated',
        description: 'The rate has been deactivated and will no longer be used for new transactions.'
      });
    } catch (error) {
      console.error('Error deactivating rate:', error);
      toast({
        title: 'Failed to deactivate rate',
        description: 'There was an error deactivating the rate.',
        variant: 'destructive'
      });
    }
  };

  if (!isAdmin) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-full">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Access Denied</CardTitle>
              <CardDescription>
                You need administrator privileges to access the rate management page.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Rate Management</h1>
            <p className="text-muted-foreground">
              Manage and update rates for materials, labor, and commissions
            </p>
          </div>
          <div className="mt-4 flex items-center space-x-2 sm:mt-0">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="activeOnly"
                checked={activeRatesOnly}
                onChange={(e) => setActiveRatesOnly(e.target.checked)}
                className="rounded border-gray-300 text-primary focus:ring-primary"
              />
              <Label htmlFor="activeOnly">Show active rates only</Label>
            </div>
            <Dialog open={openAddRate} onOpenChange={setOpenAddRate}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add New Rate
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[550px]">
                <form onSubmit={handleAddRate}>
                  <DialogHeader>
                    <DialogTitle>Add New Rate</DialogTitle>
                    <DialogDescription>
                      Set a new rate that will be used for future transactions.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="rateType">Rate Type</Label>
                      <Select
                        value={rateType}
                        onValueChange={setRateType}
                        required
                      >
                        <SelectTrigger id="rateType">
                          <SelectValue placeholder="Select rate type" />
                        </SelectTrigger>
                        <SelectContent>
                          {RATE_TYPES.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {['material_purchase', 'material_sale'].includes(rateType) && (
                      <div className="space-y-2">
                        <Label htmlFor="materialType">Material Type</Label>
                        <Select
                          value={materialType}
                          onValueChange={setMaterialType}
                          required
                        >
                          <SelectTrigger id="materialType">
                            <SelectValue placeholder="Select material type" />
                          </SelectTrigger>
                          <SelectContent>
                            {MATERIAL_TYPES.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                    
                    <div className="space-y-2">
                      <Label htmlFor="rate">Rate (₹)</Label>
                      <Input
                        id="rate"
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        value={rateValue}
                        onChange={(e) => setRateValue(e.target.value)}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="effectiveFrom">Effective From</Label>
                      <Input
                        id="effectiveFrom"
                        type="date"
                        value={effectiveFrom}
                        onChange={(e) => setEffectiveFrom(e.target.value)}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="notes">Notes</Label>
                      <Textarea
                        id="notes"
                        placeholder="Additional details about this rate"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                      />
                    </div>
                  </div>
                  <DialogFooter className="gap-2 sm:gap-0">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => {
                        setOpenAddRate(false);
                        resetForm();
                      }}
                    >
                      Cancel
                    </Button>
                    <Button type="submit">Save Rate</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <DollarSign className="mr-2 h-5 w-5" />
              {activeRatesOnly ? 'Active Rates' : 'All Rates'}
            </CardTitle>
            <CardDescription>
              Rates used for calculating amounts in transactions
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : rates.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No rates found. Start by adding a new rate.
              </div>
            ) : (
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Rate Type</TableHead>
                      <TableHead>Material</TableHead>
                      <TableHead>Rate (₹)</TableHead>
                      <TableHead>Effective From</TableHead>
                      <TableHead>Effective To</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rates.map((rate) => (
                      <TableRow key={rate.id}>
                        <TableCell className="font-medium">
                          {formatRateType(rate.rate_type)}
                        </TableCell>
                        <TableCell>
                          {formatMaterialType(rate.material_type)}
                        </TableCell>
                        <TableCell>₹{rate.rate.toFixed(2)}</TableCell>
                        <TableCell className="whitespace-nowrap">
                          <div className="flex items-center">
                            <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                            {formatDate(rate.effective_from)}
                          </div>
                        </TableCell>
                        <TableCell>
                          {rate.effective_to ? (
                            <div className="flex items-center">
                              <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                              {formatDate(rate.effective_to)}
                            </div>
                          ) : (
                            <Badge variant="outline" className="bg-green-50 text-green-700">
                              Active
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {!rate.effective_to && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => deactivateRate(rate.id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Deactivate
                            </Button>
                          )}
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
    </Layout>
  );
};

export default RatesPage;
