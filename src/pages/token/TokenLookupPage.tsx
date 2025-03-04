
import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  AlertCircle,
  Truck,
  User,
  Package,
  MapPin,
  Calendar,
  Loader2,
  Search
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { getVehicleByToken } from '@/lib/supabase';
import { format } from 'date-fns';

const statusColors = {
  available: 'bg-green-500',
  maintenance: 'bg-yellow-500',
  on_route: 'bg-blue-500',
  loading: 'bg-purple-500',
  unloading: 'bg-orange-500'
};

const TokenLookupPage = () => {
  const [tokenCode, setTokenCode] = useState('');
  const [vehicle, setVehicle] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLookup = async () => {
    if (!tokenCode.trim()) {
      setError('Please enter a token code');
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      const vehicleData = await getVehicleByToken(tokenCode);
      
      if (!vehicleData) {
        setError('No vehicle found with this token code');
        setVehicle(null);
      } else {
        setVehicle(vehicleData);
      }
    } catch (err) {
      console.error('Error fetching vehicle:', err);
      setError('An error occurred while looking up the vehicle');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Vehicle Token Lookup</h1>
          <p className="text-muted-foreground">
            Look up vehicle information using the token code
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Enter Token Code</CardTitle>
            <CardDescription>
              Enter the 6-character token code to find vehicle information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex w-full items-center space-x-2">
              <Input
                placeholder="Enter token code (e.g., ABC123)"
                value={tokenCode}
                onChange={(e) => setTokenCode(e.target.value.toUpperCase())}
                maxLength={6}
                className="font-mono uppercase"
              />
              <Button onClick={handleLookup} disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Search className="mr-2 h-4 w-4" />
                )}
                Lookup
              </Button>
            </div>

            {error && (
              <Alert variant="destructive" className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {vehicle && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Truck className="mr-2 h-5 w-5" />
                Vehicle Information
              </CardTitle>
              <CardDescription>
                Details for vehicle with token code: <span className="font-mono">{vehicle.token_code}</span>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-muted-foreground">Registration Number</h3>
                  <p className="text-lg font-semibold">{vehicle.registration_number}</p>
                </div>
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-muted-foreground">Vehicle Type</h3>
                  <p className="text-lg font-semibold capitalize">{vehicle.type}</p>
                </div>
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
                  <Badge 
                    className={statusColors[vehicle.status] || 'bg-gray-500'}
                  >
                    {vehicle.status.replace('_', ' ')}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-muted-foreground">Capacity</h3>
                  <p className="text-lg font-semibold">
                    {vehicle.capacity} {vehicle.capacity_unit || 'units'}
                  </p>
                </div>
              </div>
              
              <div className="rounded-lg border p-4">
                <h3 className="mb-2 font-semibold flex items-center">
                  <MapPin className="mr-2 h-4 w-4" />
                  Current Location
                </h3>
                {vehicle.current_location ? (
                  <div>
                    <p className="text-md font-medium">{vehicle.current_location.name}</p>
                    <p className="text-sm text-muted-foreground capitalize">
                      {vehicle.current_location.type}
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Location not set</p>
                )}
              </div>
              
              {vehicle.assignments && vehicle.assignments.length > 0 && vehicle.assignments[0].is_active && (
                <div className="rounded-lg border p-4">
                  <h3 className="mb-2 font-semibold flex items-center">
                    <User className="mr-2 h-4 w-4" />
                    Current Driver
                  </h3>
                  <div>
                    <p className="text-md font-medium">{vehicle.assignments[0].driver.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Phone: {vehicle.assignments[0].driver.phone}
                    </p>
                    <p className="text-xs text-muted-foreground flex items-center mt-1">
                      <Calendar className="mr-1 h-3 w-3" />
                      Assigned on {format(new Date(vehicle.assignments[0].assignment_date), 'dd MMM yyyy')}
                    </p>
                  </div>
                </div>
              )}
              
              {vehicle.notes && (
                <div className="rounded-lg border p-4">
                  <h3 className="mb-2 font-semibold">Notes</h3>
                  <p className="text-sm">{vehicle.notes}</p>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <p className="text-xs text-muted-foreground">
                This token code can be used by anyone to look up this vehicle's information.
              </p>
            </CardFooter>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default TokenLookupPage;
