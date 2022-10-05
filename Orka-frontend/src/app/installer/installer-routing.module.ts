import { CalculatorComponent } from './calculator/calculator.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MainComponent } from './main/main.component';
import { CustomersComponent } from './customers/customers.component';
import { SettingsComponent } from './settings/settings.component';
import { LoginComponent } from './login/login.component';
import { installerGuard,installerloginGuard,InstallerPagesGuard} from '../_guards';
import { UserManagementComponent } from './user-management/user-management.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { CreateClientOpportunityComponent } from './customers/create-client-opportunity/create-client-opportunity.component';
import { HomeComponent } from './home/home.component';
import { OpportunityComponent} from './opportunity/opportunity.component';
import { DocumentCenterComponent } from './document-center/document-center.component';

const routes: Routes = [ 
  { path:'opportunity',component:HomeComponent,canActivate:[installerGuard]},
  { path:'calculator',component:CalculatorComponent,canActivate:[installerGuard]},
  { path:'opportunity/:id',component:OpportunityComponent,canActivate:[installerGuard]},
  { path:'login', component: LoginComponent,canActivate:[installerloginGuard]},
  { path:'forgot-password', component: ForgotPasswordComponent,canActivate:[installerloginGuard]},
  { path:'passwordReset', component: ResetPasswordComponent,canActivate:[installerloginGuard]},
  { path:'main', component: MainComponent,canActivate:[installerGuard]},
  { path:'customers', component: CustomersComponent,canActivate:[installerGuard,InstallerPagesGuard]},
  { path:'createClientOpportunity', component: CreateClientOpportunityComponent},
  { path:'profile/settings', component: SettingsComponent,canActivate:[installerGuard,InstallerPagesGuard]},
  { path:'profile/usermanagement', component: UserManagementComponent,canActivate:[installerGuard,InstallerPagesGuard]},
  { path:'document-center',component:DocumentCenterComponent,canActivate:[installerGuard]},
  { path: "**", redirectTo: "login", pathMatch: "full" },
  
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class InstallerRoutingModule { }
