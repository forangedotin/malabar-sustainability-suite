
import { createClient } from '@supabase/supabase-js';
import { toast } from '@/components/ui/use-toast';

// These are public keys - they can be exposed in client code
const supabaseUrl = 'https://supabaseprojecturl.supabase.co';
const supabaseAnonKey = 'your-anon-key'; // Replace this once you connect your Supabase project

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

// Profiles helpers
export async function getProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
    
  if (error) {
    console.error('Error fetching profile:', error);
    return null;
  }
  
  return data;
}

export async function createManager(email: string, password: string, firstName: string, lastName: string, phone: string) {
  // 1. Create auth user
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  
  if (authError) {
    toast({
      title: 'Failed to create user',
      description: authError.message,
      variant: 'destructive',
    });
    return { success: false, error: authError };
  }
  
  // 2. Create profile for user
  const { error: profileError } = await supabase
    .from('profiles')
    .insert({
      id: authData.user.id,
      first_name: firstName,
      last_name: lastName,
      phone,
      role: 'manager',
    });
    
  if (profileError) {
    toast({
      title: 'Failed to create profile',
      description: profileError.message,
      variant: 'destructive',
    });
    return { success: false, error: profileError };
  }
  
  return { success: true, error: null };
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
  
  return { success: true, data, error: null };
}

// Collections helpers
export async function createCollection(
  location_id: number,
  collected_by: string,
  material_type: string,
  quantity: number,
  unit: string,
  amount_paid: number,
  notes?: string
) {
  const { data, error } = await supabase
    .from('collections')
    .insert({
      location_id,
      collected_by,
      material_type,
      quantity,
      unit,
      amount_paid,
      notes,
      collection_date: new Date().toISOString(),
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
  materialType: string, 
  quantity: number, 
  operation: 'add' | 'subtract'
) {
  // First check if the material exists in inventory
  const { data: existing, error: fetchError } = await supabase
    .from('inventory')
    .select('*')
    .eq('godown_id', godownId)
    .eq('material_type', materialType)
    .single();
    
  if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
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
        material_type: materialType,
        quantity,
        last_updated: new Date().toISOString()
      });
      
    if (insertError) {
      console.error('Error creating inventory:', insertError);
      return { success: false, error: insertError };
    }
  } else {
    // Trying to subtract from non-existent inventory
    return { 
      success: false, 
      error: { message: 'Cannot subtract from non-existent inventory' } 
    };
  }
  
  return { success: true, error: null };
}

// Sales helpers
export async function recordSale(
  godownId: number,
  buyerName: string,
  materialType: string,
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
    materialType,
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
      material_type: materialType,
      quantity,
      unit,
      sale_amount: saleAmount,
      payment_status: paymentStatus,
      amount_due: amountDue,
      notes,
      sale_date: new Date().toISOString()
    })
    .select()
    .single();
    
  if (error) {
    console.error('Error recording sale:', error);
    
    // Revert inventory change
    await updateInventory(
      godownId,
      materialType,
      quantity,
      'add'
    );
    
    return { success: false, error };
  }
  
  return { success: true, data, error: null };
}

export async function getSales(startDate?: string, endDate?: string) {
  let query = supabase
    .from('sales')
    .select(`
      *,
      godown:locations(name, district)
    `)
    .order('sale_date', { ascending: false });
    
  if (startDate) {
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    query = query.gte('sale_date', start.toISOString());
  }
  
  if (endDate) {
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    query = query.lte('sale_date', end.toISOString());
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error('Error fetching sales:', error);
    return [];
  }
  
  return data;
}

// Stock transfers
export async function transferStock(
  fromGodownId: number,
  toGodownId: number,
  materialType: string,
  quantity: number,
  transferredBy: string,
  notes?: string
) {
  // First subtract from source godown
  const sourceUpdate = await updateInventory(
    fromGodownId,
    materialType,
    quantity,
    'subtract'
  );
  
  if (!sourceUpdate.success) {
    return sourceUpdate;
  }
  
  // Add to destination godown
  const destUpdate = await updateInventory(
    toGodownId,
    materialType,
    quantity,
    'add'
  );
  
  if (!destUpdate.success) {
    // Revert the source update
    await updateInventory(
      fromGodownId,
      materialType,
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
      material_type: materialType,
      quantity,
      transferred_by: transferredBy,
      notes,
      transfer_date: new Date().toISOString()
    })
    .select()
    .single();
    
  if (error) {
    console.error('Error recording transfer:', error);
    
    // Attempt to revert both inventory changes
    await updateInventory(
      fromGodownId,
      materialType,
      quantity,
      'add'
    );
    
    await updateInventory(
      toGodownId,
      materialType,
      quantity,
      'subtract'
    );
    
    return { success: false, error };
  }
  
  return { success: true, data, error: null };
}

// Expenses
export async function recordExpense(
  category: string,
  amount: number,
  paidBy: string,
  paidTo: string,
  locationId?: number,
  notes?: string
) {
  const { data, error } = await supabase
    .from('expenses')
    .insert({
      category,
      amount,
      paid_by: paidBy,
      paid_to: paidTo,
      location_id: locationId,
      notes,
      expense_date: new Date().toISOString()
    })
    .select()
    .single();
    
  if (error) {
    console.error('Error recording expense:', error);
    return { success: false, error };
  }
  
  return { success: true, data, error: null };
}

export async function getExpenses(startDate?: string, endDate?: string, category?: string) {
  let query = supabase
    .from('expenses')
    .select(`
      *,
      location:locations(name, district, type)
    `)
    .order('expense_date', { ascending: false });
    
  if (startDate) {
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    query = query.gte('expense_date', start.toISOString());
  }
  
  if (endDate) {
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    query = query.lte('expense_date', end.toISOString());
  }
  
  if (category) {
    query = query.eq('category', category);
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error('Error fetching expenses:', error);
    return [];
  }
  
  return data;
}
