
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
  Truck,
  Search,
  Plus,
  RefreshCw,
  MapPin,
  Loader2,
  Car,
  AlertCircle,
  RotateCw,
  BadgeCheck
} from 'lucide-react';
import { getVehicles, createVehicle, getLocations, updateVehicleStatus } from '@/lib/supabase';
import { Badge } from '@/components/ui/badge';

type VehicleType = 'truck' | 'pickup' | 'van' | 'auto' | 'other';
type VehicleStatus = 'available' | 'maintenance' | 'on_route' | 'loading' | 'unloading';

const statusColors = {
  available: 'bg-green-500',
  maintenance: 'bg-yellow-500',
  on_route: 'bg-blue-500',
  loading: 'bg-purple-500',
  unloading: 'bg-orange-500'
};

const VehiclesPage = () => {
  const { profile } = useAuth();
  const [vehicles, setVehicles] = useState([]);
  const [locations, setLocations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [openAddVehicle, setOpenAddVehicle] = useState(false);
  const [openUpdateStatus, setOpenUpdateStatus] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  
  const [regNumber, setRegNumber] = useState('');
  const [vehicleType, setVehicleType] = useState<VehicleType>('truck');
  const [capacity, setCapacity] = useState('');
  const [capacityUnit, setCapacityUnit] = useState('');
  const [locationId, setLocationId] = useState('');
  const [notes, setNotes] = useState('');
  
  const [newStatus, setNewStatus] = useState<VehicleStatus>('available');
  const [newLocationId, setNewLocationId] = useState('');

  const fetchVehicles = async () => {
    setIsLoading(true);
    const vehiclesData = await getVehicles();
    setVehicles(vehiclesData || []);
    setIsLoading(false);
  };

  const fetchLocations = async () => {
    const locationsData = await getLocations();
    setLocations(locationsData || []);
  };

  useEffect(() => {
    fetchVehicles();
    fetchLocations();
  }, []);

  const handleAddVehicle = async (e) => {
    e.preventDefault();
    
    const result = await createVehicle(
      regNumber,
      vehicleType,
      capacity ? Number(capacity) : undefined,
      capacityUnit,
      locationId ? Number(locationId) : undefined,
      notes
    );
    
    if (result.success) {
      setOpenAddVehicle(false);
      resetVehicleForm();
      fetchVehicles();
    }
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    
    if (!selectedVehicle) return;
    
    const result = await updateVehicleStatus(
      selectedVehicle.id,
      newStatus,
      newLocationId ? Number(newLocationId) : undefined
    );
    
    if (result.success) {
      setOpenUpdateStatus(false);
      setNewStatus('available');
      setNewLocationId('');
      fetchVehicles();
    }
  };

  const resetVehicleForm = () => {
    setRegNumber('');
    setVehicleType('truck');
    setCapacity('');
    setCapacityUnit('');
    setLocationId('');
    setNotes('');
  };

  const openStatusUpdateDialog = (vehicle) => {
    setSelectedVehicle(vehicle);
    setNewStatus(vehicle.status as VehicleStatus);
    setNewLocationId(vehicle.current_location?.id?.toString() || '');
    setOpenUpdateStatus(true);
  };

  const filteredVehicles = vehicles.filter(vehicle => 
    vehicle.registration_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
    vehicle.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
    vehicle.current_location?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Vehicles</h1>
            <p className="text-muted-foreground">
              Manage fleet vehicles and their current status
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <Dialog open={openAddVehicle} onOpenChange={setOpenAddVehicle}>
              <DialogTrigger asChild>
                <Button className="w-full sm:w-auto">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Vehicle
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleAddVehicle}>
                  <DialogHeader>
                    <DialogTitle>Add New Vehicle</DialogTitle>
                    <DialogDescription>
                      Enter details about the new vehicle to add to the fleet.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="reg-number" className="col-span-4">
                        Registration Number
                      </Label>
                      <Input
                        id="reg-number"
                        placeholder="KL-XX-XXXX"
                        className="col-span-4"
                        value={regNumber}
                        onChange={(e) => setRegNumber(e.target.value)}
                        required
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="vehicle-type" className="col-span-4">
                        Vehicle Type
                      </Label>
                      <Select
                        value={vehicleType}
                        onValueChange={(value: VehicleType) => setVehicleType(value)}
                        required
                      >
                        <SelectTrigger className="col-span-4">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="truck">Truck</SelectItem>
                          <SelectItem value="pickup">Pickup</SelectItem>
                          <SelectItem value="van">Van</SelectItem>
                          <SelectItem value="auto">Auto Rickshaw</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="capacity" className="col-span-2">
                        Capacity
                      </Label>
                      <Input
                        id="capacity"
                        type="number"
                        placeholder="0.00"
                        className="col-span-2"
                        value={capacity}
                        onChange={(e) => setCapacity(e.target.value)}
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="capacity-unit" className="col-span-2">
                        Capacity Unit
                      </Label>
                      <Input
                        id="capacity-unit"
                        placeholder="tons, kg, etc."
                        className="col-span-2"
                        value={capacityUnit}
                        onChange={(e) => setCapacityUnit(e.target.value)}
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="location" className="col-span-4">
                        Current Location
                      </Label>
                      <Select
                        value={locationId}
                        onValueChange={setLocationId}
                      >
                        <SelectTrigger className="col-span-4">
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
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="notes" className="col-span-4">
                        Notes
                      </Label>
                      <Textarea
                        id="notes"
                        placeholder="Any additional information about the vehicle"
                        className="col-span-4"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit">Add Vehicle</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="flex w-full items-center space-x-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search vehicles by registration, type, or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1"
          />
          <Button variant="outline" size="icon" onClick={fetchVehicles}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Fleet Vehicles</CardTitle>
            <CardDescription>
              Total vehicles: {vehicles.length}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredVehicles.length > 0 ? (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Reg. Number</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Capacity</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Current Location</TableHead>
                      <TableHead>Token Code</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredVehicles.map((vehicle) => (
                      <TableRow key={vehicle.id}>
                        <TableCell>{vehicle.registration_number}</TableCell>
                        <TableCell className="capitalize">{vehicle.type}</TableCell>
                        <TableCell>
                          {vehicle.capacity} {vehicle.capacity_unit}
                        </TableCell>
                        <TableCell>
                          <Badge 
                            className={statusColors[vehicle.status] || 'bg-gray-500'}
                          >
                            {vehicle.status.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {vehicle.current_location ? (
                            <div className="flex items-center">
                              <MapPin className="mr-1 h-3 w-3" />
                              {vehicle.current_location.name}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">Not set</span>
                          )}
                        </TableCell>
                        <TableCell className="font-mono text-xs">
                          {vehicle.token_code}
                        </TableCell>
                        <TableCell>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => openStatusUpdateDialog(vehicle)}
                          >
                            <RotateCw className="mr-1 h-3 w-3" />
                            Update Status
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-8 text-center">
                <Car className="h-10 w-10 text-muted-foreground" />
                <h3 className="mt-2 text-lg font-semibold">No vehicles found</h3>
                {searchQuery ? (
                  <p className="text-muted-foreground">
                    No results for "{searchQuery}". Try another search term.
                  </p>
                ) : (
                  <p className="text-muted-foreground">
                    Your fleet is empty. Add your first vehicle to get started.
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Dialog open={openUpdateStatus} onOpenChange={setOpenUpdateStatus}>
          <DialogContent className="sm:max-w-[425px]">
            <form onSubmit={handleUpdateStatus}>
              <DialogHeader>
                <DialogTitle>Update Vehicle Status</DialogTitle>
                <DialogDescription>
                  Update the status and location of {selectedVehicle?.registration_number}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="vehicle-status" className="col-span-4">
                    Status
                  </Label>
                  <Select
                    value={newStatus}
                    onValueChange={(value: VehicleStatus) => setNewStatus(value)}
                    required
                  >
                    <SelectTrigger className="col-span-4">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="available">Available</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                      <SelectItem value="on_route">On Route</SelectItem>
                      <SelectItem value="loading">Loading</SelectItem>
                      <SelectItem value="unloading">Unloading</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="location" className="col-span-4">
                    Current Location
                  </Label>
                  <Select
                    value={newLocationId}
                    onValueChange={setNewLocationId}
                  >
                    <SelectTrigger className="col-span-4">
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
              </div>
              <DialogFooter>
                <Button type="submit">Update Status</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default VehiclesPage;
