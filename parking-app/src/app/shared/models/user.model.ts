// shared/models/user.model.ts
export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  user_type: 'user' | 'owner' | 'both';
  profile_picture: string;
  bio: string;
  owner_rating: number;
  owner_total_reviews: number;
  driver_rating: number;
  driver_total_reviews: number;
  is_verified: boolean;
  phone_verified: boolean;
  email_verified: boolean;
  created_at: string;
}

export interface AuthResponse {
  user: User;
  access: string;
  refresh: string;
}

export interface DriverVehicle {
  id: number;
  vehicle_number: string;
  vehicle_type: string;
  vehicle_model: string;
  vehicle_color: string;
  dl_number: string;
  dl_expiry_date: string;
  length_in_meters: number;
  height_in_meters: number;
  width_in_meters: number;
  is_active: boolean;
  created_at: string;
}