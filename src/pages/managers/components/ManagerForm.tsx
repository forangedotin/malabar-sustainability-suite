
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
import { createManager } from '@/lib/supabase';

interface ManagerFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const ManagerForm: React.FC<ManagerFormProps> = ({ onSuccess, onCancel }) => {
  const { toast } = useToast();
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    firstName?: string;
    lastName?: string;
  }>({});

  const validateForm = () => {
    const newErrors: {
      email?: string;
      password?: string;
      firstName?: string;
      lastName?: string;
    } = {};
    
    if (!email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Email is invalid';
    
    if (!password) newErrors.password = 'Password is required';
    else if (password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    
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
      const result = await createManager(
        email,
        password,
        firstName,
        lastName,
        phone
      );
      
      if (result.success) {
        toast({
          title: 'Manager account created',
          description: `New manager account for ${firstName} ${lastName} has been created`,
        });
        onSuccess();
      } else {
        throw new Error(
          typeof result.error === 'object' && result.error !== null && 'message' in result.error 
            ? result.error.message 
            : 'Failed to create manager account'
        );
      }
    } catch (error) {
      console.error('Error creating manager:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create manager account. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-h-[80vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Add New Manager</DialogTitle>
        <DialogDescription>
          Create a new manager account. They will receive login credentials to access the system.
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
            Email*
          </Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter email address"
            className={`col-span-3 ${errors.email ? 'border-red-500' : ''}`}
            required
          />
          {errors.email && (
            <div className="col-span-3 col-start-2 text-red-500 text-sm">{errors.email}</div>
          )}
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="password" className="text-right">
            Password*
          </Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            className={`col-span-3 ${errors.password ? 'border-red-500' : ''}`}
            required
          />
          {errors.password && (
            <div className="col-span-3 col-start-2 text-red-500 text-sm">{errors.password}</div>
          )}
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
          {isLoading ? 'Creating...' : 'Create Manager Account'}
        </Button>
      </DialogFooter>
    </form>
  );
};

export default ManagerForm;
