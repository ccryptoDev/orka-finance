import { ThankyouComponent } from './thankyou/thankyou.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoanidGuard } from '../_guards';
import { PagenotfoundComponent } from './pagenotfound/pagenotfound.component';
import { WelcomeComponent } from './welcome/welcome.component';
import { BusinessVerificationComponent } from './business-verification/business-verification.component';
import { BuildingInformationComponent } from './building-information/building-information.component';
import { BusinessPrincipalIdentityComponent } from './business-principal-identity/business-principal-identity.component';
import { PlaidComponent } from './plaid/plaid.component';
import { PlaidOptOutComponent } from './plaid-opt-out/plaid-opt-out.component';
import { PlaidSuccessComponent } from './plaid-success/plaid-success.component';
import { SorryComponent } from './sorry/sorry.component';

const routes: Routes = [
  { path: 'welcome', component: WelcomeComponent },
  { path: 'business-verification', component: BusinessVerificationComponent },
  { path: 'plaid', component: PlaidComponent },
  // { path: 'plaid-opt-out', component: PlaidOptOutComponent },
  { path: 'plaid-success', component: PlaidSuccessComponent },
  { path: 'business-owner-information', component: BusinessPrincipalIdentityComponent },
  { path: 'building-information', component: BuildingInformationComponent },
  { path: 'thankyou', component: ThankyouComponent },
  { path: 'sorry', component: SorryComponent },
  { path: '404', component: PagenotfoundComponent },
  { path: "**", redirectTo: "404", pathMatch: "full" },
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SalesRoutingModule { }
