
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
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase';

interface Manager {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  active: boolean;
}

interface EditManagerFormProps {
  manager: Manager;
  onSuccess: () => void;
  onCancel: () => void;
}

const EditManagerForm: React.FC<EditManagerFormProps> = ({ manager, onSuccess, onCancel }) => {
  const { toast } = useToast();
  const [firstName, setFirstName] = useState<string>(manager.first_name);
  const [lastName, setLastName] = useState<string>(manager.last_name);
  const [phone, setPhone] = useState<string>(manager.phone || '');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState<{
    firstName?: string;
    lastName?: string;
  }>({});

  const validateForm = () => {
    const newErrors: {
      firstName?: string;
      lastName?: string;
    } = {};
    
    if (!firstName) newErrors.firstName = 'First name is required';
    if (!lastName) newErrors.lastName = 'Last name is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: firstName,
          last_name: lastName,
          phone: phone || null,
        })
        .eq('id', manager.id);
      
      if (error) throw error;
      
      toast({
        title: 'Manager updated',
        description: `${firstName} ${lastName}'s information has been updated`,
      });
      onSuccess();
    } catch (error) {
      console.error('Error updating manager:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update manager. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <DialogHeader>
        <DialogTitle>Edit Manager</DialogTitle>
        <DialogDescription>
          Update manager information. Email cannot be changed.
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="first-name" className="text-right">
            First Name*
          </Label>
          <Input
            id="first-name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="Enter first name"
            className={`col-span-3 ${errors.firstName ? 'border-red-500' : ''}`}
            required
          />
          {errors.firstName && (
            <div className="col-span-3 col-start-2 text-red-500 text-sm">{errors.firstName}</div>
          )}
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="last-name" className="text-right">
            Last Name*
          </Label>
          <Input
            id="last-name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Enter last name"
            className={`col-span-3 ${errors.lastName ? 'border-red-500' : ''}`}
            required
          />
          {errors.lastName && (
            <div className="col-span-3 col-start-2 text-red-500 text-sm">{errors.lastName}</div>
          )}
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="email" className="text-right">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            value={manager.email}
            readOnly
            className="col-span-3 bg-gray-100"
          />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="phone" className="text-right">
            Phone
          </Label>
          <Input
            id="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Enter phone number (optional)"
            className="col-span-3"
          />
        </div>
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Save Changes'}
        </Button>
      </DialogFooter>
    </form>
  );
};

export default EditManagerForm;
