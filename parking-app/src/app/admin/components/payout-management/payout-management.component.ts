import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AdminService } from 'src/app/core/services/admin.service';

@Component({
  selector: 'app-payout-management',
  templateUrl: './payout-management.component.html',
  styleUrls: ['./payout-management.component.scss']
})
export class PayoutManagementComponent implements OnInit {
  payouts: any[] = [];
  isLoading = false;
  filterForm: FormGroup;
  payoutForm: FormGroup | null = null;
  showPayoutModal = false;
  payoutStats: any = null;

  payoutMethods = [
    { value: 'bank_transfer', label: 'Bank Transfer' },
    { value: 'upi', label: 'UPI' },
    { value: 'check', label: 'Check' }
  ];

  constructor(
    private adminService: AdminService,
    private fb: FormBuilder
  ) {
    this.filterForm = this.fb.group({
      status: ['all'],
      owner: ['']
    });
  }

  ngOnInit(): void {
    this.loadPayouts();
    this.filterForm.valueChanges.subscribe(() => {
      this.loadPayouts();
    });
  }

  loadPayouts(): void {
    this.isLoading = true;
    const status = this.filterForm.get('status')?.value;
    const filters: any = {};
    
    if (status !== 'all') {
      filters.status = status;
    }

    this.adminService.getPayouts(filters).subscribe(
      (response) => {
        this.payouts = Array.isArray(response) ? response : response.results || [];
        this.isLoading = false;
      },
      (error) => {
        console.error('Error loading payouts:', error);
        this.isLoading = false;
      }
    );
  }

  openPayoutModal(): void {
    this.payoutForm = this.fb.group({
      owner_id: ['', Validators.required],
      amount: ['', [Validators.required, Validators.min(1)]],
      payment_method: ['bank_transfer', Validators.required],
      notes: ['']
    });
    this.showPayoutModal = true;
  }

  closePayoutModal(): void {
    this.showPayoutModal = false;
    this.payoutForm = null;
  }

  initiatePayout(): void {
    if (!this.payoutForm || !this.payoutForm.valid) return;

    const { owner_id, amount } = this.payoutForm.value;
    this.adminService.initiatePayout(owner_id, amount).subscribe(
      (response) => {
        alert('Payout initiated successfully');
        this.loadPayouts();
        this.closePayoutModal();
      },
      (error) => {
        alert('Error initiating payout: ' + error.message);
      }
    );
  }

  confirmPayout(payoutId: number): void {
    if (confirm('Confirm this payout?')) {
      this.adminService.confirmPayout(payoutId).subscribe(
        () => {
          alert('Payout confirmed');
          this.loadPayouts();
        },
        (error) => {
          alert('Error confirming payout: ' + error.message);
        }
      );
    }
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(value);
  }

  getPayoutStatusClass(status: string): string {
    switch (status) {
      case 'pending': return 'pending';
      case 'confirmed': return 'confirmed';
      case 'processing': return 'processing';
      case 'completed': return 'completed';
      case 'failed': return 'failed';
      default: return 'pending';
    }
  }
}