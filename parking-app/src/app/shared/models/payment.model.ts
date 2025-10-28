// shared/models/payment.model.ts
export interface Payment {
  id: number;
  booking: number;
  amount: number;
  payment_method: 'cod' | 'razorpay' | 'wallet';
  status: 'initiated' | 'pending' | 'completed' | 'failed' | 'refunded';
  razorpay_order_id: string;
  razorpay_payment_id: string;
  created_at: string;
  updated_at: string;
}

export interface RazorpayOrderResponse {
  payment_id: number;
  razorpay_order_id: string;
  amount: number;
  currency: string;
  key_id: string;
}