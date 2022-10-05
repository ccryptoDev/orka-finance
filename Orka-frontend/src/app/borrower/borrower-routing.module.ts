import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DocumentsManagementComponent } from './documents-management/documents-management.component';
import { MakePaymentComponent } from './make-payment/make-payment.component';
import { OverViewComponent } from './over-view/over-view.component';
import { PaymentMethodComponent } from './payment-method/payment-method.component';
import { PaymentScheduleComponent } from './payment-schedule/payment-schedule.component';
import { ToDoListComponent } from './to-do-list/to-do-list.component';
import { VerifyComponent } from './verify/verify.component';
import { LoginComponent } from './login/login.component';
import {borrowerGuard,borrowerloginGuard} from '../_guards';
import { ChangePasswordComponent } from './change-password/change-password.component';
import { DocumentCenterComponent } from './document-center/document-center.component';
import { HomeComponent } from './home/home.component';

import { PlaidComponent } from './plaid/plaid.component';


import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { SignComponent } from './sign/sign.component';
import { BankDocumentsComponent } from './bank-documents/bank-documents.component';
import { LoanDocumentsComponent } from './loan-documents/loan-documents.component';

const routes: Routes = [
  { path:'overview', component: OverViewComponent,canActivate:[borrowerGuard]},
  { path:'todo-list', component: ToDoListComponent,canActivate:[borrowerGuard]},
  { path:'payment-schedule', component: PaymentScheduleComponent,canActivate:[borrowerGuard]},
  { path:'make-payment', component: MakePaymentComponent,canActivate:[borrowerGuard]},
  { path:'payment-method', component: PaymentMethodComponent,canActivate:[borrowerGuard]},
  { path:'docs-management', component: DocumentsManagementComponent,canActivate:[borrowerGuard]},
  { path:'verify', component: VerifyComponent},
  { path:'plaid/:id', component: PlaidComponent},
  { path:'document-center',component : DocumentCenterComponent,canActivate:[borrowerloginGuard]},
  //{ path:'login', component: LoginComponent,canActivate:[borrowerloginGuard]},
  { path:'login', component: LoginComponent},
  { path:'home', component: HomeComponent,canActivate:[borrowerloginGuard]},
  { path:'bank-documents', component: BankDocumentsComponent,canActivate:[borrowerloginGuard]},
  { path:'loan-documents', component: LoanDocumentsComponent,canActivate:[borrowerloginGuard]},
  { path:'sign', component: SignComponent,canActivate:[borrowerloginGuard]},
  { path:'forgot-password', component: ForgotPasswordComponent},
  { path:'passwordReset', component: ResetPasswordComponent},
  { path:'change-password', component: ChangePasswordComponent,canActivate:[borrowerGuard]},
  { path: "**", redirectTo: "login", pathMatch: "full" },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BorrowerRoutingModule { }
