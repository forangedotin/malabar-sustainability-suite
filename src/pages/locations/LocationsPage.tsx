
import { useState } from 'react';
import {
  MapPin,
  Warehouse,
  Plus,
  Search,
  Phone,
  MapPinned,
  Building,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { EmptyState } from '@/components/EmptyState';
import { useAuth } from '@/contexts/AuthContext';
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
import { DISTRICTS, LocationType } from '@/types';

export default function LocationsPage() {
  const { role } = useAuth();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Mock data for locations
  const godowns = [
    {
      id: 1,
      name: 'Malappuram Central Godown',
      address: '45 Industrial Area, Malappuram',
      district: 'Malappuram',
      contact: '+91 9876543210',
    },
    {
      id: 2,
      name: 'Thrissur Storage Facility',
      address: '12 Warehouse Zone, Thrissur',
      district: 'Thrissur',
      contact: '+91 9876543211',
    },
  ];

  const collectionPoints = [
    {
      id: 1,
      name: 'Kozhikode Central Collection',
      address: '78 Market Road, Kozhikode',
      district: 'Kozhikode',
      contact: '+91 9876543212',
    },
    {
      id: 2,
      name: 'Palakkad Junction Hub',
      address: '23 Station Road, Palakkad',
      district: 'Palakkad',
      contact: '+91 9876543213',
    },
    {
      id: 3,
      name: 'Kannur Collection Point',
      address: '56 Beach Road, Kannur',
      district: 'Kannur',
      contact: '+91 9876543214',
    },
  ];

  // Filter locations based on search query
  const filteredGodowns = godowns.filter(location =>
    location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    location.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
    location.district.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredCollectionPoints = collectionPoints.filter(location =>
    location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    location.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
    location.district.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="animate-fade-in">
      <header className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Locations</h1>
          <p className="text-muted-foreground mt-1">
            Manage godowns and collection points
          </p>
        </div>

        {role === 'admin' && (
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Location
          </Button>
        )}
      </header>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search locations..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <Tabs defaultValue="all" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="all">All Locations</TabsTrigger>
          <TabsTrigger value="godowns">Godowns</TabsTrigger>
          <TabsTrigger value="collection-points">Collection Points</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-6">
          <h2 className="text-xl font-semibold mb-4">Godowns</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredGodowns.length > 0 ? (
              filteredGodowns.map((location) => (
                <LocationCard
                  key={location.id}
                  name={location.name}
                  address={location.address}
                  district={location.district}
                  contact={location.contact}
                  type="godown"
                />
              ))
            ) : (
              <div className="md:col-span-2 lg:col-span-3">
                <EmptyState
                  icon={<Warehouse className="h-5 w-5 text-muted-foreground" />}
                  title="No godowns found"
                  description="We couldn't find any godowns matching your search."
                />
              </div>
            )}
          </div>

          <h2 className="text-xl font-semibold mb-4">Collection Points</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredCollectionPoints.length > 0 ? (
              filteredCollectionPoints.map((location) => (
                <LocationCard
                  key={location.id}
                  name={location.name}
                  address={location.address}
                  district={location.district}
                  contact={location.contact}
                  type="collection-point"
                />
              ))
            ) : (
              <div className="md:col-span-2 lg:col-span-3">
                <EmptyState
                  icon={<MapPin className="h-5 w-5 text-muted-foreground" />}
                  title="No collection points found"
                  description="We couldn't find any collection points matching your search."
                />
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="godowns" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredGodowns.length > 0 ? (
              filteredGodowns.map((location) => (
                <LocationCard
                  key={location.id}
                  name={location.name}
                  address={location.address}
                  district={location.district}
                  contact={location.contact}
                  type="godown"
                />
              ))
            ) : (
              <div className="md:col-span-2 lg:col-span-3">
                <EmptyState
                  icon={<Warehouse className="h-5 w-5 text-muted-foreground" />}
                  title="No godowns found"
                  description="We couldn't find any godowns matching your search."
                />
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="collection-points" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredCollectionPoints.length > 0 ? (
              filteredCollectionPoints.map((location) => (
                <LocationCard
                  key={location.id}
                  name={location.name}
                  address={location.address}
                  district={location.district}
                  contact={location.contact}
                  type="collection-point"
                />
              ))
            ) : (
              <div className="md:col-span-2 lg:col-span-3">
                <EmptyState
                  icon={<MapPin className="h-5 w-5 text-muted-foreground" />}
                  title="No collection points found"
                  description="We couldn't find any collection points matching your search."
                />
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      <AddLocationDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
      />
    </div>
  );
}

interface LocationCardProps {
  name: string;
  address: string;
  district: string;
  contact: string;
  type: 'godown' | 'collection-point';
}

function LocationCard({ name, address, district, contact, type }: LocationCardProps) {
  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <div className={`p-1 ${type === 'godown' ? 'bg-eco-blue-500' : 'bg-eco-green-500'}`} />
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-semibold">{name}</CardTitle>
          {type === 'godown' ? (
            <Warehouse className="h-5 w-5 text-eco-blue-500" />
          ) : (
            <MapPin className="h-5 w-5 text-eco-green-500" />
          )}
        </div>
        <CardDescription>
          {type === 'godown' ? 'Storage Facility' : 'Collection Point'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-start">
          <MapPinned className="h-4 w-4 mr-2 text-muted-foreground" />
          <div className="text-sm">
            <p>{address}</p>
            <p className="text-muted-foreground">{district} District</p>
          </div>
        </div>
        <div className="flex items-center">
          <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
          <span className="text-sm">{contact}</span>
        </div>
      </CardContent>
    </Card>
  );
}

interface AddLocationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function AddLocationDialog({ open, onOpenChange }: AddLocationDialogProps) {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [district, setDistrict] = useState('');
  const [type, setType] = useState<LocationType>('godown');
  const [contact, setContact] = useState('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here we would add the location to the database
    
    // For now we'll just close the dialog and reset the form
    onOpenChange(false);
    resetForm();
  };
  
  const resetForm = () => {
    setName('');
    setAddress('');
    setDistrict('');
    setType('godown');
    setContact('');
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Location</DialogTitle>
          <DialogDescription>
            Add a new godown or collection point to the system.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Location Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter location name"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="type">Location Type</Label>
            <Select value={type} onValueChange={(value: LocationType) => setType(value)}>
              <SelectTrigger id="type">
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
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Enter full address"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="district">District</Label>
            <Select value={district} onValueChange={setDistrict}>
              <SelectTrigger id="district">
                <SelectValue placeholder="Select district" />
              </SelectTrigger>
              <SelectContent>
                {DISTRICTS.map((dist) => (
                  <SelectItem key={dist} value={dist}>
                    {dist}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="contact">Contact Number</Label>
            <Input
              id="contact"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              placeholder="Enter contact number"
            />
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              <Building className="mr-2 h-4 w-4" />
              Add Location
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
