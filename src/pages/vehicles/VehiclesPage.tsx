
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Search, Plus, RefreshCw } from 'lucide-react';
import { getVehicles, getLocations } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';

// Import our new components
import VehiclesList from './components/VehiclesList';
import VehicleForm from './components/VehicleForm';
import StatusUpdateForm from './components/StatusUpdateForm';

const VehiclesPage = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [vehicles, setVehicles] = useState([]);
  const [locations, setLocations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [openAddVehicle, setOpenAddVehicle] = useState(false);
  const [openUpdateStatus, setOpenUpdateStatus] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  const fetchVehicles = async () => {
    setIsLoading(true);
    try {
      const vehiclesData = await getVehicles();
      setVehicles(vehiclesData || []);
    } catch (error) {
      console.error("Error fetching vehicles:", error);
      toast({
        title: "Error",
        description: "Failed to load vehicles. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchLocations = async () => {
    try {
      const locationsData = await getLocations();
      setLocations(locationsData || []);
    } catch (error) {
      console.error("Error fetching locations:", error);
      toast({
        title: "Error",
        description: "Failed to load locations. Please try again.",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchVehicles();
    fetchLocations();
  }, []);

  const handleVehicleAdded = () => {
    setOpenAddVehicle(false);
    fetchVehicles();
  };

  const handleStatusUpdated = () => {
    setOpenUpdateStatus(false);
    setSelectedVehicle(null);
    fetchVehicles();
  };

  const openStatusUpdateDialog = (vehicle) => {
    setSelectedVehicle(vehicle);
    setOpenUpdateStatus(true);
  };

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
                <VehicleForm 
                  locations={locations} 
                  onSuccess={handleVehicleAdded} 
                  onCancel={() => setOpenAddVehicle(false)} 
                />
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
            <VehiclesList 
              vehicles={vehicles}
              isLoading={isLoading}
              searchQuery={searchQuery}
              onUpdateStatus={openStatusUpdateDialog}
            />
          </CardContent>
        </Card>

        <Dialog open={openUpdateStatus} onOpenChange={setOpenUpdateStatus}>
          <DialogContent className="sm:max-w-[425px]">
            <StatusUpdateForm 
              vehicle={selectedVehicle}
              locations={locations}
              onSuccess={handleStatusUpdated}
              onCancel={() => setOpenUpdateStatus(false)}
            />
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default VehiclesPage;
