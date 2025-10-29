import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AdminService } from 'src/app/core/services/admin.service';

@Component({
  selector: 'app-dispute-resolution',
  templateUrl: './dispute-resolution.component.html',
  styleUrls: ['./dispute-resolution.component.scss']
})
export class DisputeResolutionComponent implements OnInit {
  disputes: any[] = [];
  isLoading = false;
  selectedDispute: any = null;
  resolutionForm: FormGroup | null = null;
  filterForm: FormGroup;

  resolutionTypes = [
    { value: 'approve_claim', label: 'Approve Claim' },
    { value: 'reject_claim', label: 'Reject Claim' },
    { value: 'partial_refund', label: 'Partial Refund' },
    { value: 'full_refund', label: 'Full Refund' },
    { value: 'need_more_info', label: 'Need More Information' }
  ];

  constructor(
    private adminService: AdminService,
    private fb: FormBuilder
  ) {
    this.filterForm = this.fb.group({
      status: ['open']
    });
  }

  ngOnInit(): void {
    this.loadDisputes();
    this.filterForm.valueChanges.subscribe(() => {
      this.loadDisputes();
    });
  }

  loadDisputes(): void {
    this.isLoading = true;
    const status = this.filterForm.get('status')?.value;
    const filters = { status };

    this.adminService.getDisputes(filters).subscribe(
      (response) => {
        this.disputes = Array.isArray(response) ? response : response.results || [];
        this.isLoading = false;
      },
      (error) => {
        console.error('Error loading disputes:', error);
        this.isLoading = false;
      }
    );
  }

  selectDispute(dispute: any): void {
    this.selectedDispute = dispute;
    this.resolutionForm = this.fb.group({
      resolution_type: ['', Validators.required],
      refund_amount: [0],
      notes: ['', Validators.required]
    });
  }

  resolveDispute(): void {
    if (!this.resolutionForm || !this.resolutionForm.valid || !this.selectedDispute) return;

    this.adminService.resolveDispute(this.selectedDispute.id, this.resolutionForm.value).subscribe(
      () => {
        alert('Dispute resolved successfully');
        this.selectedDispute = null;
        this.resolutionForm = null;
        this.loadDisputes();
      },
      (error) => {
        alert('Error resolving dispute: ' + error.message);
      }
    );
  }

  closeDispute(): void {
    this.selectedDispute = null;
    this.resolutionForm = null;
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(value);
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'open': return 'open';
      case 'in_review': return 'in_review';
      case 'resolved': return 'resolved';
      case 'closed': return 'closed';
      default: return 'open';
    }
  }
}