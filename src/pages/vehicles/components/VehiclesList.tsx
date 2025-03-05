
import React from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Car, MapPin, RotateCw, Loader2 } from 'lucide-react';

type VehicleStatus = 'available' | 'maintenance' | 'on_route' | 'loading' | 'unloading';
type VehicleType = 'truck' | 'pickup' | 'van' | 'auto' | 'other';

interface Location {
  id: number;
  name: string;
  type: string;
}

interface Vehicle {
  id: string;
  registration_number: string;
  type: VehicleType;
  capacity?: number;
  capacity_unit?: string;
  status: VehicleStatus;
  token_code?: string;
  current_location?: Location;
}

interface VehiclesListProps {
  vehicles: Vehicle[];
  isLoading: boolean;
  searchQuery: string;
  onUpdateStatus: (vehicle: Vehicle) => void;
}

const statusColors = {
  available: 'bg-green-500',
  maintenance: 'bg-yellow-500',
  on_route: 'bg-blue-500',
  loading: 'bg-purple-500',
  unloading: 'bg-orange-500'
};

const VehiclesList: React.FC<VehiclesListProps> = ({ 
  vehicles, 
  isLoading, 
  searchQuery, 
  onUpdateStatus 
}) => {
  const filteredVehicles = vehicles.filter(vehicle => 
    vehicle.registration_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
    vehicle.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
    vehicle.current_location?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (filteredVehicles.length === 0) {
    return (
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
    );
  }

  return (
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
                  onClick={() => onUpdateStatus(vehicle)}
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
  );
};

export default VehiclesList;
