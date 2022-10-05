import { PrivacyPolicyComponent } from "./privacy-policy/privacy-policy.component"
import { SetPasswordComponent } from './set-password/set-password.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {borrowerGuard,borrowerloginGuard} from './_guards';
import { BorrowerSidebarComponent } from "./borrower-sidebar/borrower-sidebar.component";
import { BankDocumentsComponent } from "./borrower/bank-documents/bank-documents.component";
import { TermsAndConditionsComponent } from './terms-and-conditions/terms-and-conditions.component';
import { SecurityPolicyComponent } from './security-policy/security-policy.component';


const routes: Routes = [
    
    { path: "sales", loadChildren: () => import('./sales/sales.module').then(m => m.SalesModule)},
    { path: "partner", loadChildren: () => import('./installer/installer.module').then(m => m.InstallerModule)},
    { path: "borrower", loadChildren: () => import('./borrower/borrower.module').then(m => m.BorrowerModule)},
    { path: "admin", loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule)},
    { path: 'privacy-policy',component:PrivacyPolicyComponent},
    { path:'terms-and-conditions',component:TermsAndConditionsComponent},
    { path:'security-policy',component:SecurityPolicyComponent},
    { path: "set-password/:id",component: SetPasswordComponent},
    // { path: 'borrower/home', component: BorrowerSidebarComponent,canActivate:[borrowerloginGuard]},
    // { path: 'borrower/bank-documents', component: BankDocumentsComponent,canActivate:[borrowerloginGuard]},
    { path: '', redirectTo: "admin", pathMatch: 'full'},
    { path: '**', redirectTo: "admin", pathMatch: 'full'},
  ];

@NgModule({
  //imports: [RouterModule.forRoot(routes,{scrollPositionRestoration: 'enabled',useHash: true, relativeLinkResolution: "legacy", })],
  imports: [RouterModule.forRoot(routes,{scrollPositionRestoration: 'enabled' })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
