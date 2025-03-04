
import { createClient } from '@supabase/supabase-js';
import { toast } from '@/components/ui/use-toast';

// These are public keys - they can be exposed in client code
const supabaseUrl = 'https://gvutttohyqrwqojajlpp.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd2dXR0dG9oeXFyd3FvamFqbHBwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEwODQ3MzAsImV4cCI6MjA1NjY2MDczMH0.rj0CMm3ibJl2Y5LjE0x-zJU__UTQisJ3YxTSFyOoi-U';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Auth helpers
export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  if (error) {
    toast({
      title: 'Login failed',
      description: error.message,
      variant: 'destructive',
    });
    return { user: null, error };
  }
  
  return { user: data.user, error: null };
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  
  if (error) {
    toast({
      title: 'Sign out failed',
      description: error.message,
      variant: 'destructive',
    });
  }
}

export async function getCurrentUser() {
  const { data } = await supabase.auth.getUser();
  return data?.user;
}

export async function getUserRole() {
  const user = await getCurrentUser();
  
  if (!user) return null;
  
  const { data, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();
    
  if (error || !data) return null;
  
  return data.role;
}

// Create a manager account (admin only)
export async function createManager(email: string, password: string, firstName: string, lastName: string, phone: string) {
  // First check if user is admin
  const isAdmin = await getUserRole() === 'admin';
  if (!isAdmin) {
    toast({
      title: 'Unauthorized',
      description: 'Only admins can create manager accounts',
      variant: 'destructive',
    });
    return { success: false, error: { message: 'Unauthorized' } };
  }
  
  // 1. Create auth user
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    data: {
      first_name: firstName,
      last_name: lastName,
      role: 'manager'
    }
  });
  
  if (error) {
    toast({
      title: 'Failed to create user',
      description: error.message,
      variant: 'destructive',
    });
    return { success: false, error };
  }
  
  // 2. Update phone number in profile
  const { error: profileError } = await supabase
    .from('profiles')
    .update({ phone })
    .eq('id', data.user.id);
    
  if (profileError) {
    toast({
      title: 'Failed to update profile',
      description: profileError.message,
      variant: 'destructive',
    });
  }
  
  toast({
    title: 'Manager created',
    description: `Manager account for ${firstName} ${lastName} has been created`,
  });
  
  return { success: true, error: null };
}

// Get user profile
export async function getProfile() {
  const user = await getCurrentUser();
  
  if (!user) return null;
  
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();
    
  if (error) {
    console.error('Error fetching profile:', error);
    return null;
  }
  
  return data;
}

// Locations helpers
export async function getLocations(type?: 'godown' | 'collection_point') {
  let query = supabase.from('locations').select('*');
  
  if (type) {
    query = query.eq('type', type);
  }
  
  const { data, error } = await query.order('name');
  
  if (error) {
    console.error('Error fetching locations:', error);
    return [];
  }
  
  return data;
}

export async function createLocation(name: string, address: string, district: string, type: 'godown' | 'collection_point', contactPhone?: string) {
  const { data, error } = await supabase
    .from('locations')
    .insert({
      name,
      address,
      district,
      type,
      contact_phone: contactPhone,
    })
    .select()
    .single();
    
  if (error) {
    toast({
      title: 'Failed to create location',
      description: error.message,
      variant: 'destructive',
    });
    return { success: false, error };
  }
  
  toast({
    title: 'Location created',
    description: `${type === 'godown' ? 'Godown' : 'Collection point'} ${name} has been created`,
  });
  
  return { success: true, data, error: null };
}

// Collections helpers
export async function createCollection(
  location_id: number,
  material: string,
  quantity: number,
  unit: string,
  amount_paid: number,
  notes?: string
) {
  const user = await getCurrentUser();
  
  if (!user) {
    toast({
      title: 'Authentication required',
      description: 'You must be logged in to record collections',
      variant: 'destructive',
    });
    return { success: false, error: { message: 'Authentication required' } };
  }
  
  const { data, error } = await supabase
    .from('collections')
    .insert({
      location_id,
      collected_by: user.id,
      material,
      quantity,
      unit,
      amount_paid,
      notes,
    })
    .select()
    .single();
    
  if (error) {
    toast({
      title: 'Failed to record collection',
      description: error.message,
      variant: 'destructive',
    });
    return { success: false, error };
  }
  
  toast({
    title: 'Collection recorded',
    description: `${quantity} ${unit} of ${material} collected`,
  });
  
  // Update inventory for the corresponding godown
  const { data: locationData } = await supabase
    .from('locations')
    .select('id, type')
    .eq('id', location_id)
    .single();
    
  if (locationData?.type === 'collection_point') {
    // Find the closest godown (for simplicity, just get the first godown)
    const { data: godowns } = await supabase
      .from('locations')
      .select('id')
      .eq('type', 'godown')
      .limit(1);
      
    if (godowns && godowns.length > 0) {
      await updateInventory(godowns[0].id, material, quantity, 'add');
    }
  } else {
    // Collection was at godown, directly update its inventory
    await updateInventory(location_id, material, quantity, 'add');
  }
  
  return { success: true, data, error: null };
}

export async function getDailyCollections(date: string) {
  const startDate = new Date(date);
  startDate.setHours(0, 0, 0, 0);
  
  const endDate = new Date(date);
  endDate.setHours(23, 59, 59, 999);
  
  const { data, error } = await supabase
    .from('collections')
    .select(`
      *,
      location:locations(name, district, type)
    `)
    .gte('collection_date', startDate.toISOString())
    .lte('collection_date', endDate.toISOString())
    .order('collection_date', { ascending: false });
    
  if (error) {
    console.error('Error fetching collections:', error);
    return [];
  }
  
  return data;
}

// Inventory helpers
export async function getInventoryByGodown(godownId: number) {
  const { data, error } = await supabase
    .from('inventory')
    .select('*')
    .eq('godown_id', godownId);
    
  if (error) {
    console.error('Error fetching inventory:', error);
    return [];
  }
  
  return data;
}

export async function updateInventory(
  godownId: number, 
  material: string, 
  quantity: number, 
  operation: 'add' | 'subtract'
) {
  // First check if the material exists in inventory
  const { data: existing, error: fetchError } = await supabase
    .from('inventory')
    .select('*')
    .eq('godown_id', godownId)
    .eq('material', material)
    .maybeSingle();
    
  if (fetchError) {
    console.error('Error checking inventory:', fetchError);
    return { success: false, error: fetchError };
  }
  
  let newQuantity: number;
  
  if (existing) {
    // Update existing inventory
    newQuantity = operation === 'add' 
      ? existing.quantity + quantity 
      : existing.quantity - quantity;
      
    if (newQuantity < 0) {
      toast({
        title: 'Insufficient inventory',
        description: 'Not enough inventory for this operation',
        variant: 'destructive',
      });
      return { 
        success: false, 
        error: { message: 'Insufficient inventory for this operation' } 
      };
    }
    
    const { error: updateError } = await supabase
      .from('inventory')
      .update({ quantity: newQuantity, last_updated: new Date().toISOString() })
      .eq('id', existing.id);
      
    if (updateError) {
      console.error('Error updating inventory:', updateError);
      return { success: false, error: updateError };
    }
  } else if (operation === 'add') {
    // Create new inventory entry
    const { error: insertError } = await supabase
      .from('inventory')
      .insert({
        godown_id: godownId,
        material,
        quantity,
      });
      
    if (insertError) {
      console.error('Error creating inventory:', insertError);
      return { success: false, error: insertError };
    }
  } else {
    // Trying to subtract from non-existent inventory
    toast({
      title: 'Inventory error',
      description: 'Cannot subtract from non-existent inventory',
      variant: 'destructive',
    });
    return { 
      success: false, 
      error: { message: 'Cannot subtract from non-existent inventory' } 
    };
  }
  
  return { success: true, error: null };
}

// Stock transfers
export async function transferStock(
  fromGodownId: number,
  toGodownId: number,
  material: string,
  quantity: number,
  notes?: string
) {
  const user = await getCurrentUser();
  
  if (!user) {
    toast({
      title: 'Authentication required',
      description: 'You must be logged in to transfer stock',
      variant: 'destructive',
    });
    return { success: false, error: { message: 'Authentication required' } };
  }
  
  // First subtract from source godown
  const sourceUpdate = await updateInventory(
    fromGodownId,
    material,
    quantity,
    'subtract'
  );
  
  if (!sourceUpdate.success) {
    return sourceUpdate;
  }
  
  // Add to destination godown
  const destUpdate = await updateInventory(
    toGodownId,
    material,
    quantity,
    'add'
  );
  
  if (!destUpdate.success) {
    // Revert the source update
    await updateInventory(
      fromGodownId,
      material,
      quantity,
      'add'
    );
    return destUpdate;
  }
  
  // Record the transfer
  const { data, error } = await supabase
    .from('stock_transfers')
    .insert({
      from_godown_id: fromGodownId,
      to_godown_id: toGodownId,
      material,
      quantity,
      transferred_by: user.id,
      notes,
    })
    .select()
    .single();
    
  if (error) {
    console.error('Error recording transfer:', error);
    
    // Attempt to revert both inventory changes
    await updateInventory(
      fromGodownId,
      material,
      quantity,
      'add'
    );
    
    await updateInventory(
      toGodownId,
      material,
      quantity,
      'subtract'
    );
    
    toast({
      title: 'Transfer failed',
      description: error.message,
      variant: 'destructive',
    });
    
    return { success: false, error };
  }
  
  toast({
    title: 'Stock transferred',
    description: `${quantity} units of ${material} transferred successfully`,
  });
  
  return { success: true, data, error: null };
}

// Sales helpers
export async function recordSale(
  godownId: number,
  buyerName: string,
  material: string,
  quantity: number,
  unit: string,
  saleAmount: number,
  paymentStatus: 'paid' | 'pending' | 'payment_required',
  amountDue: number = 0,
  notes?: string
) {
  // First update inventory
  const inventoryUpdate = await updateInventory(
    godownId,
    material,
    quantity,
    'subtract'
  );
  
  if (!inventoryUpdate.success) {
    return inventoryUpdate;
  }
  
  // Then record the sale
  const { data, error } = await supabase
    .from('sales')
    .insert({
      godown_id: godownId,
      buyer_name: buyerName,
      material,
      quantity,
      unit,
      sale_amount: saleAmount,
      payment_status: paymentStatus,
      amount_due: amountDue,
      notes,
    })
    .select()
    .single();
    
  if (error) {
    console.error('Error recording sale:', error);
    
    // Revert inventory change
    await updateInventory(
      godownId,
      material,
      quantity,
      'add'
    );
    
    toast({
      title: 'Sale recording failed',
      description: error.message,
      variant: 'destructive',
    });
    
    return { success: false, error };
  }
  
  toast({
    title: 'Sale recorded',
    description: `Sale of ${quantity} ${unit} of ${material} to ${buyerName} recorded`,
  });
  
  return { success: true, data, error: null };
}

// Expenses
export async function recordExpense(
  category: string,
  amount: number,
  paidTo: string,
  locationId?: number,
  notes?: string
) {
  const user = await getCurrentUser();
  
  if (!user) {
    toast({
      title: 'Authentication required',
      description: 'You must be logged in to record expenses',
      variant: 'destructive',
    });
    return { success: false, error: { message: 'Authentication required' } };
  }
  
  const { data, error } = await supabase
    .from('expenses')
    .insert({
      category,
      amount,
      paid_by: user.id,
      paid_to: paidTo,
      location_id: locationId,
      notes,
    })
    .select()
    .single();
    
  if (error) {
    console.error('Error recording expense:', error);
    
    toast({
      title: 'Expense recording failed',
      description: error.message,
      variant: 'destructive',
    });
    
    return { success: false, error };
  }
  
  toast({
    title: 'Expense recorded',
    description: `Expense of ${amount} for ${category} recorded`,
  });
  
  return { success: true, data, error: null };
}
