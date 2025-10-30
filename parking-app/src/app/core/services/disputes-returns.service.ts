// core/services/disputes-returns.service.ts - Production Ready
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { catchError, retry, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface Dispute {
  id: number;
  booking_id: number;
  complainant_id: number;
  complainant_type: 'driver' | 'owner';
  respondent_id: number;
  reason: string;
  description: string;
  evidence: EvidenceFile[];
  status: DisputeStatus;
  priority: 'low' | 'medium' | 'high' | 'critical';
  resolution_type?: ResolutionType;
  refund_amount?: number;
  resolution_notes?: string;
  created_at: string;
  updated_at: string;
  resolved_at?: string;
  created_by_user: UserInfo;
  assigned_to?: UserInfo;
}

export interface ReturnRequest {
  id: number;
  booking_id: number;
  requester_id: number;
  requester_type: 'driver' | 'owner';
  reason: string;
  description: string;
  refund_amount: number;
  status: ReturnStatus;
  evidence: EvidenceFile[];
  admin_notes?: string;
  created_at: string;
  updated_at: string;
  processed_at?: string;
}

export interface EvidenceFile {
  id: number;
  file_url: string;
  file_type: string;
  uploaded_at: string;
  description?: string;
}

export interface UserInfo {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
}

export interface DisputeResolution {
  id: number;
  dispute_id: number;
  resolution_type: ResolutionType;
  refund_to_driver?: number;
  refund_to_owner?: number;
  notes: string;
  resolved_by: UserInfo;
  created_at: string;
}

export interface DisputeComment {
  id: number;
  dispute_id: number;
  comment_by: UserInfo;
  comment_text: string;
  created_at: string;
}

export type DisputeStatus = 'open' | 'in_review' | 'waiting_for_response' | 'resolved' | 'closed';
export type ReturnStatus = 'requested' | 'under_review' | 'approved' | 'rejected' | 'refunded';
export type ResolutionType = 
  | 'approve_claim' 
  | 'reject_claim' 
  | 'partial_refund' 
  | 'full_refund' 
  | 'split_refund' 
  | 'credit_wallet';

@Injectable({
  providedIn: 'root'
})
export class DisputesReturnsService {
  private apiUrl = `${environment.apiUrl}/disputes`;
  private returnsUrl = `${environment.apiUrl}/returns`;
  private disputesSubject = new BehaviorSubject<Dispute[]>([]);
  public disputes$ = this.disputesSubject.asObservable();

  constructor(private http: HttpClient) {}

  // ==================== DISPUTES ====================

  /**
   * Get all disputes
   */
  getDisputes(
    status?: string,
    page: number = 1,
    priority?: string
  ): Observable<{ results: Dispute[]; count: number }> {
    let params = new HttpParams().set('page', page.toString());
    if (status) params = params.set('status', status);
    if (priority) params = params.set('priority', priority);

    return this.http.get<{ results: Dispute[]; count: number }>(`${this.apiUrl}/`, { params }).pipe(
      tap(response => this.disputesSubject.next(response.results)),
      retry(2),
      catchError(error => this.handleError(error))
    );
  }

  /**
   * Get dispute details
   */
  getDisputeDetails(disputeId: number): Observable<Dispute> {
    return this.http.get<Dispute>(`${this.apiUrl}/${disputeId}/`).pipe(
      retry(2),
      catchError(error => this.handleError(error))
    );
  }

  /**
   * Create a new dispute
   */
  createDispute(request: {
    booking_id: number;
    reason: string;
    description: string;
    priority: string;
    evidence_files?: File[];
  }): Observable<Dispute> {
    const formData = new FormData();
    formData.append('booking_id', request.booking_id.toString());
    formData.append('reason', request.reason);
    formData.append('description', request.description);
    formData.append('priority', request.priority);

    if (request.evidence_files) {
      request.evidence_files.forEach((file, index) => {
        formData.append(`evidence_${index}`, file);
      });
    }

    return this.http.post<Dispute>(`${this.apiUrl}/create/`, formData).pipe(
      catchError(error => this.handleError(error))
    );
  }

  /**
   * Add response to dispute
   */
  addDisputeResponse(
    disputeId: number,
    response: string,
    evidenceFiles?: File[]
  ): Observable<Dispute> {
    const formData = new FormData();
    formData.append('response', response);

    if (evidenceFiles) {
      evidenceFiles.forEach((file, index) => {
        formData.append(`evidence_${index}`, file);
      });
    }

    return this.http.post<Dispute>(
      `${this.apiUrl}/${disputeId}/add-response/`,
      formData
    ).pipe(
      catchError(error => this.handleError(error))
    );
  }

  /**
   * Get dispute comments
   */
  getDisputeComments(disputeId: number): Observable<DisputeComment[]> {
    return this.http.get<DisputeComment[]>(`${this.apiUrl}/${disputeId}/comments/`).pipe(
      retry(2),
      catchError(error => this.handleError(error))
    );
  }

  /**
   * Add comment to dispute
   */
  addDisputeComment(disputeId: number, comment: string): Observable<DisputeComment> {
    return this.http.post<DisputeComment>(`${this.apiUrl}/${disputeId}/comments/`, {
      comment_text: comment
    }).pipe(
      catchError(error => this.handleError(error))
    );
  }

  /**
   * Resolve dispute (Admin only)
   */
  resolveDispute(
    disputeId: number,
    resolution: {
      resolution_type: string;
      refund_amount?: number;
      notes: string;
    }
  ): Observable<DisputeResolution> {
    return this.http.post<DisputeResolution>(
      `${this.apiUrl}/${disputeId}/resolve/`,
      resolution
    ).pipe(
      catchError(error => this.handleError(error))
    );
  }

  /**
   * Close dispute
   */
  closeDispute(disputeId: number, reason: string): Observable<Dispute> {
    return this.http.post<Dispute>(`${this.apiUrl}/${disputeId}/close/`, {
      reason
    }).pipe(
      catchError(error => this.handleError(error))
    );
  }

  /**
   * Appeal dispute
   */
  appealDispute(disputeId: number, appealReason: string): Observable<Dispute> {
    return this.http.post<Dispute>(`${this.apiUrl}/${disputeId}/appeal/`, {
      appeal_reason: appealReason
    }).pipe(
      catchError(error => this.handleError(error))
    );
  }

  /**
   * Get user disputes
   */
  getUserDisputes(page: number = 1): Observable<{ results: Dispute[]; count: number }> {
    const params = new HttpParams().set('page', page.toString());
    return this.http.get<{ results: Dispute[]; count: number }>(
      `${this.apiUrl}/my-disputes/`,
      { params }
    ).pipe(
      retry(2),
      catchError(error => this.handleError(error))
    );
  }

  // ==================== RETURNS ====================

  /**
   * Create return request
   */
  createReturnRequest(request: {
    booking_id: number;
    reason: string;
    description: string;
    refund_amount: number;
    evidence_files?: File[];
  }): Observable<ReturnRequest> {
    const formData = new FormData();
    formData.append('booking_id', request.booking_id.toString());
    formData.append('reason', request.reason);
    formData.append('description', request.description);
    formData.append('refund_amount', request.refund_amount.toString());

    if (request.evidence_files) {
      request.evidence_files.forEach((file, index) => {
        formData.append(`evidence_${index}`, file);
      });
    }

    return this.http.post<ReturnRequest>(`${this.returnsUrl}/create/`, formData).pipe(
      catchError(error => this.handleError(error))
    );
  }

  /**
   * Get return requests
   */
  getReturnRequests(
    status?: string,
    page: number = 1
  ): Observable<{ results: ReturnRequest[]; count: number }> {
    let params = new HttpParams().set('page', page.toString());
    if (status) params = params.set('status', status);

    return this.http.get<{ results: ReturnRequest[]; count: number }>(
      `${this.returnsUrl}/`,
      { params }
    ).pipe(
      retry(2),
      catchError(error => this.handleError(error))
    );
  }

  /**
   * Get return request details
   */
  getReturnDetails(returnId: number): Observable<ReturnRequest> {
    return this.http.get<ReturnRequest>(`${this.returnsUrl}/${returnId}/`).pipe(
      retry(2),
      catchError(error => this.handleError(error))
    );
  }

  /**
   * Get user return requests
   */
  getUserReturnRequests(page: number = 1): Observable<{ results: ReturnRequest[]; count: number }> {
    const params = new HttpParams().set('page', page.toString());
    return this.http.get<{ results: ReturnRequest[]; count: number }>(
      `${this.returnsUrl}/my-returns/`,
      { params }
    ).pipe(
      retry(2),
      catchError(error => this.handleError(error))
    );
  }

  /**
   * Approve return request (Admin)
   */
  approveReturn(returnId: number): Observable<ReturnRequest> {
    return this.http.post<ReturnRequest>(
      `${this.returnsUrl}/${returnId}/approve/`,
      {}
    ).pipe(
      catchError(error => this.handleError(error))
    );
  }

  /**
   * Reject return request (Admin)
   */
  rejectReturn(returnId: number, reason: string): Observable<ReturnRequest> {
    return this.http.post<ReturnRequest>(
      `${this.returnsUrl}/${returnId}/reject/`,
      { reason }
    ).pipe(
      catchError(error => this.handleError(error))
    );
  }

  /**
   * Process refund for approved return
   */
  processRefund(returnId: number): Observable<any> {
    return this.http.post<any>(
      `${this.returnsUrl}/${returnId}/process-refund/`,
      {}
    ).pipe(
      catchError(error => this.handleError(error))
    );
  }

  /**
   * Get return statistics
   */
  getReturnStats(): Observable<any> {
    return this.http.get<any>(`${this.returnsUrl}/statistics/`).pipe(
      retry(2),
      catchError(error => this.handleError(error))
    );
  }

  private handleError(error: any): Observable<never> {
    console.error('Commission Error:', error);
    // Optionally show a toast or user message here
    return throwError(() => error);
  }
}