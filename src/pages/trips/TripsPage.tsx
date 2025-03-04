import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth';
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
  Route,
  Search,
  Plus,
  RefreshCw,
  Truck,
  Loader2,
  User,
  ArrowRightLeft,
  Check,
  Clock,
  Package
} from 'lucide-react';
import { 
  getTrips, 
  createTrip, 
  completeTrip, 
  getVehicles, 
  getDrivers, 
  getLocations 
} from '@/lib/supabase';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

const TripsPage = () => {
  const { profile } = useAuth();
  const [trips, setTrips] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [locations, setLocations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [openAddTrip, setOpenAddTrip] = useState(false);
  
  const [vehicleId, setVehicleId] = useState('');
  const [driverId, setDriverId] = useState('');
  const [fromLocationId, setFromLocationId] = useState('');
  const [toLocationId, setToLocationId] = useState('');
  const [material, setMaterial] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('');
  const [notes, setNotes] = useState('');
  
  const fetchTrips = async () => {
    setIsLoading(true);
    const tripsData = await getTrips();
    setTrips(tripsData || []);
    setIsLoading(false);
  };

  const fetchVehicles = async () => {
    const vehiclesData = await getVehicles();
    setVehicles(vehiclesData || []);
  };

  const fetchDrivers = async () => {
    const driversData = await getDrivers();
    setDrivers(driversData || []);
  };

  const fetchLocations = async () => {
    const locationsData = await getLocations();
    setLocations(locationsData || []);
  };

  useEffect(() => {
    fetchTrips();
    fetchVehicles();
    fetchDrivers();
    fetchLocations();
  }, []);

  const handleAddTrip = async (e) => {
    e.preventDefault();
    
    const result = await createTrip(
      Number(vehicleId),
      Number(driverId),
      Number(fromLocationId),
      Number(toLocationId),
      material,
      Number(quantity),
      unit,
      notes
    );
    
    if (result.success) {
      setOpenAddTrip(false);
      resetTripForm();
      fetchTrips();
    }
  };

  const handleCompleteTrip = async (trip) => {
    const result = await completeTrip(
      trip.id,
      trip.vehicle_id,
      trip.to_location_id
    );
    
    if (result.success) {
      fetchTrips();
    }
  };

  const resetTripForm = () => {
    setVehicleId('');
    setDriverId('');
    setFromLocationId('');
    setToLocationId('');
    setMaterial('');
    setQuantity('');
    setUnit('');
    setNotes('');
  };

  const filteredTrips = trips.filter(trip => 
    trip.vehicle?.registration_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    trip.driver?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    trip.material_carried?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    trip.from_location?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    trip.to_location?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Trips</h1>
            <p className="text-muted-foreground">
              Track and manage vehicle trips and material transport
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <Dialog open={openAddTrip} onOpenChange={setOpenAddTrip}>
              <DialogTrigger asChild>
                <Button className="w-full sm:w-auto">
                  <Plus className="mr-2 h-4 w-4" />
                  Record New Trip
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[550px]">
                <form onSubmit={handleAddTrip}>
                  <DialogHeader>
                    <DialogTitle>Record New Trip</DialogTitle>
                    <DialogDescription>
                      Enter details about the trip to track vehicle movement and material transport.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="vehicle">Vehicle</Label>
                        <Select
                          value={vehicleId}
                          onValueChange={setVehicleId}
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
                          value={driverId}
                          onValueChange={setDriverId}
                          required
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select driver" />
                          </SelectTrigger>
                          <SelectContent>
                            {drivers
                              .filter(d => d.is_active)
                              .map((driver) => (
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
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="material">Material</Label>
                        <Select
                          value={material}
                          onValueChange={setMaterial}
                          required
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select material" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="plastic">Plastic</SelectItem>
                            <SelectItem value="paper">Paper</SelectItem>
                            <SelectItem value="metal">Metal</SelectItem>
                            <SelectItem value="glass">Glass</SelectItem>
                            <SelectItem value="e_waste">E-Waste</SelectItem>
                            <SelectItem value="organic">Organic Waste</SelectItem>
                            <SelectItem value="mixed">Mixed Waste</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
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
                          placeholder="kg, tons, etc."
                          value={unit}
                          onChange={(e) => setUnit(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="trip-notes">Notes</Label>
                      <Textarea
                        id="trip-notes"
                        placeholder="Any additional information about the trip"
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
            placeholder="Search trips by vehicle, driver, material, or locations..."
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
            <CardTitle>Recent Trips</CardTitle>
            <CardDescription>
              Total recorded trips: {trips.length}
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
                      <TableHead>Vehicle</TableHead>
                      <TableHead>Driver</TableHead>
                      <TableHead>Route</TableHead>
                      <TableHead>Material</TableHead>
                      <TableHead>Departure</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTrips.map((trip) => (
                      <TableRow key={trip.id}>
                        <TableCell>
                          <div className="flex items-center">
                            <Truck className="mr-1 h-3 w-3" />
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
                          <div className="flex items-center">
                            {trip.from_location?.name}
                            <ArrowRightLeft className="mx-1 h-3 w-3" />
                            {trip.to_location?.name}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Package className="mr-1 h-3 w-3" />
                            {trip.quantity} {trip.unit} of {trip.material_carried}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Clock className="mr-1 h-3 w-3" />
                            {format(new Date(trip.departure_time), 'dd/MM/yy HH:mm')}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            className={trip.status === 'completed' ? "bg-green-500" : "bg-blue-500"}
                          >
                            {trip.status === 'completed' ? "Completed" : "In Progress"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {trip.status !== 'completed' && (
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleCompleteTrip(trip)}
                            >
                              <Check className="mr-1 h-3 w-3" />
                              Complete Trip
                            </Button>
                          )}
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
                    No trips recorded yet. Start recording vehicle trips to track movements.
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

export default TripsPage;
