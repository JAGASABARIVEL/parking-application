import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = `${environment.apiUrl}/admin`;
  private dashboardStatsSubject = new BehaviorSubject<any>(null);
  public dashboardStats$ = this.dashboardStatsSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadDashboardStats();
  }

  // ===== COMMISSION SETTINGS =====
  getCurrentSettings(): Observable<any> {
    return this.http.get(`${this.apiUrl}/commission-settings/current_settings/`);
  }

  updateSettings(settingsId: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/commission-settings/${settingsId}/update_settings/`, data);
  }

  // ===== OWNER COMMISSION ACCOUNTS =====
  getOwnerAccounts(filters?: any): Observable<any> {
    let params = new HttpParams();
    if (filters?.ordering) params = params.set('ordering', filters.ordering);
    if (filters?.search) params = params.set('search', filters.search);
    if (filters?.page) params = params.set('page', filters.page);
    
    return this.http.get(`${this.apiUrl}/owner-accounts/`, { params });
  }

  getDashboardStats(): Observable<any> {
    return this.http.get(`${this.apiUrl}/owner-accounts/dashboard_stats/`);
  }

  getOwnersWithDues(): Observable<any> {
    return this.http.get(`${this.apiUrl}/owner-accounts/owners_with_dues/`);
  }

  getBlockedOwners(): Observable<any> {
    return this.http.get(`${this.apiUrl}/owner-accounts/blocked_owners/`);
  }

  getOwnerDetail(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/owner-accounts/${id}/`);
  }

  getOwnerCommissionHistory(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/owner-accounts/${id}/commission_history/`);
  }

  getOwnerPendingDues(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/owner-accounts/${id}/pending_dues/`);
  }

  blockOwner(id: number, reason: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/owner-accounts/${id}/block_owner/`, { reason });
  }

  unblockOwner(id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/owner-accounts/${id}/unblock_owner/`, {});
  }

  // ===== COMMISSION TRANSACTIONS =====
  getCommissionTransactions(filters?: any): Observable<any> {
    let params = new HttpParams();
    if (filters?.owner) params = params.set('owner', filters.owner);
    if (filters?.status) params = params.set('status', filters.status);
    if (filters?.transaction_type) params = params.set('transaction_type', filters.transaction_type);
    if (filters?.page) params = params.set('page', filters.page);
    
    return this.http.get(`${this.apiUrl}/commission-transactions/`, { params });
  }

  getMonthlyReport(year: number, month: number): Observable<any> {
    const params = new HttpParams()
      .set('year', year.toString())
      .set('month', month.toString());
    
    return this.http.get(`${this.apiUrl}/commission-transactions/monthly_report/`, { params });
  }

  getPendingSettlements(): Observable<any> {
    return this.http.get(`${this.apiUrl}/commission-transactions/pending_settlements/`);
  }

  // ===== COMMISSION DUES =====
  getCommissionDues(filters?: any): Observable<any> {
    let params = new HttpParams();
    if (filters?.owner) params = params.set('owner', filters.owner);
    if (filters?.is_settled) params = params.set('is_settled', filters.is_settled);
    if (filters?.page) params = params.set('page', filters.page);
    
    return this.http.get(`${this.apiUrl}/commission-dues/`, { params });
  }

  getOverdueDues(): Observable<any> {
    return this.http.get(`${this.apiUrl}/commission-dues/overdue_list/`);
  }

  getAgingReport(): Observable<any> {
    return this.http.get(`${this.apiUrl}/commission-dues/aging_report/`);
  }

  // ===== PAYOUTS =====
  getPayouts(filters?: any): Observable<any> {
    let params = new HttpParams();
    if (filters?.status) params = params.set('status', filters.status);
    if (filters?.owner) params = params.set('owner', filters.owner);
    if (filters?.page) params = params.set('page', filters.page);
    
    return this.http.get(`${this.apiUrl}/payouts/`, { params });
  }

  initiatePayout(ownerId: number, amount: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/payouts/initiate/`, { owner_id: ownerId, amount });
  }

  confirmPayout(payoutId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/payouts/${payoutId}/confirm/`, {});
  }

  getPayout(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/payouts/${id}/`);
  }

  // ===== DISPUTES =====
  getDisputes(filters?: any): Observable<any> {
    let params = new HttpParams();
    if (filters?.status) params = params.set('status', filters.status);
    if (filters?.owner) params = params.set('owner', filters.owner);
    if (filters?.page) params = params.set('page', filters.page);
    
    return this.http.get(`${this.apiUrl}/disputes/`, { params });
  }

  getDisputeDetail(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/disputes/${id}/`);
  }

  resolveDispute(id: number, resolution: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/disputes/${id}/resolve/`, resolution);
  }

  // ===== RECONCILIATION =====
  getReconciliationReport(startDate: string, endDate: string): Observable<any> {
    const params = new HttpParams()
      .set('start_date', startDate)
      .set('end_date', endDate);
    
    return this.http.get(`${this.apiUrl}/reconciliation/report/`, { params });
  }

  getReconciliationDetail(transactionId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/reconciliation/${transactionId}/`);
  }

  reconcileTransaction(transactionId: number, data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/reconciliation/${transactionId}/reconcile/`, data);
  }

  // ===== HELPER METHODS =====
  private loadDashboardStats(): void {
    this.getDashboardStats().subscribe(stats => {
      this.dashboardStatsSubject.next(stats);
    });
  }

  refreshDashboardStats(): void {
    this.loadDashboardStats();
  }
}