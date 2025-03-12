
import React, { useState, useEffect } from 'react';
import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';

interface TripFormProps {
  trip?: any;
  onSuccess: () => void;
  onCancel: () => void;
}

const TripForm: React.FC<TripFormProps> = ({ trip, onSuccess, onCancel }) => {
  const { toast } = useToast();
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [locations, setLocations] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Form state
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const [selectedDriverId, setSelectedDriverId] = useState('');
  const [fromLocationId, setFromLocationId] = useState('');
  const [toLocationId, setToLocationId] = useState('');
  const [materialId, setMaterialId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('');
  const [commissionAgent, setCommissionAgent] = useState('');
  const [commissionAmount, setCommissionAmount] = useState('');
  const [notes, setNotes] = useState('');
  
  useEffect(() => {
    fetchFormData();
  }, []);
  
  useEffect(() => {
    if (trip && materials.length > 0) {
      setSelectedVehicleId(trip.vehicle_id.toString());
      setSelectedDriverId(trip.driver_id.toString());
      setFromLocationId(trip.from_location_id.toString());
      setToLocationId(trip.to_location_id.toString());
      setQuantity(trip.quantity?.toString() || '');
      setUnit(trip.unit || '');
      setCommissionAgent(trip.commission_agent || '');
      setCommissionAmount(trip.commission_amount?.toString() || '');
      setNotes(trip.notes || '');
      
      // Fix for material handling - find material by name
      if (trip.material_carried) {
        const matchingMaterial = materials.find(m => m.name.toLowerCase() === (trip.material_carried.toLowerCase ? trip.material_carried.toLowerCase() : ''));
        if (matchingMaterial) {
          setMaterialId(matchingMaterial.id.toString());
        } else {
          console.warn('Material not found:', trip.material_carried);
          // If no match found but we have materials, default to first one
          if (materials.length > 0) {
            setMaterialId(materials[0].id.toString());
          }
        }
      }
    }
  }, [trip, materials]);
  
  const fetchFormData = async () => {
    try {
      const [vehiclesData, driversData, locationsData, materialsData] = await Promise.all([
        fetchVehicles(),
        fetchDrivers(),
        fetchLocations(),
        fetchMaterials()
      ]);
      
      setVehicles(vehiclesData || []);
      setDrivers(driversData || []);
      setLocations(locationsData || []);
      setMaterials(materialsData || []);
      
      // Set default values for new trip
      if (!trip) {
        if (vehiclesData.length > 0) setSelectedVehicleId(vehiclesData[0].id.toString());
        if (driversData.length > 0) setSelectedDriverId(driversData[0].id.toString());
        if (locationsData.length > 0) {
          setFromLocationId(locationsData[0].id.toString());
          if (locationsData.length > 1) setToLocationId(locationsData[1].id.toString());
          else setToLocationId(locationsData[0].id.toString());
        }
        if (materialsData.length > 0) setMaterialId(materialsData[0].id.toString());
      }
    } catch (error) {
      console.error('Error fetching form data:', error);
      toast({
        title: 'Data loading error',
        description: 'Could not load necessary data for the form.',
        variant: 'destructive'
      });
    }
  };
  
  const fetchVehicles = async () => {
    const { data, error } = await supabase
      .from('vehicles')
      .select('*')
      .order('registration_number');
      
    if (error) {
      console.error('Error fetching vehicles:', error);
      return [];
    }
    
    return data;
  };
  
  const fetchDrivers = async () => {
    const { data, error } = await supabase
      .from('drivers')
      .select('*')
      .order('name');
      
    if (error) {
      console.error('Error fetching drivers:', error);
      return [];
    }
    
    return data;
  };
  
  const fetchLocations = async () => {
    const { data, error } = await supabase
      .from('locations')
      .select('*')
      .order('name');
      
    if (error) {
      console.error('Error fetching locations:', error);
      return [];
    }
    
    return data;
  };
  
  const fetchMaterials = async () => {
    const { data, error } = await supabase
      .from('materials')
      .select('*')
      .eq('is_active', true)
      .order('name');
      
    if (error) {
      console.error('Error fetching materials:', error);
      return [];
    }
    
    return data;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedVehicleId || !selectedDriverId || !fromLocationId || !toLocationId || !materialId || !quantity || !unit) {
      toast({
        title: 'Missing information',
        description: 'Please fill in all required fields.',
        variant: 'destructive'
      });
      return;
    }
    
    setIsLoading(true);
    try {
      // Find the selected material name
      const selectedMaterial = materials.find(m => m.id.toString() === materialId);
      if (!selectedMaterial) {
        throw new Error('Selected material not found');
      }
      
      if (trip) {
        // Update existing trip
        const { data, error } = await supabase
          .from('trips')
          .update({
            vehicle_id: Number(selectedVehicleId),
            driver_id: Number(selectedDriverId),
            from_location_id: Number(fromLocationId),
            to_location_id: Number(toLocationId),
            material_carried: selectedMaterial.name,
            quantity: Number(quantity),
            unit,
            commission_agent: commissionAgent || null,
            commission_amount: commissionAmount ? Number(commissionAmount) : null,
            notes
          })
          .eq('id', trip.id)
          .select();
          
        if (error) {
          throw error;
        }
        
        toast({
          title: 'Trip updated',
          description: 'The trip has been updated successfully.'
        });
      } else {
        // Create new trip
        const { data, error } = await supabase
          .from('trips')
          .insert({
            vehicle_id: Number(selectedVehicleId),
            driver_id: Number(selectedDriverId),
            from_location_id: Number(fromLocationId),
            to_location_id: Number(toLocationId),
            material_carried: selectedMaterial.name,
            quantity: Number(quantity),
            unit,
            commission_agent: commissionAgent || null,
            commission_amount: commissionAmount ? Number(commissionAmount) : null,
            notes,
            created_by: (await supabase.auth.getUser()).data.user?.id
          })
          .select();
          
        if (error) {
          throw error;
        }
        
        toast({
          title: 'Trip created',
          description: 'The trip has been recorded successfully.'
        });
      }
      
      onSuccess();
    } catch (error) {
      console.error('Error saving trip:', error);
      toast({
        title: 'Failed to save trip',
        description: error.message || 'Please try again later.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <DialogHeader>
        <DialogTitle>{trip ? 'Edit Trip' : 'Record New Trip'}</DialogTitle>
        <DialogDescription>
          {trip 
            ? 'Update trip details to track vehicle movement and material transport.' 
            : 'Enter trip details to track vehicle movement and material transport.'}
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="vehicle">Vehicle*</Label>
            <Select
              value={selectedVehicleId}
              onValueChange={setSelectedVehicleId}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select vehicle" />
              </SelectTrigger>
              <SelectContent>
                {vehicles.map((vehicle) => (
                  <SelectItem key={vehicle.id} value={vehicle.id.toString()}>
                    {vehicle.registration_number} ({vehicle.type})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="driver">Driver*</Label>
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
            <Label htmlFor="from-location">From Location*</Label>
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
            <Label htmlFor="to-location">To Location*</Label>
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
            <Label htmlFor="material">Material*</Label>
            <Select
              value={materialId}
              onValueChange={setMaterialId}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select material" />
              </SelectTrigger>
              <SelectContent>
                {materials.map((material) => (
                  <SelectItem key={material.id} value={material.id.toString()}>
                    {material.name} ({material.category})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity*</Label>
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
              <Label htmlFor="unit">Unit*</Label>
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
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="commission-agent">Commission Agent</Label>
            <Input
              id="commission-agent"
              placeholder="Agent name"
              value={commissionAgent}
              onChange={(e) => setCommissionAgent(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="commission-amount">Commission Amount</Label>
            <Input
              id="commission-amount"
              type="number"
              placeholder="0.00"
              value={commissionAmount}
              onChange={(e) => setCommissionAmount(e.target.value)}
            />
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
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : trip ? 'Update Trip' : 'Start Trip'}
        </Button>
      </DialogFooter>
    </form>
  );
};

export default TripForm;
