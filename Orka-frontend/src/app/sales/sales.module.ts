import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SalesRoutingModule } from './sales-routing.module';
import { FormsModule,ReactiveFormsModule } from '@angular/forms';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { NgxMaskModule } from 'ngx-mask';
import { NgxBootstrapIconsModule } from 'ngx-bootstrap-icons';
import { checkCircleFill,arrowClockwise,cloudUploadFill, folderFill, fileEarmarkFill, download, trashFill } from 'ngx-bootstrap-icons';
import { NgxFileDropModule } from 'ngx-file-drop';
import { PagenotfoundComponent } from './pagenotfound/pagenotfound.component';
import { SignatureFieldComponent } from '../signature-field/signature-field.component';
import { SignaturePadModule } from 'angular2-signaturepad';
import { GooglePlaceModule } from "ngx-google-places-autocomplete";
import {WelcomeComponent} from './welcome/welcome.component';
import {BusinessVerificationComponent} from './business-verification/business-verification.component';
import {BuildingInformationComponent} from './building-information/building-information.component';
import {BusinessPrincipalIdentityComponent} from './business-principal-identity/business-principal-identity.component';
import { NgxPlaidLinkModule } from "ngx-plaid-link";
import { PlaidComponent } from './plaid/plaid.component';
import { PlaidOptOutComponent } from './plaid-opt-out/plaid-opt-out.component';
import { PlaidSuccessComponent } from './plaid-success/plaid-success.component';
import { ThankyouComponent } from './thankyou/thankyou.component';
import { SorryComponent } from './sorry/sorry.component';
import {GtagModule} from "angular-gtag";

const icons = {
  checkCircleFill,
  arrowClockwise,
  cloudUploadFill,
  folderFill,
  fileEarmarkFill,
  download,
  trashFill
};

@NgModule({
  declarations: [
    PagenotfoundComponent,
    SignatureFieldComponent,
    WelcomeComponent,
    BusinessVerificationComponent,
    BuildingInformationComponent,
    BusinessPrincipalIdentityComponent,
    PlaidComponent,
    PlaidOptOutComponent,
    PlaidSuccessComponent,
    ThankyouComponent,
    SorryComponent,


  ],
    imports: [
        CommonModule,
        SalesRoutingModule,
        FormsModule,
        NgxBootstrapIconsModule.pick(icons),
        NgxFileDropModule,
        BsDatepickerModule.forRoot(),
        NgxMaskModule.forRoot(),
        SignaturePadModule,
        GooglePlaceModule,
        ReactiveFormsModule,
        NgxPlaidLinkModule,
        GtagModule
    ],providers:[
  ]
})
export class SalesModule { }
