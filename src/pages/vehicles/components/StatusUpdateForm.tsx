
import React, { useState, useEffect } from 'react';
import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { updateVehicleStatus } from '@/lib/supabase';

type VehicleStatus = 'available' | 'maintenance' | 'on_route' | 'loading' | 'unloading';

type Location = {
  id: number;
  name: string;
  type: string;
};

interface Vehicle {
  id: string;
  registration_number: string;
  status: VehicleStatus;
  current_location?: Location;
}

interface StatusUpdateFormProps {
  vehicle: Vehicle | null;
  locations: Location[];
  onSuccess: () => void;
  onCancel: () => void;
}

const StatusUpdateForm: React.FC<StatusUpdateFormProps> = ({ 
  vehicle, 
  locations, 
  onSuccess, 
  onCancel 
}) => {
  const { toast } = useToast();
  const [newStatus, setNewStatus] = useState<VehicleStatus>('available');
  const [newLocationId, setNewLocationId] = useState('');

  useEffect(() => {
    if (vehicle) {
      setNewStatus(vehicle.status as VehicleStatus);
      setNewLocationId(vehicle.current_location?.id?.toString() || '');
    }
  }, [vehicle]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!vehicle) return;
    
    try {
      // Convert the vehicle.id from string to number before passing to updateVehicleStatus
      const result = await updateVehicleStatus(
        Number(vehicle.id),
        newStatus,
        newLocationId ? Number(newLocationId) : undefined
      );
      
      if (result.success) {
        toast({
          title: "Success",
          description: "Vehicle status updated successfully",
        });
        onSuccess();
      } else {
        throw new Error(result.error || "Failed to update vehicle status");
      }
    } catch (error) {
      console.error("Error updating vehicle status:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update vehicle status. Please try again.",
        variant: "destructive"
      });
    }
  };

  if (!vehicle) return null;

  return (
    <form onSubmit={handleSubmit}>
      <DialogHeader>
        <DialogTitle>Update Vehicle Status</DialogTitle>
        <DialogDescription>
          Update the status and location of {vehicle?.registration_number}
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="vehicle-status" className="col-span-4">
            Status
          </Label>
          <Select
            value={newStatus}
            onValueChange={(value: string) => setNewStatus(value as VehicleStatus)}
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
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit">Update Status</Button>
      </DialogFooter>
    </form>
  );
};

export default StatusUpdateForm;
