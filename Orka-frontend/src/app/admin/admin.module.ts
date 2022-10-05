import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardComponent } from './dashboard/dashboard.component';
import {AdminRoutingModule} from './admin-routing.module';
import { QuestionsComponent } from './questions/questions.component';
import { FormsModule,ReactiveFormsModule } from '@angular/forms';
import { LoginComponent } from './login/login.component';
import { PendingsComponent } from './pendings/pendings.component';
import { PendingsdetailsComponent } from './pendingsdetails/pendingsdetails.component';
import { DataTablesModule } from "angular-datatables";
import { TabsModule } from 'ngx-bootstrap/tabs';
import { IncompleteComponent } from './incomplete/incomplete.component';
import { IncompletedetailsComponent } from './incompletedetails/incompletedetails.component';
import { ApprovedComponent } from './approved/approved.component';
import { ApproveddetailsComponent } from './approveddetails/approveddetails.component';
import { DeniedComponent } from './denied/denied.component';
import { DenieddetailsComponent } from './denieddetails/denieddetails.component';
import { AccordionModule } from 'ngx-bootstrap/accordion';
import { UsersComponent } from './users/users.component';
import { UsersdetailsComponent } from './usersdetails/usersdetails.component';
import { InstallerComponent } from './installer/installer.component';
import { AddinstallerComponent } from './addinstaller/addinstaller.component';
import { ViewinstallerComponent } from './viewinstaller/viewinstaller.component';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { ChangepasswordComponent } from './changepassword/changepassword.component';
import { FundedContractsComponent } from './funded-contracts/funded-contracts.component';
import { FundedContactDetailsComponent } from './funded-contact-details/funded-contact-details.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { NgxFileDropModule } from 'ngx-file-drop';
import { NotificationComponent } from './notification/notification.component';
import { RolesComponent } from './roles/roles.component';
import { RolespermissionComponent } from './rolespermission/rolespermission.component';
import { AngularMultiSelectModule } from 'angular2-multiselect-dropdown';
import { AuditlogComponent } from './auditlog/auditlog.component';
import { NgxMaskModule } from 'ngx-mask';
import { MatTableModule } from '@angular/material/table';
import { LoanProductsComponent } from './loan-products/loan-products.component';
import { LoanProductsDetailsComponent } from './loan-products-details/loan-products-details.component';
import { AddloanProductsComponent } from './addloan-products/addloan-products.component';
import { SalesContractComponent } from './sales-contract/sales-contract.component';
import { FinanceContractComponent } from './finance-contract/finance-contract.component';
import { EquipmentComponent } from './equipment/equipment.component';
import { ConstructionComponent } from './construction/construction.component';
import { PermissionToOperateComponent } from './permission-to-operate/permission-to-operate.component';
import { GooglePlaceModule } from 'ngx-google-places-autocomplete';
import { MilestoneDetailsComponent } from './milestone-details/milestone-details.component';
import { PendingSalesContractComponent } from './pending-sales-contract/pending-sales-contract.component';
import { CompletedSalesContractComponent } from './completed-sales-contract/completed-sales-contract.component';
import { ReviewChecklistComponent } from './review-checklist/review-checklist.component';
import { MilestoneChecklistComponent } from './milestone-checklist/milestone-checklist.component';
import { DisbursementSequenceComponent } from './disbursement-sequence/disbursement-sequence.component';
import { AdddisbursementSequenceComponent } from './adddisbursement-sequence/adddisbursement-sequence.component';
import { DisbursementSequenceDetailsComponent } from './disbursement-sequence-details/disbursement-sequence-details.component';
import { CounterSignatureComponent } from './counter-signature/counter-signature.component';
import { CounterSignatureDetailsComponent } from './counter-signature-details/counter-signature-details.component';
import { CompleteCounterSignatureComponent } from './complete-counter-signature/complete-counter-signature.component';


@NgModule({
  declarations: [
    DashboardComponent,
    QuestionsComponent,
    LoginComponent,
    PendingsComponent,
    PendingsdetailsComponent,
    IncompleteComponent,
    IncompletedetailsComponent,
    ApprovedComponent,
    ApproveddetailsComponent,
    DeniedComponent,
    DenieddetailsComponent,
    UsersComponent,
    UsersdetailsComponent,
    InstallerComponent,
    AddinstallerComponent,
    ViewinstallerComponent,
    ChangepasswordComponent,
    FundedContractsComponent,
    FundedContactDetailsComponent,
    ForgotPasswordComponent,
    ResetPasswordComponent,
    NotificationComponent,
    RolesComponent,
    RolespermissionComponent,
    AuditlogComponent,
    LoanProductsComponent,
    LoanProductsDetailsComponent,
    AddloanProductsComponent,
    SalesContractComponent,
    FinanceContractComponent,
    EquipmentComponent,
    ConstructionComponent,
    PermissionToOperateComponent,
    MilestoneDetailsComponent,
    PendingSalesContractComponent,
    CompletedSalesContractComponent,
    ReviewChecklistComponent,
    MilestoneChecklistComponent,
    DisbursementSequenceComponent,
    AdddisbursementSequenceComponent,
    DisbursementSequenceDetailsComponent,
    CounterSignatureComponent,
    CounterSignatureDetailsComponent,
    CompleteCounterSignatureComponent,
  ],
  imports: [
    CommonModule,
    AdminRoutingModule,
    FormsModule,
    DataTablesModule,
    TabsModule.forRoot(),
    AccordionModule.forRoot(),
    ReactiveFormsModule,
    BsDatepickerModule.forRoot(),
    NgxFileDropModule,
    AngularMultiSelectModule,
    NgxMaskModule.forRoot(),
    GooglePlaceModule,
    MatTableModule,
  ]
})
export class AdminModule { }
