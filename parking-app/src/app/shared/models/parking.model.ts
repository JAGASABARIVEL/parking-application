import { User } from "./user.model";

// shared/models/parking.model.ts
export interface ParkingSpace {
  id: number;
  owner: User;
  title: string;
  description: string;
  address: string;
  city: string;
  area: string;
  landmark: string;
  location: GeoLocation;
  space_type: 'garage' | 'open' | 'covered' | 'private';
  total_spaces: number;
  available_spaces: number;
  price_per_day: number;
  price_per_week: number;
  price_per_month: number;
  price_per_year: number;
  max_vehicle_height: number;
  max_vehicle_length: number;
  max_vehicle_width: number;
  allowed_vehicle_types: string[];
  has_security_camera: boolean;
  has_lighting: boolean;
  has_ev_charging: boolean;
  has_surveillance: boolean;
  has_covered: boolean;
  has_24_7_access: boolean;
  available_from: string;
  available_until: string;
  accepted_payment_methods: string[];
  image: string;
  images: ParkingSpaceImage[];
  rating: number;
  total_bookings: number;
  total_reviews: number;
  status: 'available' | 'booked' | 'inactive';
  created_at: string;
  distance?: number;
}

export interface ParkingSpaceImage {
  id: number;
  image: string;
  uploaded_at: string;
}

export interface GeoLocation {
  type: string;
  coordinates: [number, number]; // [longitude, latitude]
}