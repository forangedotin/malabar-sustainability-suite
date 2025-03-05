
import React, { useState } from 'react';
import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { createVehicle } from '@/lib/supabase';

type VehicleType = 'truck' | 'pickup' | 'van' | 'auto' | 'other';

type Location = {
  id: number;
  name: string;
  type: string;
};

interface VehicleFormProps {
  locations: Location[];
  onSuccess: () => void;
  onCancel: () => void;
}

const VehicleForm: React.FC<VehicleFormProps> = ({ locations, onSuccess, onCancel }) => {
  const { toast } = useToast();
  const [regNumber, setRegNumber] = useState('');
  const [vehicleType, setVehicleType] = useState<VehicleType>('truck');
  const [capacity, setCapacity] = useState('');
  const [capacityUnit, setCapacityUnit] = useState('');
  const [locationId, setLocationId] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const result = await createVehicle(
        regNumber,
        vehicleType,
        capacity ? Number(capacity) : undefined,
        capacityUnit,
        locationId ? Number(locationId) : undefined,
        notes
      );
      
      if (result.success) {
        toast({
          title: "Success",
          description: "Vehicle added successfully",
        });
        resetForm();
        onSuccess();
      } else {
        throw new Error(result.error || "Failed to add vehicle");
      }
    } catch (error) {
      console.error("Error adding vehicle:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to add vehicle. Please try again.",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setRegNumber('');
    setVehicleType('truck');
    setCapacity('');
    setCapacityUnit('');
    setLocationId('');
    setNotes('');
  };

  return (
    <form onSubmit={handleSubmit}>
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
            onValueChange={(value: string) => setVehicleType(value as VehicleType)}
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
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit">Add Vehicle</Button>
      </DialogFooter>
    </form>
  );
};

export default VehicleForm;
