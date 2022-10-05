import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InstallerRoutingModule } from './installer-routing.module';
import { MainComponent } from './main/main.component';
import { CustomersComponent } from './customers/customers.component';
import { NgxBootstrapIconsModule } from 'ngx-bootstrap-icons';
import { cloudArrowUpFill,search,currencyDollar,fileEarmarkFill,folderFill } from 'ngx-bootstrap-icons';
import { FormsModule,ReactiveFormsModule } from '@angular/forms';
import { NgxFileDropModule } from 'ngx-file-drop';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { SettingsComponent } from './settings/settings.component';
import { LoginComponent } from './login/login.component';
import { NgxMaskModule } from 'ngx-mask';
import { SignatureFieldComponent } from '../signature-field1/signature-field.component';
import { SignaturePadModule } from 'angular2-signaturepad';
import { UserManagementComponent } from './user-management/user-management.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { DataTablesModule } from "angular-datatables";
import { CreateClientOpportunityComponent } from './customers/create-client-opportunity/create-client-opportunity.component';
import { HomeComponent } from './home/home.component';
import { CalculatorComponent } from './calculator/calculator.component';
import { OpportunityComponent } from './opportunity/opportunity.component';
import { DocumentCenterComponent } from './document-center/document-center.component';
import { PrivacyPolicyComponent } from './privacy-policy/privacy-policy.component';
import { GooglePlaceModule } from 'ngx-google-places-autocomplete';
import { AgmCoreModule } from '@agm/core';
import {GtagModule} from "angular-gtag";

const icons = {
  cloudArrowUpFill,
  search,
  currencyDollar,
  fileEarmarkFill,
  folderFill
};



@NgModule({
  declarations: [
    MainComponent,
    CustomersComponent,
    SettingsComponent,
    LoginComponent,
    SignatureFieldComponent,
    UserManagementComponent,
    ForgotPasswordComponent,
    ResetPasswordComponent,
    CreateClientOpportunityComponent,
    HomeComponent,
    CalculatorComponent,
    OpportunityComponent,
    DocumentCenterComponent,
    PrivacyPolicyComponent,
  ],
    imports: [
        CommonModule,
        InstallerRoutingModule,
        NgxBootstrapIconsModule.pick(icons),
        FormsModule,
        BsDatepickerModule.forRoot(),
        NgxFileDropModule,
        NgxMaskModule.forRoot(),
        ReactiveFormsModule,
        SignaturePadModule,
        DataTablesModule,
        TabsModule.forRoot(),
        GooglePlaceModule,
        AgmCoreModule.forRoot({
            apiKey: 'AIzaSyBgd5_DiAWqvZIDeRCHd7I6thLwPSuMei8',
        }),
        GtagModule,
    ]
})
export class InstallerModule { }

//qashi key AIzaSyBgd5_DiAWqvZIDeRCHd7I6thLwPSuMei8
//orka key AIzaSyChTMFwG_Px1ZfvZGor66FnflkhvbuM5U8
