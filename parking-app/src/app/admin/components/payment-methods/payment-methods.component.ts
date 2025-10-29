import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AdminService } from 'src/app/core/services/admin.service';

@Component({
  selector: 'app-payment-methods',
  templateUrl: './payment-methods.component.html',
  styleUrls: ['./payment-methods.component.scss']
})
export class PaymentMethodsComponent implements OnInit {
  paymentMethods: any[] = [];
  isLoading = false;
  methodForm: FormGroup;
  showMethodForm = false;
  editingMethod: any = null;

  paymentGateways = [
    { value: 'razorpay', label: 'Razorpay' },
    { value: 'stripe', label: 'Stripe' },
    { value: 'paypal', label: 'PayPal' }
  ];

  constructor(
    private adminService: AdminService,
    private fb: FormBuilder
  ) {
    this.methodForm = this.fb.group({
      gateway: ['', Validators.required],
      is_active: [true],
      is_default: [false],
      configuration: this.fb.group({
        api_key: ['', Validators.required],
        api_secret: ['', Validators.required],
        merchant_account: ['']
      })
    });
  }

  ngOnInit(): void {
    this.loadPaymentMethods();
  }

  loadPaymentMethods(): void {
    this.isLoading = true;
    // Would call API to get payment methods
    // this.adminService.getPaymentMethods().subscribe(...)
    this.isLoading = false;
  }

  openNewMethodForm(): void {
    this.editingMethod = null;
    this.methodForm.reset({ is_active: true, is_default: false });
    this.showMethodForm = true;
  }

  editMethod(method: any): void {
    this.editingMethod = method;
    this.methodForm.patchValue(method);
    this.showMethodForm = true;
  }

  saveMethod(): void {
    if (!this.methodForm.valid) return;

    // Would call API to save method
    alert('Payment method saved successfully');
    this.showMethodForm = false;
    this.loadPaymentMethods();
  }

  closeForm(): void {
    this.showMethodForm = false;
    this.editingMethod = null;
  }
}