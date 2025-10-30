// core/services/payment.service.ts - Production Ready
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { catchError, retry, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

declare var Razorpay: any;

export interface PaymentRequest {
  booking_id: number;
  amount: number;
  payment_method: 'cod' | 'razorpay' | 'wallet' | 'upi';
  currency?: string;
}

export interface PaymentResponse {
  id: number;
  booking_id: number;
  amount: number;
  payment_method: string;
  status: PaymentStatus;
  transaction_id: string;
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  created_at: string;
  updated_at: string;
  refund_details?: RefundDetails;
}

export interface RefundDetails {
  id: number;
  original_payment_id: number;
  refund_amount: number;
  refund_method: string;
  status: RefundStatus;
  reason: string;
  created_at: string;
  processed_at?: string;
}

export interface RazorpayOrderResponse {
  key_id: string;
  order_id: string;
  amount: number;
  currency: string;
  receipt: string;
}

export type PaymentStatus = 'initiated' | 'pending' | 'completed' | 'failed' | 'refunded' | 'disputed';
export type RefundStatus = 'requested' | 'approved' | 'processing' | 'completed' | 'rejected';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private apiUrl = `${environment.apiUrl}/payments`;
  private paymentStatusSubject = new BehaviorSubject<PaymentResponse | null>(null);
  public paymentStatus$ = this.paymentStatusSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadRazorpayScript();
  }

  /**
   * Initialize Razorpay payment
   */
  initiatePayment(request: PaymentRequest): Observable<RazorpayOrderResponse> {
    return this.http.post<RazorpayOrderResponse>(`${this.apiUrl}/initiate/`, request).pipe(
      retry(2),
      catchError(this.handleError)
    );
  }

  /**
   * Verify Razorpay payment signature
   */
  verifyPayment(
    orderId: string,
    paymentId: string,
    signature: string
  ): Observable<PaymentResponse> {
    return this.http.post<PaymentResponse>(`${this.apiUrl}/verify/`, {
      razorpay_order_id: orderId,
      razorpay_payment_id: paymentId,
      razorpay_signature: signature
    }).pipe(
      tap(response => this.paymentStatusSubject.next(response)),
      catchError(this.handleError)
    );
  }

  /**
   * Get payment status
   */
  getPaymentStatus(bookingId: number): Observable<PaymentResponse> {
    const params = new HttpParams().set('booking_id', bookingId.toString());
    return this.http.get<PaymentResponse>(`${this.apiUrl}/status/`, { params }).pipe(
      tap(response => this.paymentStatusSubject.next(response)),
      catchError(this.handleError)
    );
  }

  /**
   * Get payment history
   */
  getPaymentHistory(page: number = 1): Observable<{ results: PaymentResponse[]; count: number }> {
    const params = new HttpParams().set('page', page.toString());
    return this.http.get<{ results: PaymentResponse[]; count: number }>(`${this.apiUrl}/history/`, { params }).pipe(
      retry(2),
      catchError(this.handleError)
    );
  }

  /**
   * Retry failed payment
   */
  retryPayment(paymentId: number, request: PaymentRequest): Observable<RazorpayOrderResponse> {
    return this.http.post<RazorpayOrderResponse>(
      `${this.apiUrl}/${paymentId}/retry/`,
      request
    ).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Request refund
   */
  requestRefund(paymentId: number, reason: string, amount?: number): Observable<RefundDetails> {
    return this.http.post<RefundDetails>(`${this.apiUrl}/${paymentId}/refund/`, {
      reason,
      amount
    }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Get refund status
   */
  getRefundStatus(paymentId: number): Observable<RefundDetails> {
    return this.http.get<RefundDetails>(`${this.apiUrl}/${paymentId}/refund-status/`).pipe(
      retry(2),
      catchError(this.handleError)
    );
  }

  /**
   * Open Razorpay checkout
   */
  openRazorpayCheckout(orderResponse: RazorpayOrderResponse): Promise<any> {
    return new Promise((resolve, reject) => {
      const options = {
        key: orderResponse.key_id,
        order_id: orderResponse.order_id,
        amount: orderResponse.amount,
        currency: orderResponse.currency,
        handler: (response: any) => resolve(response),
        prefill: {
          email: '',
          contact: ''
        },
        notes: {
          receipt: orderResponse.receipt
        },
        theme: {
          color: '#3498db'
        },
        modal: {
          ondismiss: () => reject(new Error('Payment cancelled'))
        }
      };

      if (typeof Razorpay !== 'undefined') {
        const rzp = new Razorpay(options);
        rzp.open();
      } else {
        reject(new Error('Razorpay not loaded'));
      }
    });
  }

  /**
   * Get wallet balance
   */
  getWalletBalance(): Observable<{ balance: number; currency: string }> {
    return this.http.get<{ balance: number; currency: string }>(`${this.apiUrl}/wallet/balance/`).pipe(
      retry(2),
      catchError(this.handleError)
    );
  }

  /**
   * Add funds to wallet
   */
  addWalletFunds(amount: number, method: string): Observable<PaymentResponse> {
    return this.http.post<PaymentResponse>(`${this.apiUrl}/wallet/add-funds/`, {
      amount,
      payment_method: method
    }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Pay with wallet
   */
  payWithWallet(bookingId: number, amount: number): Observable<PaymentResponse> {
    return this.http.post<PaymentResponse>(`${this.apiUrl}/wallet/pay/`, {
      booking_id: bookingId,
      amount
    }).pipe(
      tap(response => this.paymentStatusSubject.next(response)),
      catchError(this.handleError)
    );
  }

  private loadRazorpayScript(): void {
    if (typeof Razorpay !== 'undefined') return;

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.head.appendChild(script);
  }

  private handleError(error: any) {
    let errorMessage = 'An error occurred';

    if (error.error instanceof ErrorEvent) {
      errorMessage = error.error.message;
    } else if (error.status) {
      errorMessage = error.error?.detail || `Server Error: ${error.status}`;
    }

    console.error('Payment Error:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}