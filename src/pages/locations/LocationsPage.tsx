
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
  MapPin,
  Building,
  Loader2,
  Phone
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { getLocations, createLocation } from '@/lib/supabase';

const LocationsPage = () => {
  const [locations, setLocations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [openAddLocation, setOpenAddLocation] = useState(false);
  const { toast } = useToast();
  
  // Form states
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [district, setDistrict] = useState('');
  const [type, setType] = useState('');
  const [contactPhone, setContactPhone] = useState('');

  const fetchLocations = async () => {
    setIsLoading(true);
    try {
      const locationsData = await getLocations();
      setLocations(locationsData || []);
    } catch (error) {
      console.error('Error fetching locations:', error);
      toast({
        title: 'Failed to load locations',
        description: 'Please try again later.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  const handleAddLocation = async (e) => {
    e.preventDefault();
    
    if (!name || !address || !district || !type) {
      toast({
        title: 'Missing information',
        description: 'Please fill in all required fields.',
        variant: 'destructive'
      });
      return;
    }
    
    try {
      const result = await createLocation(
        name,
        address,
        district,
        type as 'godown' | 'collection_point',
        contactPhone || undefined
      );
      
      if (result.success) {
        setOpenAddLocation(false);
        resetForm();
        fetchLocations();
        toast({
          title: 'Location created',
          description: `${name} has been added successfully.`
        });
      }
    } catch (error) {
      console.error('Error creating location:', error);
      toast({
        title: 'Failed to create location',
        description: 'Please try again later.',
        variant: 'destructive'
      });
    }
  };

  const resetForm = () => {
    setName('');
    setAddress('');
    setDistrict('');
    setType('');
    setContactPhone('');
  };

  const filteredLocations = locations.filter(location => 
    location.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    location.district?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    location.type?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getLocationTypeLabel = (type) => {
    return type === 'godown' ? 'Godown' : 'Collection Point';
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Locations</h1>
            <p className="text-muted-foreground">
              Manage godowns and collection points
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <Dialog open={openAddLocation} onOpenChange={setOpenAddLocation}>
              <DialogTrigger asChild>
                <Button className="w-full sm:w-auto">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Location
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[550px]">
                <form onSubmit={handleAddLocation}>
                  <DialogHeader>
                    <DialogTitle>Add New Location</DialogTitle>
                    <DialogDescription>
                      Enter details to add a new godown or collection point.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-1 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Location Name</Label>
                        <Input
                          id="name"
                          placeholder="Enter location name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="district">District</Label>
                        <Input
                          id="district"
                          placeholder="Enter district"
                          value={district}
                          onChange={(e) => setDistrict(e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="type">Location Type</Label>
                        <Select
                          value={type}
                          onValueChange={setType}
                          required
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="godown">Godown</SelectItem>
                            <SelectItem value="collection_point">Collection Point</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address">Address</Label>
                      <Textarea
                        id="address"
                        placeholder="Enter full address"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contact_phone">Contact Phone (Optional)</Label>
                      <Input
                        id="contact_phone"
                        placeholder="Enter contact phone number"
                        value={contactPhone}
                        onChange={(e) => setContactPhone(e.target.value)}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" type="button" onClick={() => setOpenAddLocation(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">Save Location</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="flex w-full items-center space-x-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search locations by name, district or type..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1"
          />
          <Button variant="outline" size="icon" onClick={fetchLocations}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle>All Locations</CardTitle>
            <CardDescription>
              {locations.length} locations registered in the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredLocations.length > 0 ? (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>District</TableHead>
                      <TableHead>Address</TableHead>
                      <TableHead>Contact</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLocations.map((location) => (
                      <TableRow key={location.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-primary" />
                            {location.name}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Building className="h-4 w-4" />
                            {getLocationTypeLabel(location.type)}
                          </div>
                        </TableCell>
                        <TableCell>{location.district}</TableCell>
                        <TableCell className="max-w-xs truncate">{location.address}</TableCell>
                        <TableCell>
                          {location.contact_phone ? (
                            <div className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {location.contact_phone}
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-sm">Not provided</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-8 text-center">
                <MapPin className="h-10 w-10 text-muted-foreground" />
                <h3 className="mt-2 text-lg font-semibold">No locations found</h3>
                {searchQuery ? (
                  <p className="text-muted-foreground">
                    No results for "{searchQuery}". Try another search term.
                  </p>
                ) : (
                  <p className="text-muted-foreground">
                    No locations have been added yet. Add your first location to get started.
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

export default LocationsPage;
