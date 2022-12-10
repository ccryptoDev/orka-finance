import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import typeOrmConfig from './configs/database/typeorm.config';


import { QuestionsModule } from './modules/questions/questions.module';
import { UsersModule } from './modules/users/users.module';
import { APP_GUARD } from '@nestjs/core';
import {RolesGuard} from './guards/roles.guard';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { PendingModule } from './modules/pending/pending.module';
import { IncompleteModule } from './modules/incomplete/incomplete.module';
import { ApprovedModule } from './modules/approved/approved.module';
import { DeniedModule } from './modules/denied/denied.module';
import { MailModule } from './mail/mail.module';
import { ConfigModule } from '@nestjs/config';
import { FilesModule } from './modules/files/files.module';
import { CustomerModule } from './modules/customer/customer.module';
import { InstallerModule } from './modules/installer/installer.module';
import { FundedContractsModule } from './modules/funded-contracts/funded-contracts.module';
import { PlaidModule } from './modules/plaid/plaid.module';
import { UploadsModule } from './modules/uploads/uploads.module';
import { NotificationModule } from './modules/notification/notification.module';
import { RolesModule } from './modules/roles/roles.module';
import { AuditlogModule } from './modules/auditlog/auditlog.module';
import { OffersModule } from './modules/offers/offers.module';
import { LoanModule } from './modules/loan/loan.module';
import { LoanproductsModule } from './modules/loanproducts/loanproducts.module';
import { MilestoneModule } from './modules/milestone/milestone.module';
import { DecisionServiceModule } from './modules/decision-service/decision-service.module';
import { SalesContractreviewModule } from './modules/sales-contractreview/sales-contractreview.module';
import { MiddeskModule } from './modules/middesk/middesk.module';
import { MiddeskService } from './modules/middesk/middesk.service';
import { ComplyAdvantageModule } from './modules/comply-advantage/comply-advantage.module';
import { DisbursementSequenceModule } from './modules/disbursement-sequence/disbursement-sequence.module';
import { CounterSignatureModule } from './modules/counter-signature/counter-signature.module';
import { equifax } from './configs/equifax.config';


@Module({
  imports: [
    TypeOrmModule.forRoot(typeOrmConfig),
    UsersModule,
    DashboardModule,
    PendingModule,
    IncompleteModule,
    ApprovedModule,
    DeniedModule,
    MailModule,
    CustomerModule,
    ConfigModule.forRoot({
      isGlobal: true, // no need to import into other modules
      load: [equifax]
    }),
    FilesModule,
    InstallerModule,
    FundedContractsModule,
    PlaidModule,
    UploadsModule,
    NotificationModule,
    RolesModule,
    AuditlogModule,
    OffersModule,
    LoanModule,
    LoanproductsModule,
    MilestoneModule,
    DecisionServiceModule,
    SalesContractreviewModule,
    MiddeskModule,
    ComplyAdvantageModule,
    DisbursementSequenceModule,
    CounterSignatureModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
