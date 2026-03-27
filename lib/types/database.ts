export type Profile = {
  id: string
  first_name: string | null
  last_name: string | null
  phone: string | null
  role: "admin" | "manager" | "sales" | "staff"
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export type Vehicle = {
  id: string
  vin: string | null
  make: string
  model: string
  year: number
  trim: string | null
  color: string | null
  mileage: number
  fuel_type: "gasoline" | "diesel" | "electric" | "hybrid" | "plugin_hybrid"
  transmission: "automatic" | "manual" | "cvt"
  body_type:
    | "sedan"
    | "suv"
    | "truck"
    | "coupe"
    | "convertible"
    | "van"
    | "wagon"
    | "hatchback"
    | "other"
    | null
  purchase_price: number | null
  listing_price: number | null
  status: "available" | "reserved" | "sold" | "in_transit" | "maintenance"
  description: string | null
  image_urls: string[]
  added_by: string | null
  created_at: string
  updated_at: string
}

export type Customer = {
  id: string
  first_name: string
  last_name: string
  email: string | null
  phone: string | null
  address: string | null
  city: string | null
  state: string | null
  zip_code: string | null
  driver_license: string | null
  notes: string | null
  created_by: string | null
  created_at: string
  updated_at: string
}

export type Sale = {
  id: string
  vehicle_id: string
  customer_id: string
  salesperson_id: string | null
  sale_price: number
  tax_amount: number
  total_amount: number
  payment_method: "cash" | "finance" | "lease" | "trade_in" | "other"
  financing_provider: string | null
  down_payment: number
  status: "pending" | "completed" | "cancelled" | "refunded"
  sale_date: string
  notes: string | null
  created_at: string
  updated_at: string
}

export type SaleWithDetails = Sale & {
  vehicle: Vehicle
  customer: Customer
  salesperson: Profile | null
}

export type Inquiry = {
  id: string
  vehicle_id: string | null
  customer_name: string
  email: string | null
  phone: string | null
  message: string | null
  source: "website" | "phone" | "walk_in" | "referral" | "social_media" | "other"
  status: "new" | "contacted" | "in_progress" | "converted" | "lost"
  assigned_to: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export type InquiryWithDetails = Inquiry & {
  vehicle: Vehicle | null
}

export type Expense = {
  id: string
  vehicle_id: string | null
  category:
    | "repair"
    | "maintenance"
    | "detailing"
    | "transport"
    | "registration"
    | "insurance"
    | "marketing"
    | "office"
    | "utilities"
    | "rent"
    | "payroll"
    | "other"
  description: string
  amount: number
  vendor: string | null
  expense_date: string
  receipt_url: string | null
  created_by: string | null
  created_at: string
  updated_at: string
}
