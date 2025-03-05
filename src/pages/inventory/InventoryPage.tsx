
import React, { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { Loader2, Package, Plus } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { getInventoryByGodown, getLocations } from '@/lib/supabase';

interface Inventory {
  id: number;
  godown_id: number;
  material: string;
  quantity: number;
  last_updated: string;
}

interface Location {
  id: number;
  name: string;
  type: 'godown' | 'collection_point';
}

const InventoryPage = () => {
  const [inventory, setInventory] = useState<Inventory[]>([]);
  const [godowns, setGodowns] = useState<Location[]>([]);
  const [selectedGodown, setSelectedGodown] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchGodowns = async () => {
      try {
        const locations = await getLocations('godown');
        setGodowns(locations);
        
        if (locations.length > 0) {
          setSelectedGodown(locations[0].id);
        }
      } catch (error) {
        console.error('Error fetching godowns:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGodowns();
  }, []);

  useEffect(() => {
    const fetchInventory = async () => {
      if (selectedGodown) {
        setIsLoading(true);
        try {
          const data = await getInventoryByGodown(selectedGodown);
          setInventory(data);
        } catch (error) {
          console.error('Error fetching inventory:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchInventory();
  }, [selectedGodown]);

  const handleGodownChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedGodown(Number(e.target.value));
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold tracking-tight">Inventory Management</h1>
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Add Stock
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center">
                <Package className="mr-2 h-5 w-5" />
                Current Inventory
              </CardTitle>
              <div className="flex items-center">
                <span className="mr-2 text-sm">Select Godown:</span>
                <select
                  className="border rounded p-1"
                  value={selectedGodown || ''}
                  onChange={handleGodownChange}
                >
                  {godowns.map((godown) => (
                    <option key={godown.id} value={godown.id}>
                      {godown.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : inventory.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No inventory found for this godown. Add stock to get started.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Material</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Last Updated</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inventory.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium capitalize">{item.material}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>{new Date(item.last_updated).toLocaleString()}</TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm">Update</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default InventoryPage;
