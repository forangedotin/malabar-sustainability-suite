
import React, { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { createLocation, getLocations } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth';
import { Loader2, MapPin, Plus } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface Location {
  id: number;
  name: string;
  type: 'godown' | 'collection_point';
  address: string;
  district: string;
  contact_phone?: string;
  created_at: string;
}

const LocationsPage = () => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const { isAdmin } = useAuth();
  const { toast } = useToast();

  // Form state
  const [formState, setFormState] = useState({
    name: '',
    type: 'godown' as 'godown' | 'collection_point',
    address: '',
    district: '',
    contactPhone: '',
  });

  const districts = [
    'Alappuzha',
    'Ernakulam',
    'Idukki',
    'Kannur',
    'Kasaragod',
    'Kollam',
    'Kottayam',
    'Kozhikode',
    'Malappuram',
    'Palakkad',
    'Pathanamthitta',
    'Thiruvananthapuram',
    'Thrissur',
    'Wayanad',
  ];

  useEffect(() => {
    fetchLocations();
  }, [activeTab]);

  const fetchLocations = async () => {
    setIsLoading(true);
    try {
      let fetchedLocations;
      
      if (activeTab === 'godowns') {
        fetchedLocations = await getLocations('godown');
      } else if (activeTab === 'collection_points') {
        fetchedLocations = await getLocations('collection_point');
      } else {
        fetchedLocations = await getLocations();
      }
      
      setLocations(fetchedLocations);
    } catch (error) {
      console.error('Error fetching locations:', error);
      toast({
        title: 'Error',
        description: 'Failed to load locations',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const { name, type, address, district, contactPhone } = formState;
    
    const result = await createLocation(name, address, district, type, contactPhone);
    
    if (result.success) {
      setIsDialogOpen(false);
      fetchLocations();
      resetForm();
    }
  };

  const resetForm = () => {
    setFormState({
      name: '',
      type: 'godown',
      address: '',
      district: '',
      contactPhone: '',
    });
  };

  const getLocationTypeDisplay = (type: string) => {
    return type === 'godown' ? 'Godown' : 'Collection Point';
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Locations</h1>
            <p className="text-muted-foreground">
              Manage your godowns and collection points across Kerala
            </p>
          </div>
          {isAdmin && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Location
                </Button>
              </DialogTrigger>
              <DialogContent>
                <form onSubmit={handleSubmit}>
                  <DialogHeader>
                    <DialogTitle>Add New Location</DialogTitle>
                    <DialogDescription>
                      Fill in the details for the new location
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Location Name</Label>
                      <Input
                        id="name"
                        name="name"
                        placeholder="Enter location name"
                        value={formState.name}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="type">Location Type</Label>
                      <Select
                        value={formState.type}
                        onValueChange={(value) => handleSelectChange('type', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select location type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="godown">Godown</SelectItem>
                          <SelectItem value="collection_point">Collection Point</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address">Address</Label>
                      <Input
                        id="address"
                        name="address"
                        placeholder="Enter full address"
                        value={formState.address}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="district">District</Label>
                      <Select
                        value={formState.district}
                        onValueChange={(value) => handleSelectChange('district', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select district" />
                        </SelectTrigger>
                        <SelectContent>
                          {districts.map((district) => (
                            <SelectItem key={district} value={district}>
                              {district}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contactPhone">Contact Phone (Optional)</Label>
                      <Input
                        id="contactPhone"
                        name="contactPhone"
                        placeholder="Enter contact phone"
                        value={formState.contactPhone}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit">Add Location</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>

        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="godowns">Godowns</TabsTrigger>
            <TabsTrigger value="collection_points">Collection Points</TabsTrigger>
          </TabsList>
          <TabsContent value="all" className="mt-6">
            {renderLocations()}
          </TabsContent>
          <TabsContent value="godowns" className="mt-6">
            {renderLocations()}
          </TabsContent>
          <TabsContent value="collection_points" className="mt-6">
            {renderLocations()}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );

  function renderLocations() {
    if (isLoading) {
      return (
        <div className="flex h-40 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      );
    }

    if (locations.length === 0) {
      return (
        <div className="flex h-40 flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
          <MapPin className="h-10 w-10 text-muted-foreground/80" />
          <h3 className="mt-4 text-lg font-semibold">No locations found</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            {isAdmin
              ? "You haven't added any locations yet. Add your first location to get started."
              : "There are no locations in this category yet."}
          </p>
          {isAdmin && (
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => setIsDialogOpen(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Location
            </Button>
          )}
        </div>
      );
    }

    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {locations.map((location) => (
          <Card key={location.id}>
            <CardHeader>
              <CardTitle className="flex items-center">
                {location.name}
              </CardTitle>
              <CardDescription>
                {getLocationTypeDisplay(location.type)} · {location.district}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm">
                <div className="font-medium">Address</div>
                <div className="text-muted-foreground">{location.address}</div>
                {location.contact_phone && (
                  <>
                    <div className="mt-2 font-medium">Contact</div>
                    <div className="text-muted-foreground">{location.contact_phone}</div>
                  </>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button variant="outline" size="sm">
                View Details
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }
};

export default LocationsPage;
