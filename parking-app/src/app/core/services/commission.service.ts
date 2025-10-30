// core/services/commission.service.ts - Production Ready
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { catchError, retry, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface CommissionTransaction {
  id: number;
  booking_id: number;
  owner_id: number;
  base_amount: number;
  commission_amount: number;
  commission_percentage: number;
  payment_method: string;
  transaction_type: 'booking' | 'refund' | 'chargeback';
  status: CommissionStatus;
  transaction_date: string;
  settlement_date?: string;
  created_at: string;
}

export interface CommissionDues {
  id: number;
  owner_id: number;
  total_dues: number;
  settled_amount: number;
  pending_amount: number;
  is_settled: boolean;
  settled_date?: string;
  due_date: string;
  created_at: string;
}

export interface CommissionSettings {
  id: number;
  commission_percentage: number;
  payment_settlement_days: number;
  minimum_payout_amount: number;
  maximum_payout_amount: number;
  blocked_owners_threshold: number;
  created_at: string;
  updated_at: string;
}

export interface OwnerCommissionAccount {
  owner_id: number;
  owner_name: string;
  owner_email: string;
  total_earned: number;
  current_balance: number;
  pending_dues: number;
  is_blocked: boolean;
  block_reason?: string;
  total_bookings: number;
  successful_payments: number;
  failed_payments: number;
  created_at: string;
}

export interface PayoutRequest {
  owner_id: number;
  amount: number;
  payout_method: 'bank_transfer' | 'upi' | 'check';
  bank_account?: BankAccount;
}

export interface BankAccount {
  account_number: string;
  ifsc_code: string;
  account_holder_name: string;
  account_type: string;
}

export interface Payout {
  id: number;
  owner_id: number;
  amount: number;
  payout_method: string;
  status: PayoutStatus;
  transaction_id?: string;
  initiated_at: string;
  completed_at?: string;
  failed_reason?: string;
}

export type CommissionStatus = 'pending' | 'completed' | 'failed' | 'disputed';
export type PayoutStatus = 'pending' | 'approved' | 'processing' | 'completed' | 'failed';

@Injectable({
  providedIn: 'root'
})
export class CommissionService {
  private apiUrl = `${environment.apiUrl}/commissions`;
  private commissionStatsSubject = new BehaviorSubject<any>(null);
  public commissionStats$ = this.commissionStatsSubject.asObservable();

  constructor(private http: HttpClient) {}

  /**
   * Get owner commission account details
   */
  getOwnerCommissionAccount(): Observable<OwnerCommissionAccount> {
    return this.http.get<OwnerCommissionAccount>(`${this.apiUrl}/owner-account/`).pipe(
      tap(account => this.commissionStatsSubject.next(account)),
      retry(2),
      catchError(error => this.handleError(error))
    );
  }

  /**
   * Get commission transactions
   */
  getCommissionTransactions(
    page: number = 1,
    transactionType?: string,
    status?: string
  ): Observable<{ results: CommissionTransaction[]; count: number }> {
    let params = new HttpParams().set('page', page.toString());
    if (transactionType) params = params.set('transaction_type', transactionType);
    if (status) params = params.set('status', status);

    return this.http.get<{ results: CommissionTransaction[]; count: number }>(
      `${this.apiUrl}/transactions/`,
      { params }
    ).pipe(
      retry(2),
      catchError(error => this.handleError(error))
    );
  }

  /**
   * Get commission dues
   */
  getCommissionDues(): Observable<CommissionDues> {
    return this.http.get<CommissionDues>(`${this.apiUrl}/dues/`).pipe(
      retry(2),
      catchError(error => this.handleError(error))
    );
  }

  /**
   * Get monthly commission report
   */
  getMonthlyReport(year: number, month: number): Observable<any> {
    const params = new HttpParams()
      .set('year', year.toString())
      .set('month', month.toString());

    return this.http.get<any>(`${this.apiUrl}/monthly-report/`, { params }).pipe(
      retry(2),
      catchError(error => this.handleError(error))
    );
  }

  /**
   * Get commission breakdown for a booking
   */
  getBookingCommissionBreakdown(bookingId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/booking/${bookingId}/breakdown/`).pipe(
      retry(2),
      catchError(error => this.handleError(error))
    );
  }

  /**
   * Request payout
   */
  requestPayout(request: PayoutRequest): Observable<Payout> {
    return this.http.post<Payout>(`${this.apiUrl}/payouts/request/`, request).pipe(
      catchError(error => this.handleError(error))
    );
  }

  /**
   * Get payout history
   */
  getPayoutHistory(page: number = 1): Observable<{ results: Payout[]; count: number }> {
    const params = new HttpParams().set('page', page.toString());
    return this.http.get<{ results: Payout[]; count: number }>(
      `${this.apiUrl}/payouts/`,
      { params }
    ).pipe(
      retry(2),
      catchError(error => this.handleError(error))
    );
  }

  /**
   * Get payout details
   */
  getPayoutDetails(payoutId: number): Observable<Payout> {
    return this.http.get<Payout>(`${this.apiUrl}/payouts/${payoutId}/`).pipe(
      retry(2),
      catchError(error => this.handleError(error))
    );
  }

  /**
   * Cancel payout request
   */
  cancelPayout(payoutId: number): Observable<Payout> {
    return this.http.post<Payout>(`${this.apiUrl}/payouts/${payoutId}/cancel/`, {}).pipe(
      catchError(error => this.handleError(error))
    );
  }

  /**
   * Get current commission settings
   */
  getCommissionSettings(): Observable<CommissionSettings> {
    return this.http.get<CommissionSettings>(`${this.apiUrl}/settings/`).pipe(
      retry(2),
      catchError(error => this.handleError(error))
    );
  }

  /**
   * Add bank account for payout
   */
  addBankAccount(account: BankAccount): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/bank-accounts/`, account).pipe(
      catchError(error => this.handleError(error))
    );
  }

  /**
   * Get bank accounts
   */
  getBankAccounts(): Observable<BankAccount[]> {
    return this.http.get<BankAccount[]>(`${this.apiUrl}/bank-accounts/`).pipe(
      retry(2),
      catchError(error => this.handleError(error))
    );
  }

  /**
   * Set default bank account
   */
  setDefaultBankAccount(accountId: number): Observable<any> {
    return this.http.patch<any>(
      `${this.apiUrl}/bank-accounts/${accountId}/set-default/`,
      {}
    ).pipe(
      catchError(error => this.handleError(error))
    );
  }

  private handleError(error: any): Observable<never> {
  console.error('Commission Error:', error);
  // Optionally show a toast or user message here
  return throwError(() => error);
}
}