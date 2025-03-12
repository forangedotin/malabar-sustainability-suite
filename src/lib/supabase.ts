import { createClient } from '@supabase/supabase-js';
import { toast } from '@/hooks/use-toast';

const supabaseUrl = 'https://gvutttohyqrwqojajlpp.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd2dXR0dG9oeXFyd3FvamFqbHBwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEwODQ3MzAsImV4cCI6MjA1NjY2MDczMH0.rj0CMm3ibJl2Y5LjE0x-zJU__UTQisJ3YxTSFyOoi-U';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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

export async function createManager(email: string, password: string, firstName: string, lastName: string, phone?: string) {
  try {
    const { data, error } = await supabase.rpc('create_user_with_profile', {
      user_email: email,
      user_password: password,
      first_name: firstName,
      last_name: lastName,
      user_phone: phone || null,
      user_role: 'manager'
    });
    
    if (error) {
      console.error('Error creating manager:', error);
      return { success: false, error };
    }
    
    if (data?.error) {
      console.error('Error from function:', data.error);
      return { success: false, error: { message: data.error } };
    }
    
    const token = Math.random().toString(36).substring(2, 10);
    
    const inviteInfo = {
      email,
      password,
      token,
      name: `${firstName} ${lastName}`
    };
    
    console.log('Manager invite created:', inviteInfo);
    
    return { 
      success: true, 
      data: { 
        message: 'Manager account created successfully', 
        invite: inviteInfo 
      } 
    };
  } catch (error) {
    console.error('Error in createManager:', error);
    return { success: false, error };
  }
}

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

export async function createCollection(
  location_id: number,
  material: string,
  quantity: number,
  unit: string,
  amount_paid: number,
  notes?: string,
  commission_agent?: string | null,
  commission_amount?: number | null
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
      commission_agent,
      commission_amount
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
  
  const { data: locationData } = await supabase
    .from('locations')
    .select('id, type')
    .eq('id', location_id)
    .single();
    
  if (locationData?.type === 'collection_point') {
    const { data: godowns } = await supabase
      .from('locations')
      .select('id')
      .eq('type', 'godown')
      .limit(1);
      
    if (godowns && godowns.length > 0) {
      await updateInventory(godowns[0].id, material, quantity, 'add');
    }
  } else {
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
  
  const sourceUpdate = await updateInventory(
    fromGodownId,
    material,
    quantity,
    'subtract'
  );
  
  if (!sourceUpdate.success) {
    return sourceUpdate;
  }
  
  const destUpdate = await updateInventory(
    toGodownId,
    material,
    quantity,
    'add'
  );
  
  if (!destUpdate.success) {
    await updateInventory(
      fromGodownId,
      material,
      quantity,
      'add'
    );
    return destUpdate;
  }
  
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
  const inventoryUpdate = await updateInventory(
    godownId,
    material,
    quantity,
    'subtract'
  );
  
  if (!inventoryUpdate.success) {
    return inventoryUpdate;
  }
  
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

export async function getVehicles() {
  const { data, error } = await supabase
    .from('vehicles')
    .select(`
      *,
      current_location:locations(id, name, type)
    `)
    .order('registration_number');
    
  if (error) {
    console.error('Error fetching vehicles:', error);
    return [];
  }
  
  return data;
}

export async function getVehicleByToken(tokenCode: string) {
  const { data, error } = await supabase
    .from('vehicles')
    .select(`
      *,
      current_location:locations(id, name, type),
      assignments:vehicle_assignments(
        id,
        driver:drivers(*),
        is_active,
        assignment_date
      )
    `)
    .eq('token_code', tokenCode.toUpperCase())
    .eq('vehicle_assignments.is_active', true)
    .maybeSingle();
    
  if (error) {
    console.error('Error fetching vehicle by token:', error);
    return null;
  }
  
  return data;
}

export async function createVehicle(
  registrationNumber: string,
  type: 'truck' | 'pickup' | 'van' | 'auto' | 'other',
  capacity?: number,
  capacityUnit?: string,
  currentLocationId?: number,
  notes?: string
) {
  const { data, error } = await supabase
    .from('vehicles')
    .insert({
      registration_number: registrationNumber,
      type,
      capacity,
      capacity_unit: capacityUnit,
      current_location_id: currentLocationId,
      notes
    })
    .select()
    .single();
    
  if (error) {
    toast({
      title: 'Failed to create vehicle',
      description: error.message,
      variant: 'destructive',
    });
    return { success: false, error };
  }
  
  toast({
    title: 'Vehicle created',
    description: `Vehicle ${registrationNumber} has been added to the system`,
  });
  
  return { success: true, data, error: null };
}

export async function updateVehicleStatus(
  vehicleId: number,
  status: 'available' | 'maintenance' | 'on_route' | 'loading' | 'unloading',
  currentLocationId?: number
) {
  const updates: any = { status };
  
  if (currentLocationId) {
    updates.current_location_id = currentLocationId;
  }
  
  const { data, error } = await supabase
    .from('vehicles')
    .update(updates)
    .eq('id', vehicleId)
    .select()
    .single();
    
  if (error) {
    toast({
      title: 'Failed to update vehicle status',
      description: error.message,
      variant: 'destructive',
    });
    return { success: false, error };
  }
  
  toast({
    title: 'Vehicle status updated',
    description: `Vehicle status changed to ${status}`,
  });
  
  return { success: true, data, error: null };
}

export async function getDrivers() {
  const { data, error } = await supabase
    .from('drivers')
    .select('*')
    .order('name');
    
  if (error) {
    console.error('Error fetching drivers:', error);
    return [];
  }
  
  return data;
}

export async function getAvailableDrivers() {
  const { data, error } = await supabase
    .from('drivers')
    .select(`
      *,
      vehicle_assignments!inner(
        id,
        is_active
      )
    `)
    .eq('is_active', true)
    .eq('vehicle_assignments.is_active', false)
    .order('name');
    
  if (error) {
    console.error('Error fetching available drivers:', error);
    return [];
  }
  
  return data;
}

export async function createDriver(
  name: string,
  phone: string,
  licenseNumber: string,
  address?: string,
  notes?: string
) {
  const { data, error } = await supabase
    .from('drivers')
    .insert({
      name,
      phone,
      license_number: licenseNumber,
      address,
      notes,
      is_active: true
    })
    .select()
    .single();
    
  if (error) {
    toast({
      title: 'Failed to create driver',
      description: error.message,
      variant: 'destructive',
    });
    return { success: false, error };
  }
  
  toast({
    title: 'Driver created',
    description: `Driver ${name} has been added to the system`,
  });
  
  return { success: true, data, error: null };
}

export async function getVehicleAssignments(includeInactive = false) {
  let query = supabase
    .from('vehicle_assignments')
    .select(`
      *,
      vehicle:vehicles(*),
      driver:drivers(*)
    `);
  
  if (!includeInactive) {
    query = query.eq('is_active', true);
  }
  
  const { data, error } = await query.order('assignment_date', { ascending: false });
    
  if (error) {
    console.error('Error fetching vehicle assignments:', error);
    return [];
  }
  
  return data;
}

export async function assignVehicleToDriver(
  vehicleId: number,
  driverId: number,
  notes?: string
) {
  const user = await getCurrentUser();
  
  if (!user) {
    toast({
      title: 'Authentication required',
      description: 'You must be logged in to assign vehicles',
      variant: 'destructive',
    });
    return { success: false, error: { message: 'Authentication required' } };
  }
  
  const { data: existingAssignment } = await supabase
    .from('vehicle_assignments')
    .select('id')
    .eq('vehicle_id', vehicleId)
    .eq('is_active', true)
    .maybeSingle();
    
  if (existingAssignment) {
    await supabase
      .from('vehicle_assignments')
      .update({
        is_active: false,
        return_date: new Date().toISOString()
      })
      .eq('id', existingAssignment.id);
  }
  
  const { data, error } = await supabase
    .from('vehicle_assignments')
    .insert({
      vehicle_id: vehicleId,
      driver_id: driverId,
      created_by: user.id,
      notes,
      is_active: true
    })
    .select()
    .single();
    
  if (error) {
    toast({
      title: 'Failed to assign vehicle',
      description: error.message,
      variant: 'destructive',
    });
    return { success: false, error };
  }
  
  toast({
    title: 'Vehicle assigned',
    description: `Vehicle has been assigned to driver successfully`,
  });
  
  return { success: true, data, error: null };
}

export async function endVehicleAssignment(assignmentId: number) {
  const { data, error } = await supabase
    .from('vehicle_assignments')
    .update({
      is_active: false,
      return_date: new Date().toISOString()
    })
    .eq('id', assignmentId)
    .select()
    .single();
    
  if (error) {
    toast({
      title: 'Failed to end assignment',
      description: error.message,
      variant: 'destructive',
    });
    return { success: false, error };
  }
  
  toast({
    title: 'Assignment ended',
    description: `Vehicle assignment has been ended`,
  });
  
  return { success: true, data, error: null };
}

export async function getTrips() {
  const { data, error } = await supabase
    .from('trips')
    .select(`
      *,
      vehicle:vehicles(*),
      driver:drivers(*),
      from_location:locations!from_location_id(*),
      to_location:locations!to_location_id(*)
    `)
    .order('departure_time', { ascending: false });
    
  if (error) {
    console.error('Error fetching trips:', error);
    return [];
  }
  
  return data;
}

export async function createTrip(
  vehicleId: number,
  driverId: number,
  fromLocationId: number,
  toLocationId: number,
  materialCarried: string,
  quantity: number,
  unit: string,
  notes?: string,
  commissionAgent?: string,
  commissionAmount?: number
) {
  const user = await getCurrentUser();
  
  if (!user) {
    toast({
      title: 'Authentication required',
      description: 'You must be logged in to record trips',
      variant: 'destructive',
    });
    return { success: false, error: { message: 'Authentication required' } };
  }
  
  const { data, error } = await supabase
    .from('trips')
    .insert({
      vehicle_id: vehicleId,
      driver_id: driverId,
      from_location_id: fromLocationId,
      to_location_id: toLocationId,
      material_carried: materialCarried,
      quantity,
      unit,
      created_by: user.id,
      commission_agent: commissionAgent,
      commission_amount: commissionAmount,
      notes
    })
    .select()
    .single();
    
  if (error) {
    toast({
      title: 'Failed to create trip',
      description: error.message,
      variant: 'destructive',
    });
    return { success: false, error };
  }
  
  await updateVehicleStatus(vehicleId, 'on_route', fromLocationId);
  
  toast({
    title: 'Trip created',
    description: `Trip has been recorded successfully`,
  });
  
  return { success: true, data, error: null };
}

export async function updateTrip(
  tripId: number,
  vehicleId: number,
  driverId: number,
  fromLocationId: number,
  toLocationId: number,
  materialCarried: string,
  quantity: number,
  unit: string,
  notes?: string,
  commissionAgent?: string,
  commissionAmount?: number
) {
  const { data, error } = await supabase
    .from('trips')
    .update({
      vehicle_id: vehicleId,
      driver_id: driverId,
      from_location_id: fromLocationId,
      to_location_id: toLocationId,
      material_carried: materialCarried,
      quantity,
      unit,
      commission_agent: commissionAgent,
      commission_amount: commissionAmount,
      notes
    })
    .eq('id', tripId)
    .select();
    
  if (error) {
    toast({
      title: 'Failed to update trip',
      description: error.message,
      variant: 'destructive',
    });
    return { success: false, error };
  }
  
  toast({
    title: 'Trip updated',
    description: `Trip has been updated successfully`,
  });
  
  return { success: true, data, error: null };
}

export async function completeTrip(
  tripId: number,
  vehicleId: number,
  toLocationId: number
) {
  const { data, error } = await supabase
    .from('trips')
    .update({
      status: 'completed',
      arrival_time: new Date().toISOString()
    })
    .eq('id', tripId)
    .select()
    .single();
    
  if (error) {
    toast({
      title: 'Failed to complete trip',
      description: error.message,
      variant: 'destructive',
    });
    return { success: false, error };
  }
  
  await updateVehicleStatus(vehicleId, 'available', toLocationId);
  
  toast({
    title: 'Trip completed',
    description: `Trip has been marked as completed`,
  });
  
  return { success: true, data, error: null };
}

export const generateTripToken = (trip: any) => {
  const fromPrefix = trip.from_location?.name?.substring(0, 3).toUpperCase() || 'LOC';
  const toPrefix = trip.to_location?.name?.substring(0, 3).toUpperCase() || 'LOC';
  
  const materialPrefix = trip.material_carried?.substring(0, 2).toUpperCase() || 'MT';
  
  const date = new Date(trip.departure_time);
  const dateString = `${date.getDate()}${date.getMonth() + 1}${date.getFullYear().toString().substring(2)}`;
  
  const randomPart = Math.random().toString(36).substring(2, 5).toUpperCase();
  
  return `${fromPrefix}-${toPrefix}-${materialPrefix}${dateString}-${randomPart}`;
};

export const updateTripWithToken = async (tripId: number, token: string) => {
  const { data, error } = await supabase
    .from('trips')
    .update({ token_code: token })
    .eq('id', tripId)
    .select();
    
  if (error) {
    console.error('Error updating trip with token:', error);
    return { success: false, error };
  }
  
  return { success: true, data };
};

export async function getMaterials() {
  const { data, error } = await supabase
    .from('materials')
    .select('*')
    .eq('is_active', true)
    .order('name');
    
  if (error) {
    console.error('Error fetching materials:', error);
    return [];
  }
  
  return data;
}

export async function createMaterial(name: string, category: string) {
  const { data, error } = await supabase
    .from('materials')
    .insert({
      name,
      category
    })
    .select()
    .single();
    
  if (error) {
    toast({
      title: 'Failed to create material',
      description: error.message,
      variant: 'destructive',
    });
    return { success: false, error };
  }
  
  toast({
    title: 'Material created',
    description: `${name} has been added to materials`,
  });
  
  return { success: true, data, error: null };
}

export const updateExpense = async (
  expenseId: number,
  category: string,
  amount: number,
  paidTo: string,
  locationId?: number,
  notes?: string
) => {
  try {
    const { data, error } = await supabase
      .from('expenses')
      .update({
        category,
        amount,
        paid_to: paidTo,
        location_id: locationId,
        notes,
        updated_at: new Date()
      })
      .eq('id', expenseId)
      .select();

    if (error) {
      console.error('Error updating expense:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error updating expense:', error);
    return { success: false, error };
  }
};
