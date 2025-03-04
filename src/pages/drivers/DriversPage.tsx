
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
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  User,
  Search,
  Plus,
  RefreshCw,
  Phone,
  Loader2,
  ClipboardCheck,
  MapPin
} from 'lucide-react';
import { getDrivers, createDriver } from '@/lib/supabase';
import { Badge } from '@/components/ui/badge';

const DriversPage = () => {
  const { profile } = useAuth();
  const [drivers, setDrivers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [openAddDriver, setOpenAddDriver] = useState(false);
  
  // Form states for new driver
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  
  const fetchDrivers = async () => {
    setIsLoading(true);
    const driversData = await getDrivers();
    setDrivers(driversData || []);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchDrivers();
  }, []);

  const handleAddDriver = async (e) => {
    e.preventDefault();
    
    const result = await createDriver(
      name,
      phone,
      licenseNumber,
      address,
      notes
    );
    
    if (result.success) {
      setOpenAddDriver(false);
      resetDriverForm();
      fetchDrivers();
    }
  };

  const resetDriverForm = () => {
    setName('');
    setPhone('');
    setLicenseNumber('');
    setAddress('');
    setNotes('');
  };

  const filteredDrivers = drivers.filter(driver => 
    driver.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    driver.phone.includes(searchQuery) ||
    driver.license_number.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Drivers</h1>
            <p className="text-muted-foreground">
              Manage drivers and their details
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <Dialog open={openAddDriver} onOpenChange={setOpenAddDriver}>
              <DialogTrigger asChild>
                <Button className="w-full sm:w-auto">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Driver
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleAddDriver}>
                  <DialogHeader>
                    <DialogTitle>Add New Driver</DialogTitle>
                    <DialogDescription>
                      Enter details about the new driver to add to the system.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="name" className="col-span-4">
                        Full Name
                      </Label>
                      <Input
                        id="name"
                        placeholder="Driver's full name"
                        className="col-span-4"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="phone" className="col-span-4">
                        Phone Number
                      </Label>
                      <Input
                        id="phone"
                        placeholder="+91 XXXXXXXXXX"
                        className="col-span-4"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        required
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="license" className="col-span-4">
                        License Number
                      </Label>
                      <Input
                        id="license"
                        placeholder="DL-XXXXXXXXXXXX"
                        className="col-span-4"
                        value={licenseNumber}
                        onChange={(e) => setLicenseNumber(e.target.value)}
                        required
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="address" className="col-span-4">
                        Address
                      </Label>
                      <Textarea
                        id="address"
                        placeholder="Driver's address"
                        className="col-span-4"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="driver-notes" className="col-span-4">
                        Notes
                      </Label>
                      <Textarea
                        id="driver-notes"
                        placeholder="Any additional information about the driver"
                        className="col-span-4"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit">Add Driver</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="flex w-full items-center space-x-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search drivers by name, phone, or license number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1"
          />
          <Button variant="outline" size="icon" onClick={fetchDrivers}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Drivers</CardTitle>
            <CardDescription>
              Total drivers: {drivers.length}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredDrivers.length > 0 ? (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>License Number</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Address</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDrivers.map((driver) => (
                      <TableRow key={driver.id}>
                        <TableCell>
                          <div className="font-medium">{driver.name}</div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Phone className="mr-1 h-3 w-3" />
                            {driver.phone}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <ClipboardCheck className="mr-1 h-3 w-3" />
                            {driver.license_number}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            className={driver.is_active ? "bg-green-500" : "bg-red-500"}
                          >
                            {driver.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {driver.address ? (
                            <div className="flex items-center">
                              <MapPin className="mr-1 h-3 w-3" />
                              {driver.address.length > 30 
                                ? `${driver.address.substring(0, 30)}...` 
                                : driver.address}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">Not provided</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-8 text-center">
                <User className="h-10 w-10 text-muted-foreground" />
                <h3 className="mt-2 text-lg font-semibold">No drivers found</h3>
                {searchQuery ? (
                  <p className="text-muted-foreground">
                    No results for "{searchQuery}". Try another search term.
                  </p>
                ) : (
                  <p className="text-muted-foreground">
                    No drivers added yet. Add your first driver to get started.
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

export default DriversPage;
