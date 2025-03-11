
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
import { getTrips, createTrip, completeTrip, getVehicles, getDrivers, getLocations, generateTripToken, updateTripWithToken } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';

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

const TripsPage = () => {
  const [trips, setTrips] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [openAddTrip, setOpenAddTrip] = useState(false);
  const { toast } = useToast();
  
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [locations, setLocations] = useState([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const [selectedDriverId, setSelectedDriverId] = useState('');
  const [fromLocationId, setFromLocationId] = useState('');
  const [toLocationId, setToLocationId] = useState('');
  const [material, setMaterial] = useState<MaterialType>('mixed_plastic');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [openTripDetails, setOpenTripDetails] = useState(false);

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

  const fetchFormData = async () => {
    try {
      const [vehiclesData, driversData, locationsData] = await Promise.all([
        getVehicles(),
        getDrivers(),
        getLocations()
      ]);
      
      setVehicles(vehiclesData || []);
      setDrivers(driversData || []);
      setLocations(locationsData || []);
    } catch (error) {
      console.error('Error fetching form data:', error);
      toast({
        title: 'Data loading error',
        description: 'Could not load necessary data for the form.',
        variant: 'destructive'
      });
    }
  };

  useEffect(() => {
    fetchTrips();
    fetchFormData();
  }, []);

  const handleAddTrip = async (e) => {
    e.preventDefault();
    
    if (!selectedVehicleId || !selectedDriverId || !fromLocationId || !toLocationId || !material || !quantity || !unit) {
      toast({
        title: 'Missing information',
        description: 'Please fill in all required fields.',
        variant: 'destructive'
      });
      return;
    }
    
    try {
      const result = await createTrip(
        Number(selectedVehicleId),
        Number(selectedDriverId),
        Number(fromLocationId),
        Number(toLocationId),
        material as MaterialType,
        Number(quantity),
        unit,
        notes
      );
      
      if (result.success) {
        // Generate token for the new trip
        const token = generateTripToken(result.data);
        await updateTripWithToken(result.data.id, token);
        
        setOpenAddTrip(false);
        resetForm();
        fetchTrips();
        toast({
          title: 'Trip created',
          description: 'The trip has been recorded successfully.',
        });
      }
    } catch (error) {
      console.error('Error creating trip:', error);
      toast({
        title: 'Failed to create trip',
        description: 'Please try again later.',
        variant: 'destructive'
      });
    }
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

  const resetForm = () => {
    setSelectedVehicleId('');
    setSelectedDriverId('');
    setFromLocationId('');
    setToLocationId('');
    setMaterial('mixed_plastic');
    setQuantity('');
    setUnit('');
    setNotes('');
  };

  const filteredTrips = trips.filter(trip => 
    (trip.vehicle?.registration_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    trip.driver?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    trip.from_location?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    trip.to_location?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    trip.material_carried?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    trip.status?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    trip.token_code?.toLowerCase().includes(searchQuery.toLowerCase()))
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

  const formatMaterialType = (type: string) => {
    return type?.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: 'Copied!',
        description: 'Token copied to clipboard',
      });
    });
  };

  const viewTripDetails = (trip) => {
    setSelectedTrip(trip);
    setOpenTripDetails(true);
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
                <form onSubmit={handleAddTrip}>
                  <DialogHeader>
                    <DialogTitle>Record New Trip</DialogTitle>
                    <DialogDescription>
                      Enter trip details to track vehicle movement and material transport.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="vehicle">Vehicle</Label>
                        <Select
                          value={selectedVehicleId}
                          onValueChange={setSelectedVehicleId}
                          required
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select vehicle" />
                          </SelectTrigger>
                          <SelectContent>
                            {vehicles
                              .filter(v => v.status === 'available')
                              .map((vehicle) => (
                                <SelectItem key={vehicle.id} value={vehicle.id.toString()}>
                                  {vehicle.registration_number} ({vehicle.type})
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="driver">Driver</Label>
                        <Select
                          value={selectedDriverId}
                          onValueChange={setSelectedDriverId}
                          required
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select driver" />
                          </SelectTrigger>
                          <SelectContent>
                            {drivers.map((driver) => (
                              <SelectItem key={driver.id} value={driver.id.toString()}>
                                {driver.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="from-location">From Location</Label>
                        <Select
                          value={fromLocationId}
                          onValueChange={setFromLocationId}
                          required
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select origin" />
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
                        <Label htmlFor="to-location">To Location</Label>
                        <Select
                          value={toLocationId}
                          onValueChange={setToLocationId}
                          required
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select destination" />
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
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="material">Material</Label>
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
                      <Label htmlFor="notes">Notes</Label>
                      <Textarea
                        id="notes"
                        placeholder="Additional details about the trip"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit">Start Trip</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="flex w-full items-center space-x-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search trips by vehicle, driver, location, material or token..."
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
                      <TableHead>Departure</TableHead>
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
                        <TableCell>
                          <div className="flex space-x-1">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => viewTripDetails(trip)}
                            >
                              <Edit className="h-3 w-3" />
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
                            {trip.status === 'completed' && (
                              <span className="text-xs text-muted-foreground">
                                Completed {trip.arrival_time ? formatDate(trip.arrival_time) : ''}
                              </span>
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
      
      {/* Trip Details Dialog */}
      <Dialog open={openTripDetails} onOpenChange={setOpenTripDetails}>
        <DialogContent className="sm:max-w-[600px]">
          {selectedTrip && (
            <>
              <DialogHeader>
                <DialogTitle>Trip Details</DialogTitle>
                <DialogDescription>
                  Detailed information about this trip.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="bg-muted p-3 rounded-md">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-semibold text-lg">Token:</h3>
                    <div className="flex items-center gap-2">
                      <span className="font-mono">{selectedTrip.token_code}</span>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-6"
                        onClick={() => copyToClipboard(selectedTrip.token_code)}
                      >
                        <Copy className="h-3 w-3 mr-1" /> Copy
                      </Button>
                    </div>
                  </div>
                  <div className="text-right">
                    {getStatusBadge(selectedTrip.status)}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-muted-foreground mb-1">Vehicle</h4>
                    <p>{selectedTrip.vehicle?.registration_number} ({selectedTrip.vehicle?.type})</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-muted-foreground mb-1">Driver</h4>
                    <p>{selectedTrip.driver?.name}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-muted-foreground mb-1">From</h4>
                    <p>{selectedTrip.from_location?.name}</p>
                    <p className="text-sm text-muted-foreground">{selectedTrip.from_location?.address}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-muted-foreground mb-1">To</h4>
                    <p>{selectedTrip.to_location?.name}</p>
                    <p className="text-sm text-muted-foreground">{selectedTrip.to_location?.address}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-muted-foreground mb-1">Material</h4>
                    <p>{formatMaterialType(selectedTrip.material_carried)}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-muted-foreground mb-1">Quantity</h4>
                    <p>{selectedTrip.quantity} {selectedTrip.unit}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-muted-foreground mb-1">Departure</h4>
                    <p>{formatDate(selectedTrip.departure_time)}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-muted-foreground mb-1">Arrival</h4>
                    <p>{selectedTrip.arrival_time ? formatDate(selectedTrip.arrival_time) : 'Not arrived yet'}</p>
                  </div>
                </div>
                
                {selectedTrip.notes && (
                  <div>
                    <h4 className="font-medium text-muted-foreground mb-1">Notes</h4>
                    <p className="text-sm">{selectedTrip.notes}</p>
                  </div>
                )}
              </div>
              <DialogFooter>
                {selectedTrip.status === 'in_progress' && (
                  <Button onClick={() => {
                    handleCompleteTrip(selectedTrip);
                    setOpenTripDetails(false);
                  }}>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Mark as Completed
                  </Button>
                )}
                <Button variant="outline" onClick={() => setOpenTripDetails(false)}>
                  Close
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default TripsPage;
