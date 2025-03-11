
import React, { useState } from 'react';
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
import { Badge } from '@/components/ui/badge';
import { Loader2, Search, FileBarChart2, Car, User, MapPin, ArrowRight, Calendar } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import { format } from 'date-fns';

const TokenLookupPage = () => {
  const [tokenQuery, setTokenQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [trips, setTrips] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const { toast } = useToast();

  const searchToken = async () => {
    if (!tokenQuery.trim()) {
      toast({
        title: 'Search Error',
        description: 'Please enter a token code to search',
        variant: 'destructive'
      });
      return;
    }

    setIsLoading(true);
    setHasSearched(true);
    
    try {
      const { data, error } = await supabase
        .from('trips')
        .select(`
          *,
          vehicle:vehicles(*),
          driver:drivers(*),
          from_location:locations!trips_from_location_id_fkey(*),
          to_location:locations!trips_to_location_id_fkey(*)
        `)
        .ilike('token_code', `%${tokenQuery.trim()}%`)
        .order('departure_time', { ascending: false });
        
      if (error) throw error;
      
      setTrips(data || []);
      
      if (data.length === 0) {
        toast({
          title: 'No trips found',
          description: `No trips found with token code containing "${tokenQuery}"`,
        });
      }
    } catch (error) {
      console.error('Error searching for token:', error);
      toast({
        title: 'Search Error',
        description: 'Failed to search for token code. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    searchToken();
  };

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'PPp');
    } catch (error) {
      return 'Invalid date';
    }
  };

  const formatMaterialType = (type: string) => {
    return type?.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'in_progress':
        return <Badge className="bg-blue-500">In Progress</Badge>;
      case 'completed':
        return <Badge className="bg-green-500">Completed</Badge>;
      default:
        return <Badge className="bg-gray-500">{status}</Badge>;
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Token Lookup</h1>
          <p className="text-muted-foreground">
            Search for trips using token codes
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileBarChart2 className="mr-2 h-5 w-5" />
              Trip Token Search
            </CardTitle>
            <CardDescription>
              Enter a full or partial token code to find associated trips
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="flex w-full items-center space-x-2">
                <Input
                  placeholder="Enter token code to search..."
                  value={tokenQuery}
                  onChange={(e) => setTokenQuery(e.target.value)}
                  className="flex-1"
                />
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Search className="h-4 w-4 mr-2" />}
                  Search
                </Button>
              </div>
            </form>

            {isLoading ? (
              <div className="flex justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : hasSearched && trips.length > 0 ? (
              <div className="rounded-md border mt-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Token</TableHead>
                      <TableHead>Vehicle</TableHead>
                      <TableHead>Driver</TableHead>
                      <TableHead>Route</TableHead>
                      <TableHead>Material</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Departure</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {trips.map((trip) => (
                      <TableRow key={trip.id}>
                        <TableCell className="font-mono">{trip.token_code}</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Car className="mr-1 h-3 w-3" />
                            {trip.vehicle?.registration_number}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <User className="mr-1 h-3 w-3" />
                            {trip.driver?.name}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-xs">
                            <MapPin className="h-3 w-3" />
                            {trip.from_location?.name}
                            <ArrowRight className="h-3 w-3" />
                            <MapPin className="h-3 w-3" />
                            {trip.to_location?.name}
                          </div>
                        </TableCell>
                        <TableCell>{formatMaterialType(trip.material_carried)}</TableCell>
                        <TableCell>
                          {trip.quantity} {trip.unit}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center text-xs">
                            <Calendar className="mr-1 h-3 w-3" />
                            {formatDate(trip.departure_time)}
                          </div>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(trip.status)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : hasSearched ? (
              <div className="text-center py-8 text-muted-foreground">
                No trips found matching your search criteria.
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default TokenLookupPage;
