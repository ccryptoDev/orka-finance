import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataTablesModule } from "angular-datatables";
import { TabsModule } from 'ngx-bootstrap/tabs';
import { FormsModule,ReactiveFormsModule } from '@angular/forms';
import { NgxPlaidLinkModule } from "ngx-plaid-link";
import { NgxFileDropModule } from 'ngx-file-drop';
import { NgxMaskModule } from 'ngx-mask';

import { BorrowerRoutingModule } from './borrower-routing.module';
import { OverViewComponent } from './over-view/over-view.component';
import { ToDoListComponent } from './to-do-list/to-do-list.component';
import { PaymentScheduleComponent } from './payment-schedule/payment-schedule.component';
import { MakePaymentComponent } from './make-payment/make-payment.component';
import { PaymentMethodComponent } from './payment-method/payment-method.component';
import { DocumentsManagementComponent } from './documents-management/documents-management.component';
import { LoginComponent } from './login/login.component';
import { VerifyComponent } from './verify/verify.component';
import { ChangePasswordComponent } from './change-password/change-password.component';
import { PlaidComponent } from './plaid/plaid.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
// import { BankDocumentsComponent } from './bank-documents/bank-documents.component';
// import { SuccessComponent } from './success/success.component';
//import { LoanDocumentsComponent } from './loan-documents/loan-documents.component';
// import { DocumentCenterComponent } from './document-center/document-center.component';
// import { HomeComponent } from './home/home.component';



@NgModule({
  declarations: [
    OverViewComponent,
    ToDoListComponent,
    PaymentScheduleComponent,
    MakePaymentComponent,
    PaymentMethodComponent,
    DocumentsManagementComponent,
    LoginComponent,
    VerifyComponent,
    ChangePasswordComponent,
    PlaidComponent,
    ForgotPasswordComponent,
    ResetPasswordComponent,
    // BankDocumentsComponent,
    // SuccessComponent,
    //LoanDocumentsComponent,
    // DocumentCenterComponent,
    // HomeComponent
  ],
  imports: [
    CommonModule,
    BorrowerRoutingModule,
    DataTablesModule,
    TabsModule.forRoot(),
    NgxMaskModule.forRoot(),
    FormsModule,
    NgxFileDropModule,
    ReactiveFormsModule,
    NgxPlaidLinkModule
  ]
})
export class BorrowerModule { }
