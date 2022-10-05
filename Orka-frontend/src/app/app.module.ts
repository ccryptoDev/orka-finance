import { LOCALE_ID, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgxPlaidLinkModule } from 'ngx-plaid-link';

import { AppRoutingModule } from './app-routing.module';
import { FormsModule,ReactiveFormsModule } from '@angular/forms';
import { AppComponent } from './app.component';
import { ModalModule } from 'ngx-bootstrap/modal';
import { HttpClientModule,HTTP_INTERCEPTORS } from '@angular/common/http';
import { PrettyJsonModule} from 'angular2-prettyjson';
import { NgxFileDropModule } from 'ngx-file-drop';
import { CurrencyPipe, registerLocaleData } from '@angular/common';
import { InstallersidebarComponent } from './installersidebar/installersidebar.component';
import { NgxBootstrapIconsModule } from 'ngx-bootstrap-icons';
import { gridFill,person,cardText } from 'ngx-bootstrap-icons';
import { NgxSpinnerModule } from "ngx-spinner";
import {HttpService} from './_service/http.service';
import {JwtInterceptor} from './_service/jwt.interceptor';
import { AdminsidebarComponent } from './adminsidebar/adminsidebar.component';
import { BorrowerSidebarComponent } from './borrower-sidebar/borrower-sidebar.component';
import { DatePipe,DecimalPipe } from '@angular/common';
import { SetPasswordComponent } from './set-password/set-password.component';
import { ToastrModule } from 'ngx-toastr';
import { GooglePlaceModule } from "ngx-google-places-autocomplete";
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { DataTablesModule } from "angular-datatables";
import { PrivacyPolicyComponent } from './privacy-policy/privacy-policy.component';
import { DocumentCenterComponent } from './borrower/document-center/document-center.component';
import { HomeComponent } from './borrower/home/home.component';
import { SignComponent } from './borrower/sign/sign.component';
import { BankDocumentsComponent } from './borrower/bank-documents/bank-documents.component';
import { SuccessComponent } from './borrower/success/success.component';
import { LoanDocumentsComponent } from './borrower/loan-documents/loan-documents.component';
import { TermsAndConditionsComponent } from './terms-and-conditions/terms-and-conditions.component';
import { SecurityPolicyComponent } from './security-policy/security-policy.component';
import localeFr from '@angular/common/locales/fr';
import { GtagModule } from 'angular-gtag';


const icons = {
  gridFill,
  person,
  cardText
};

registerLocaleData(localeFr)


@NgModule({
  declarations: [
    AppComponent,
    InstallersidebarComponent,
    AdminsidebarComponent,
    BorrowerSidebarComponent,
    SetPasswordComponent,
    PrivacyPolicyComponent,
    DocumentCenterComponent,
    HomeComponent,
    SignComponent,
    BankDocumentsComponent,
    SuccessComponent,
    LoanDocumentsComponent,
    TermsAndConditionsComponent,
    SecurityPolicyComponent

  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    ModalModule.forRoot(),
    NgxBootstrapIconsModule.pick(icons),
    HttpClientModule,
    NgxSpinnerModule,
    GooglePlaceModule,
    ToastrModule.forRoot(),
    NgbModule,
    PrettyJsonModule,
    DataTablesModule,
    NgxFileDropModule,
    NgxPlaidLinkModule,
    GtagModule.forRoot({trackingId: 'GTM-TNDXGRX', trackPageviews: true}),


  ],
  providers: [BorrowerSidebarComponent,CurrencyPipe,DatePipe,DecimalPipe,HttpService,{ provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true }, { provide: LOCALE_ID, useValue: 'fr-FR'}],
  bootstrap: [AppComponent]
})
export class AppModule { }
