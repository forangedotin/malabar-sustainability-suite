
export type UserRole = 'admin' | 'manager';

export interface UserProfile {
  id: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  phone?: string;
  created_at: string;
}

export type LocationType = 'godown' | 'collection_point';

export interface Location {
  id: number;
  name: string;
  address: string;
  district: string;
  type: LocationType;
  contact_phone?: string;
  created_at: string;
}

export interface CollectionEntry {
  id: number;
  location_id: number;
  location?: {
    name: string;
    district: string;
    type: LocationType;
  };
  collected_by: string;
  material_type: string;
  quantity: number;
  unit: string;
  amount_paid: number;
  notes?: string;
  collection_date: string;
}

export interface InventoryItem {
  id: number;
  godown_id: number;
  material_type: string;
  quantity: number;
  last_updated: string;
}

export type PaymentStatus = 'paid' | 'pending' | 'payment_required';

export interface Sale {
  id: number;
  godown_id: number;
  godown?: {
    name: string;
    district: string;
  };
  buyer_name: string;
  material_type: string;
  quantity: number;
  unit: string;
  sale_amount: number;
  payment_status: PaymentStatus;
  amount_due: number;
  notes?: string;
  sale_date: string;
}

export interface StockTransfer {
  id: number;
  from_godown_id: number;
  to_godown_id: number;
  from_godown?: {
    name: string;
    district: string;
  };
  to_godown?: {
    name: string;
    district: string;
  };
  material_type: string;
  quantity: number;
  transferred_by: string;
  notes?: string;
  transfer_date: string;
}

export interface Expense {
  id: number;
  category: string;
  amount: number;
  paid_by: string;
  paid_to: string;
  location_id?: number;
  location?: {
    name: string;
    district: string;
    type: LocationType;
  };
  notes?: string;
  expense_date: string;
}

export const MATERIAL_TYPES = [
  'Plastic - PET',
  'Plastic - HDPE',
  'Plastic - LDPE',
  'Plastic - PP',
  'Plastic - Mixed',
  'Paper - White',
  'Paper - Newspaper',
  'Paper - Cardboard',
  'Paper - Mixed',
  'Metal - Aluminum',
  'Metal - Copper',
  'Metal - Iron',
  'Metal - Mixed',
  'Glass - Clear',
  'Glass - Green',
  'Glass - Brown',
  'Glass - Mixed',
  'E-waste',
  'Organic Waste',
  'Textile Waste',
  'Other'
];

export const DISTRICTS = [
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
  'Wayanad'
];

export const EXPENSE_CATEGORIES = [
  'Vehicle Fuel',
  'Vehicle Maintenance',
  'Staff Salary',
  'Rent',
  'Electricity',
  'Water',
  'Internet & Phone',
  'Equipment',
  'Machinery Maintenance',
  'Transportation',
  'Packaging Materials',
  'Marketing',
  'Processing Costs',
  'Administrative',
  'Insurance',
  'Taxes',
  'Waste Disposal Fees',
  'Other'
];
