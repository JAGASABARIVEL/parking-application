import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AdminService } from 'src/app/core/services/admin.service';

interface DashboardStats {
  total_commission_earned: number;
  total_pending_dues: number;
  blocked_owners_count: number;
  owners_with_overdue: number;
  commission_percentage: number;
  block_dues_threshold: number;
}

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: false
})
export class DashboardPage implements OnInit {
  stats: DashboardStats | null = null;
  monthlyReport: any = null;
  agingReport: any = null;
  isLoading = true;
  selectedMonth = new Date();

  constructor(
    private adminService: AdminService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadDashboard();
  }

  getAgingPercentage(val1, val2) {
    // TODO: Complete the implmentation
  }

  loadDashboard(): void {
    this.isLoading = true;
    
    // Load dashboard stats
    this.adminService.getDashboardStats().subscribe(
      (stats) => {
        this.stats = stats;
      },
      (error) => {
        console.error('Error loading dashboard stats:', error);
      }
    );

    // Load monthly report
    const year = this.selectedMonth.getFullYear();
    const month = this.selectedMonth.getMonth() + 1;
    this.adminService.getMonthlyReport(year, month).subscribe(
      (report) => {
        this.monthlyReport = report;
      },
      (error) => {
        console.error('Error loading monthly report:', error);
      }
    );

    // Load aging report
    this.adminService.getAgingReport().subscribe(
      (report) => {
        this.agingReport = report;
        this.isLoading = false;
      },
      (error) => {
        console.error('Error loading aging report:', error);
        this.isLoading = false;
      }
    );
  }

  goToBlockedOwners(): void {
    this.router.navigate(['/admin/owners'], { queryParams: { blocked: true } });
  }

  goToOwnersWithDues(): void {
    this.router.navigate(['/admin/owners'], { queryParams: { dues: true } });
  }

  goToDuesManagement(): void {
    this.router.navigate(['/admin/dues']);
  }

  goToReports(): void {
    this.router.navigate(['/admin/reports']);
  }

  previousMonth(): void {
    this.selectedMonth = new Date(
      this.selectedMonth.getFullYear(),
      this.selectedMonth.getMonth() - 1
    );
    this.loadDashboard();
  }

  nextMonth(): void {
    this.selectedMonth = new Date(
      this.selectedMonth.getFullYear(),
      this.selectedMonth.getMonth() + 1
    );
    this.loadDashboard();
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(value);
  }
}