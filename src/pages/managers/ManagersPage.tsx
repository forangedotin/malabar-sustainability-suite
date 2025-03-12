import React, { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Users, User, UserPlus, Edit, Trash2, CheckCircle } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from '@/components/ui/alert-dialog';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/lib/supabase';
import ManagerForm from './components/ManagerForm';
import { useToast } from '@/components/ui/use-toast';
import EditManagerForm from './components/EditManagerForm';

interface Manager {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  created_at: string;
  active: boolean;
}

const ManagersPage = () => {
  const { isAdmin } = useAuth();
  const [managers, setManagers] = useState<Manager[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [openAddManager, setOpenAddManager] = useState(false);
  const [openEditManager, setOpenEditManager] = useState(false);
  const [currentManager, setCurrentManager] = useState<Manager | null>(null);
  const [managerToDelete, setManagerToDelete] = useState<Manager | null>(null);
  const { toast } = useToast();

  const fetchManagers = async () => {
    setIsLoading(true);
    try {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'manager')
        .order('created_at', { ascending: false });
          
      if (error) {
        throw error;
      }
      
      setManagers(profiles || []);
    } catch (error) {
      console.error('Error fetching managers:', error);
      toast({
        title: 'Error',
        description: 'Failed to load managers. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchManagers();
  }, []);

  const handleManagerAdded = () => {
    setOpenAddManager(false);
    fetchManagers();
  };

  const handleEditManager = (manager: Manager) => {
    setCurrentManager(manager);
    setOpenEditManager(true);
  };

  const handleManagerUpdated = () => {
    setOpenEditManager(false);
    setCurrentManager(null);
    fetchManagers();
  };

  const handleDeleteManager = async () => {
    if (!managerToDelete) return;
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ active: false })
        .eq('id', managerToDelete.id);
        
      if (error) throw error;
      
      toast({
        title: 'Manager deactivated',
        description: `${managerToDelete.first_name} ${managerToDelete.last_name} has been deactivated`
      });
      
      setManagerToDelete(null);
      fetchManagers();
    } catch (error) {
      console.error('Error deactivating manager:', error);
      toast({
        title: 'Error',
        description: 'Failed to deactivate manager. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const handleActivateManager = async (manager: Manager) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ active: true })
        .eq('id', manager.id);
        
      if (error) throw error;
      
      toast({
        title: 'Manager activated',
        description: `${manager.first_name} ${manager.last_name} has been activated`
      });
      
      fetchManagers();
    } catch (error) {
      console.error('Error activating manager:', error);
      toast({
        title: 'Error',
        description: 'Failed to activate manager. Please try again.',
        variant: 'destructive'
      });
    }
  };

  if (!isAdmin) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center h-full py-12">
          <User className="h-16 w-16 text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold mb-2">Access Restricted</h2>
          <p className="text-muted-foreground max-w-md text-center">
            You need administrator privileges to access the managers page.
          </p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold tracking-tight">Manager Accounts</h1>
          <Dialog open={openAddManager} onOpenChange={setOpenAddManager}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="mr-2 h-4 w-4" /> Add Manager
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <ManagerForm 
                onSuccess={handleManagerAdded} 
                onCancel={() => setOpenAddManager(false)} 
              />
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="mr-2 h-5 w-5" />
              Manager Accounts
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : managers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No manager accounts found. Add a new manager using the button above.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {managers.map((manager) => (
                    <TableRow key={manager.id}>
                      <TableCell className="font-medium">
                        {manager.first_name} {manager.last_name}
                      </TableCell>
                      <TableCell>{manager.email}</TableCell>
                      <TableCell>{manager.phone || 'N/A'}</TableCell>
                      <TableCell>{new Date(manager.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          manager.active 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {manager.active ? 'Active' : 'Inactive'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleEditManager(manager)}
                          >
                            <Edit className="h-4 w-4 mr-1" /> Edit
                          </Button>
                          
                          {manager.active ? (
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="text-red-600"
                              onClick={() => setManagerToDelete(manager)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          ) : (
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="text-green-600"
                              onClick={() => handleActivateManager(manager)}
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Edit Manager Dialog */}
      <Dialog open={openEditManager} onOpenChange={setOpenEditManager}>
        <DialogContent className="sm:max-w-[600px]">
          {currentManager && (
            <EditManagerForm 
              manager={currentManager}
              onSuccess={handleManagerUpdated} 
              onCancel={() => setOpenEditManager(false)} 
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Manager Confirmation */}
      <AlertDialog 
        open={!!managerToDelete} 
        onOpenChange={(open) => !open && setManagerToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will deactivate the manager account for {managerToDelete?.first_name} {managerToDelete?.last_name}.
              They will no longer be able to access the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteManager} className="bg-red-600 hover:bg-red-700">
              Deactivate
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
};

export default ManagersPage;
