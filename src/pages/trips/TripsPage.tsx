
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
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Search,
  Plus,
  RefreshCw,
  Car,
  User,
  MapPin,
  Loader2,
  Route,
  ArrowRight,
  Calendar,
  CheckCircle,
  Edit,
  Copy
} from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { getTrips, completeTrip, generateTripToken, updateTripWithToken } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import TripForm from './components/TripForm';

const TripsPage = () => {
  const [trips, setTrips] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [openAddTrip, setOpenAddTrip] = useState(false);
  const [openEditTrip, setOpenEditTrip] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const { toast } = useToast();

  const fetchTrips = async () => {
    setIsLoading(true);
    try {
      const tripsData = await getTrips();
      
      // If any trip doesn't have a token, generate one
      const updatedTrips = [];
      
      for (const trip of tripsData || []) {
        if (!trip.token_code) {
          const token = generateTripToken(trip);
          const result = await updateTripWithToken(trip.id, token);
          if (result.success) {
            updatedTrips.push({...trip, token_code: token});
          } else {
            updatedTrips.push(trip);
          }
        } else {
          updatedTrips.push(trip);
        }
      }
      
      setTrips(updatedTrips);
    } catch (error) {
      console.error('Error fetching trips:', error);
      toast({
        title: 'Failed to fetch trips',
        description: 'Could not load trip data. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  const handleTripAdded = () => {
    setOpenAddTrip(false);
    fetchTrips();
  };

  const handleTripUpdated = () => {
    setOpenEditTrip(false);
    setSelectedTrip(null);
    fetchTrips();
  };

  const handleCompleteTrip = async (trip) => {
    if (trip.status === 'completed') return;
    
    try {
      const result = await completeTrip(
        trip.id,
        trip.vehicle_id,
        trip.to_location_id
      );
      
      if (result.success) {
        fetchTrips();
        toast({
          title: 'Trip completed',
          description: 'The trip has been marked as completed.'
        });
      }
    } catch (error) {
      console.error('Error completing trip:', error);
      toast({
        title: 'Failed to complete trip',
        description: 'Please try again later.',
        variant: 'destructive'
      });
    }
  };

  const handleEditTrip = (trip) => {
    setSelectedTrip(trip);
    setOpenEditTrip(true);
  };

  const filteredTrips = trips.filter(trip => 
    (trip.vehicle?.registration_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    trip.driver?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    trip.from_location?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    trip.to_location?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    trip.material_carried?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    trip.status?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    trip.token_code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    trip.commission_agent?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

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

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'PPp');
    } catch (error) {
      return 'Invalid date';
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: 'Copied!',
        description: 'Token copied to clipboard',
      });
    });
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Trips</h1>
            <p className="text-muted-foreground">
              Manage vehicle trips and material transport
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <Dialog open={openAddTrip} onOpenChange={setOpenAddTrip}>
              <DialogTrigger asChild>
                <Button className="w-full sm:w-auto">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Trip
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <TripForm 
                  onSuccess={handleTripAdded}
                  onCancel={() => setOpenAddTrip(false)}
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="flex w-full items-center space-x-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search trips by vehicle, driver, location, material, agent or token..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1"
          />
          <Button variant="outline" size="icon" onClick={fetchTrips}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Trip Records</CardTitle>
            <CardDescription>
              Total trips: {trips.length}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredTrips.length > 0 ? (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Token</TableHead>
                      <TableHead>Vehicle</TableHead>
                      <TableHead>Driver</TableHead>
                      <TableHead>Route</TableHead>
                      <TableHead>Material</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Agent</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTrips.map((trip) => (
                      <TableRow key={trip.id}>
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            <span className="font-mono text-xs">{trip.token_code}</span>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-5 w-5 p-0"
                              onClick={() => copyToClipboard(trip.token_code)}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
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
                        <TableCell>{trip.material_carried}</TableCell>
                        <TableCell>
                          {trip.quantity} {trip.unit}
                        </TableCell>
                        <TableCell>
                          {trip.commission_agent || '-'}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(trip.status)}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-1">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleEditTrip(trip)}
                            >
                              <Edit className="h-3 w-3 mr-1" /> Edit
                            </Button>
                            
                            {trip.status === 'in_progress' && (
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleCompleteTrip(trip)}
                              >
                                <CheckCircle className="mr-1 h-3 w-3" />
                                Complete
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-8 text-center">
                <Route className="h-10 w-10 text-muted-foreground" />
                <h3 className="mt-2 text-lg font-semibold">No trips found</h3>
                {searchQuery ? (
                  <p className="text-muted-foreground">
                    No results for "{searchQuery}". Try another search term.
                  </p>
                ) : (
                  <p className="text-muted-foreground">
                    No trips have been recorded yet. Add your first trip to get started.
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Edit Trip Dialog */}
      <Dialog open={openEditTrip} onOpenChange={setOpenEditTrip}>
        <DialogContent className="sm:max-w-[600px]">
          {selectedTrip && (
            <TripForm
              trip={selectedTrip}
              onSuccess={handleTripUpdated}
              onCancel={() => setOpenEditTrip(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default TripsPage;
