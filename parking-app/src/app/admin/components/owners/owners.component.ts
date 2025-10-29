import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AdminService } from 'src/app/core/services/admin.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-owners',
  templateUrl: './owners.component.html',
  styleUrls: ['./owners.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule
  ]
})
export class OwnersComponent implements OnInit {
  owners: any[] = [];
  isLoading = false;
  filterForm: FormGroup;
  currentPage = 1;
  pageSize = 20;
  sortBy = '-pending_dues';

  filterOptions = [
    { value: 'all', label: 'All Owners' },
    { value: 'blocked', label: 'Blocked Owners' },
    { value: 'dues', label: 'Owners with Dues' }
  ];



get searchControl(): FormControl {
  return this.filterForm.get('search') as FormControl;
}
get filterTypeControl(): FormControl {
  return this.filterForm.get('filterType') as FormControl;
}
get sortByControl(): FormControl {
  return this.filterForm.get('sortBy') as FormControl;
}

  constructor(
    private adminService: AdminService,
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.filterForm = this.fb.group({
      filterType: ['all'],
      search: [''],
      sortBy: ['-pending_dues']
    });
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['blocked']) {
        this.filterForm.patchValue({ filterType: 'blocked' });
      } else if (params['dues']) {
        this.filterForm.patchValue({ filterType: 'dues' });
      }
      this.loadOwners();
    });

    this.filterForm.valueChanges.subscribe(() => {
      this.currentPage = 1;
      this.loadOwners();
    });
  }

  loadOwners(): void {
    this.isLoading = true;
    const filterType = this.filterForm.get('filterType')?.value;
    const search = this.filterForm.get('search')?.value;
    const sortBy = this.filterForm.get('sortBy')?.value;

    let request;
    switch (filterType) {
      case 'blocked':
        request = this.adminService.getBlockedOwners();
        break;
      case 'dues':
        request = this.adminService.getOwnersWithDues();
        break;
      default:
        const filters = {
          page: this.currentPage,
          ordering: sortBy
        };
        if (search) filters['search'] = search;
        request = this.adminService.getOwnerAccounts(filters);
    }

    request.subscribe(
      (response) => {
        this.owners = Array.isArray(response) ? response : response.results || [];
        this.isLoading = false;
      },
      (error) => {
        console.error('Error loading owners:', error);
        this.isLoading = false;
      }
    );
  }

  viewOwnerDetail(ownerId: number): void {
    this.router.navigate(['/admin/owners', ownerId]);
  }

  blockOwner(owner: any): void {
    const reason = prompt('Enter reason for blocking:');
    if (reason) {
      this.adminService.blockOwner(owner.id, reason).subscribe(
        () => {
          alert('Owner blocked successfully');
          this.loadOwners();
        },
        (error) => {
          alert('Error blocking owner: ' + error.message);
        }
      );
    }
  }

  unblockOwner(owner: any): void {
    if (confirm('Unblock this owner?')) {
      this.adminService.unblockOwner(owner.id).subscribe(
        () => {
          alert('Owner unblocked successfully');
          this.loadOwners();
        },
        (error) => {
          alert('Error unblocking owner: ' + error.message);
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

  getDueStatus(owner: any): string {
    if (owner.pending_dues === 0) return 'settled';
    if (owner.is_blocked) return 'blocked';
    return 'pending';
  }
}