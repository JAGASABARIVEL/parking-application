import { ParkingSpace } from "./parking.model";
import { DriverVehicle, User } from "./user.model";

// shared/models/booking.model.ts
export interface Booking {
  id: number;
  driver: User;
  parking_space: ParkingSpace;
  vehicle: DriverVehicle;
  booking_type: 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly';
  start_datetime: string;
  end_datetime: string;
  status: BookingStatus;
  base_price: number;
  discount: number;
  total_price: number;
  special_instructions: string;
  location_tracking: LocationTracking;
  review: Review;
  created_at: string;
  updated_at: string;
}

export type BookingStatus = 
  | 'pending_payment'
  | 'confirmed'
  | 'active'
  | 'arrived'
  | 'parked'
  | 'completed'
  | 'cancelled';

export interface LocationTracking {
  id: number;
  current_latitude: number;
  current_longitude: number;
  destination_latitude: number;
  destination_longitude: number;
  distance_remaining: number;
  eta_minutes: number;
  is_tracking_active: boolean;
  reached_destination: boolean;
  reached_at: string;
  updated_at: string;
}

export interface Review {
  id: number;
  booking: number;
  reviewer_name: string;
  reviewed_user_name: string;
  rating: number;
  comment: string;
  tags: string[];
  created_at: string;
}