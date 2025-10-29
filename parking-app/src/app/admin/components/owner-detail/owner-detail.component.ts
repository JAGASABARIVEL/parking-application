import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AdminService } from 'src/app/core/services/admin.service';

@Component({
  selector: 'app-owner-detail',
  templateUrl: './owner-detail.component.html',
  styleUrls: ['./owner-detail.component.scss']
})
export class OwnerDetailComponent implements OnInit {
  ownerId: number | null = null;
  owner: any = null;
  commissionHistory: any[] = [];
  pendingDues: any[] = [];
  isLoading = true;
  selectedTab = 'overview';

  constructor(
    private adminService: AdminService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.ownerId = params['id'];
      if (this.ownerId) {
        this.loadOwnerDetail();
      }
    });
  }

  loadOwnerDetail(): void {
    if (!this.ownerId) return;
    
    this.isLoading = true;

    this.adminService.getOwnerDetail(this.ownerId).subscribe(
      (owner) => {
        this.owner = owner;
      }
    );

    this.adminService.getOwnerCommissionHistory(this.ownerId).subscribe(
      (history) => {
        this.commissionHistory = history;
      }
    );

    this.adminService.getOwnerPendingDues(this.ownerId).subscribe(
      (dues) => {
        this.pendingDues = dues;
        this.isLoading = false;
      },
      (error) => {
        console.error('Error loading owner details:', error);
        this.isLoading = false;
      }
    );
  }

  blockOwner(): void {
    const reason = prompt('Enter reason for blocking:');
    if (reason && this.ownerId) {
      this.adminService.blockOwner(this.ownerId, reason).subscribe(
        () => {
          alert('Owner blocked successfully');
          this.loadOwnerDetail();
        }
      );
    }
  }

  unblockOwner(): void {
    if (confirm('Unblock this owner?') && this.ownerId) {
      this.adminService.unblockOwner(this.ownerId).subscribe(
        () => {
          alert('Owner unblocked successfully');
          this.loadOwnerDetail();
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

  goBack(): void {
    this.router.navigate(['/admin/owners']);
  }
}