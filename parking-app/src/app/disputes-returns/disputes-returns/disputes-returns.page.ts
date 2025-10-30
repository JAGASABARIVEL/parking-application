// disputes-returns/disputes-returns.page.ts - Production Ready
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, ToastController, LoadingController } from '@ionic/angular';
import { DisputesReturnsService, Dispute, ReturnRequest } from 'src/app/core/services/disputes-returns.service';
import { BookingService } from 'src/app/core/services/booking.service';

@Component({
  selector: 'app-disputes-returns',
  templateUrl: './disputes-returns.page.html',
  styleUrls: ['./disputes-returns.page.scss'],
  standalone: false
})
export class DisputesReturnsPage implements OnInit {
  selectedTab: 'disputes' | 'returns' | 'history' = 'disputes';
  
  disputes: Dispute[] = [];
  returns: ReturnRequest[] = [];
  isLoading = false;
  currentPage = 1;

  // Filter options
  disputeFilter = 'open';
  returnFilter = 'requested';

  // Create new dispute/return
  showCreateForm = false;
  createFormType: 'dispute' | 'return' = 'dispute';
  selectedBooking: any = null;
  formData = {
    reason: '',
    description: '',
    priority: 'medium',
    refundAmount: 0,
    evidenceFiles: [] as File[]
  };

  bookings: any[] = [];

  constructor(
    private disputesService: DisputesReturnsService,
    private bookingService: BookingService,
    private router: Router,
    private alertController: AlertController,
    private toastController: ToastController,
    private loadingController: LoadingController
  ) {}

  ngOnInit() {
    this.loadData();
    this.loadUserBookings();
  }

  loadData() {
    if (this.selectedTab === 'disputes') {
      this.loadDisputes();
    } else if (this.selectedTab === 'returns') {
      this.loadReturns();
    }
  }

  loadDisputes() {
    this.isLoading = true;
    this.disputesService.getUserDisputes(this.currentPage).subscribe(
      (response) => {
        this.disputes = response.results;
        this.isLoading = false;
      },
      (error) => {
        console.error('Error loading disputes:', error);
        this.showToast('Error loading disputes', 'danger');
        this.isLoading = false;
      }
    );
  }

  loadReturns() {
    this.isLoading = true;
    this.disputesService.getUserReturnRequests(this.currentPage).subscribe(
      (response) => {
        this.returns = response.results;
        this.isLoading = false;
      },
      (error) => {
        console.error('Error loading returns:', error);
        this.showToast('Error loading returns', 'danger');
        this.isLoading = false;
      }
    );
  }

  loadUserBookings() {
    this.bookingService.getMyBookings().subscribe(
      (bookings) => {
        // Filter for completed bookings only
        this.bookings = bookings.filter(b => 
          b.status === 'completed' || b.status === 'parked'
        );
      },
      (error) => console.error('Error loading bookings:', error)
    );
  }

  onTabChange() {
    this.currentPage = 1;
    this.loadData();
  }

  viewDisputeDetails(dispute: Dispute) {
    this.router.navigate(['/dispute-detail', dispute.id]);
  }

  viewReturnDetails(returnReq: ReturnRequest) {
    this.router.navigate(['/return-detail', returnReq.id]);
  }

  openCreateForm(type: 'dispute' | 'return') {
    this.createFormType = type;
    this.showCreateForm = true;
    this.resetFormData();
  }

  resetFormData() {
    this.selectedBooking = null;
    this.formData = {
      reason: '',
      description: '',
      priority: 'medium',
      refundAmount: 0,
      evidenceFiles: []
    };
  }

  onFileSelected(event: any) {
    const files = event.target.files;
    if (files) {
      this.formData.evidenceFiles = Array.from(files);
    }
  }

  removeFile(index: number) {
    this.formData.evidenceFiles.splice(index, 1);
  }

  async submitForm() {
    if (!this.selectedBooking) {
      this.showToast('Please select a booking', 'warning');
      return;
    }

    if (!this.formData.reason || !this.formData.description) {
      this.showToast('Please fill all required fields', 'warning');
      return;
    }

    const loading = await this.loadingController.create({
      message: 'Processing...'
    });
    await loading.present();

    try {
      if (this.createFormType === 'dispute') {
        await this.submitDispute(loading);
      } else {
        await this.submitReturn(loading);
      }
    } catch (error) {
      loading.dismiss();
      this.showToast('Error submitting request', 'danger');
    }
  }

  private async submitDispute(loading: any) {
    this.disputesService.createDispute({
      booking_id: this.selectedBooking.id,
      reason: this.formData.reason,
      description: this.formData.description,
      priority: this.formData.priority,
      evidence_files: this.formData.evidenceFiles.length > 0 
        ? this.formData.evidenceFiles 
        : undefined
    }).subscribe(
      (dispute) => {
        loading.dismiss();
        this.showToast('Dispute created successfully', 'success');
        this.showCreateForm = false;
        this.loadDisputes();
      },
      (error) => {
        loading.dismiss();
        console.error('Error creating dispute:', error);
        this.showToast('Error creating dispute', 'danger');
      }
    );
  }

  private async submitReturn(loading: any) {
    this.disputesService.createReturnRequest({
      booking_id: this.selectedBooking.id,
      reason: this.formData.reason,
      description: this.formData.description,
      refund_amount: this.formData.refundAmount,
      evidence_files: this.formData.evidenceFiles.length > 0 
        ? this.formData.evidenceFiles 
        : undefined
    }).subscribe(
      (returnReq) => {
        loading.dismiss();
        this.showToast('Return request submitted successfully', 'success');
        this.showCreateForm = false;
        this.loadReturns();
      },
      (error) => {
        loading.dismiss();
        console.error('Error creating return request:', error);
        this.showToast('Error creating return request', 'danger');
      }
    );
  }

  getStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      'open': 'warning',
      'in_review': 'primary',
      'waiting_for_response': 'secondary',
      'resolved': 'success',
      'closed': 'medium',
      'requested': 'warning',
      'under_review': 'primary',
      'approved': 'success',
      'rejected': 'danger',
      'refunded': 'success'
    };
    return colors[status] || 'medium';
  }

  getPriorityColor(priority: string): string {
    const colors: { [key: string]: string } = {
      'low': 'medium',
      'medium': 'warning',
      'high': 'danger',
      'critical': 'danger'
    };
    return colors[priority] || 'medium';
  }

  private showToast(message: string, color: string = 'primary') {
    this.toastController.create({
      message,
      duration: 2000,
      position: 'bottom',
      color
    }).then(toast => toast.present());
  }
}