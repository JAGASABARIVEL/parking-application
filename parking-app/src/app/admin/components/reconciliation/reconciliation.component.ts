import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AdminService } from 'src/app/core/services/admin.service';

@Component({
  selector: 'app-reconciliation',
  templateUrl: './reconciliation.component.html',
  styleUrls: ['./reconciliation.component.scss']
})
export class ReconciliationComponent implements OnInit {
  reconciliationForm: FormGroup;
  reconciliationReport: any = null;
  isLoading = false;
  reportTransactions: any[] = [];
  selectedTransaction: any = null;

  constructor(
    private adminService: AdminService,
    private fb: FormBuilder
  ) {
    this.reconciliationForm = this.fb.group({
      startDate: ['', Validators.required],
      endDate: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    // Set default date range (last 30 days)
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);

    this.reconciliationForm.patchValue({
      startDate: this.formatDateInput(startDate),
      endDate: this.formatDateInput(endDate)
    });
  }

  generateReport(): void {
    if (!this.reconciliationForm.valid) return;

    this.isLoading = true;
    const { startDate, endDate } = this.reconciliationForm.value;

    this.adminService.getReconciliationReport(startDate, endDate).subscribe(
      (report) => {
        this.reconciliationReport = report;
        this.reportTransactions = report.transactions || [];
        this.isLoading = false;
      },
      (error) => {
        console.error('Error generating report:', error);
        this.isLoading = false;
        alert('Error generating report');
      }
    );
  }

  selectTransaction(transaction: any): void {
    this.selectedTransaction = transaction;
  }

  reconcileTransaction(): void {
    if (!this.selectedTransaction) return;

    const data = {
      reconciliation_notes: prompt('Enter reconciliation notes:') || ''
    };

    this.adminService.reconcileTransaction(this.selectedTransaction.id, data).subscribe(
      () => {
        alert('Transaction reconciled');
        this.selectedTransaction = null;
        this.generateReport();
      },
      (error) => {
        alert('Error reconciling transaction: ' + error.message);
      }
    );
  }

  closeTransactionDetail(): void {
    this.selectedTransaction = null;
  }

  exportReport(): void {
    if (!this.reconciliationReport) return;

    // Convert to CSV and download
    const csv = this.convertToCSV(this.reportTransactions);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `reconciliation-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  private convertToCSV(data: any[]): string {
    const headers = ['Transaction ID', 'Booking ID', 'Amount', 'Commission', 'Status', 'Date'];
    const rows = data.map(t => [
      t.id,
      t.booking_id,
      t.amount,
      t.commission,
      t.status,
      t.created_at
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(r => r.join(','))
    ].join('\n');

    return csv;
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(value);
  }

  private formatDateInput(date: Date): string {
    return date.toISOString().split('T')[0];
  }
}