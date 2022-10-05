import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { QuestionsComponent } from './questions/questions.component';
import { LoginComponent } from './login/login.component';
import {adminGuard,adminloginGuard,AdminPagesGuard} from '../_guards';
import { PendingsComponent } from './pendings/pendings.component';
import { PendingsdetailsComponent } from './pendingsdetails/pendingsdetails.component';
import { IncompleteComponent } from './incomplete/incomplete.component';
import { IncompletedetailsComponent } from './incompletedetails/incompletedetails.component';
import { ApprovedComponent } from './approved/approved.component';
import { ApproveddetailsComponent } from './approveddetails/approveddetails.component';
import { DeniedComponent } from './denied/denied.component';
import { DenieddetailsComponent } from './denieddetails/denieddetails.component';
import { UsersComponent } from './users/users.component';
import { UsersdetailsComponent } from './usersdetails/usersdetails.component';
import { InstallerComponent } from './installer/installer.component';
import { AddinstallerComponent } from './addinstaller/addinstaller.component';
import { ViewinstallerComponent } from './viewinstaller/viewinstaller.component';
import { ChangepasswordComponent } from './changepassword/changepassword.component';
import { FundedContractsComponent } from './funded-contracts/funded-contracts.component';
import { FundedContactDetailsComponent } from './funded-contact-details/funded-contact-details.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { NotificationComponent } from './notification/notification.component';
import { RolesComponent } from './roles/roles.component';
import { RolespermissionComponent } from './rolespermission/rolespermission.component';
import { AuditlogComponent } from './auditlog/auditlog.component';
import { LoanProductsComponent } from './loan-products/loan-products.component';
import { LoanProductsDetailsComponent } from './loan-products-details/loan-products-details.component';
import { AddloanProductsComponent } from './addloan-products/addloan-products.component';
import { EquipmentComponent } from './equipment/equipment.component';
import { ConstructionComponent } from './construction/construction.component';
import { PermissionToOperateComponent } from './permission-to-operate/permission-to-operate.component';
import { PendingSalesContractComponent } from './pending-sales-contract/pending-sales-contract.component';
import { CompletedSalesContractComponent } from './completed-sales-contract/completed-sales-contract.component';
import { DisbursementSequenceComponent } from './disbursement-sequence/disbursement-sequence.component';
import { AdddisbursementSequenceComponent } from './adddisbursement-sequence/adddisbursement-sequence.component';
import { DisbursementSequenceDetailsComponent } from './disbursement-sequence-details/disbursement-sequence-details.component';
import { CounterSignatureComponent } from './counter-signature/counter-signature.component';
import { CounterSignatureDetailsComponent } from './counter-signature-details/counter-signature-details.component';
import { CompleteCounterSignatureComponent } from './complete-counter-signature/complete-counter-signature.component';


const routes: Routes = [ 
  { path:'dashboard', component: DashboardComponent,canActivate:[adminGuard,AdminPagesGuard]},
  { path:'login', component: LoginComponent,canActivate:[adminloginGuard]},
  { path:'forgot-password', component: ForgotPasswordComponent,canActivate:[adminloginGuard]},
  { path:'passwordReset', component: ResetPasswordComponent,canActivate:[adminloginGuard]},
  {path:'settings/questions',component:QuestionsComponent,canActivate:[adminGuard,AdminPagesGuard]},
  {path:'pendings',component:PendingsComponent,canActivate:[adminGuard,AdminPagesGuard]},
  {path:'pendings/:id',component:PendingsdetailsComponent,canActivate:[adminGuard,AdminPagesGuard]},
  {path:'incomplete',component:IncompleteComponent,canActivate:[adminGuard,AdminPagesGuard]},
  {path:'incomplete/:id',component:IncompletedetailsComponent,canActivate:[adminGuard,AdminPagesGuard]},
  {path:'approved',component:ApprovedComponent,canActivate:[adminGuard,AdminPagesGuard]},
  {path:'approved/:id',component:ApproveddetailsComponent,canActivate:[adminGuard,AdminPagesGuard]},
  {path:'denied',component:DeniedComponent,canActivate:[adminGuard,AdminPagesGuard]},
  {path:'denied/:id',component:DenieddetailsComponent,canActivate:[adminGuard,AdminPagesGuard]},
  {path:'funded-contracts',component:FundedContractsComponent,canActivate:[adminGuard,AdminPagesGuard]},
  {path:'funded-contracts/:id',component:FundedContactDetailsComponent,canActivate:[adminGuard,AdminPagesGuard]},
  {path:'users',component:UsersComponent,canActivate:[adminGuard,AdminPagesGuard]},
  {path:'users/admin',component:UsersComponent,canActivate:[adminGuard,AdminPagesGuard]},
  {path:'users/:id',component:UsersdetailsComponent,canActivate:[adminGuard,AdminPagesGuard]},
  {path:'partner',component:InstallerComponent,canActivate:[adminGuard,AdminPagesGuard]},
  {path:'partner/add',component:AddinstallerComponent,canActivate:[adminGuard,AdminPagesGuard]},
  {path:'partner/view',component:ViewinstallerComponent,canActivate:[adminGuard,AdminPagesGuard]},
  {path:'settings/changepw',component:ChangepasswordComponent,canActivate:[adminGuard,AdminPagesGuard]},
  {path:'notification',component:NotificationComponent,canActivate:[adminGuard,AdminPagesGuard]},
  {path:'settings/roles',component:RolesComponent,canActivate:[adminGuard,AdminPagesGuard]},
  {path:'settings/roles/:id',component:RolespermissionComponent,canActivate:[adminGuard,AdminPagesGuard]},
  {path:'settings/auditlog',component:AuditlogComponent,canActivate:[adminGuard,AdminPagesGuard]},
  {path:'loan-products',component:LoanProductsComponent,canActivate:[adminGuard]},
  {path:'loan-products/add',component:AddloanProductsComponent,canActivate:[adminGuard]},
  {path:'loan-products/:id',component:LoanProductsDetailsComponent,canActivate:[adminGuard]},
  {path:'pending-milestone-reviews',component:EquipmentComponent,canActivate:[adminGuard]},
  {path:'complete-milestone-reviews',component:ConstructionComponent,canActivate:[adminGuard]},
  {path:'permission-to-operate',component:PermissionToOperateComponent,canActivate:[adminGuard]},
  {path:'pending-sales-contracts',component:PendingSalesContractComponent,canActivate:[adminGuard]},
  {path:'completed-sales-contracts',component:CompletedSalesContractComponent,canActivate:[adminGuard]},
  {path:'disbursement-sequence',component:DisbursementSequenceComponent,canActivate:[adminGuard]},
  {path:'disbursement-sequence/add',component:AdddisbursementSequenceComponent,canActivate:[adminGuard]},
  {path:'disbursement-sequence/:id',component:DisbursementSequenceDetailsComponent,canActivate:[adminGuard]},
  {path:'pending-counter-signature',component:CounterSignatureComponent,canActivate:[adminGuard]},
  {path:'completed-counter-signature',component:CompleteCounterSignatureComponent,canActivate:[adminGuard]},

  { path: "**", redirectTo: "login", pathMatch: "full" },
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
