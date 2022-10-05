import { CacheModule, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_GUARD } from '@nestjs/core';

import { typeOrmConfig } from './configs/database/typeorm.config';
import { UsersModule } from './modules/users/users.module';
import { UploadsModule } from './modules/uploads/uploads.module';
import { OverviewModule } from './modules/overview/overview.module';
import { MakePaymentModule } from './modules/make-payment/make-payment.module';
import { PaymentDetailsModule } from './modules/payment-details/payment-details.module';
import { RolesGuard } from './guards/roles.guard';
import { PaymentMethodModule } from './modules/payment-method/payment-method.module';
import { PlaidModule } from './modules/plaid/plaid.module';
import { MailModule } from './mail/mail.module';
import { DocusignModule } from './modules/docusign/docusign.module';
import { LoanAgreementModule } from './modules/loan-agreement/loan-agreement.module';
import { BorrowerHomeModule } from './modules/borrower-home/borrower-home.module';
import { BankAccountModule } from './modules/bank-account/bank-account.module';
import { LoanModule } from './modules/loan/loan.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(typeOrmConfig),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    CacheModule.register({
      isGlobal: true,
    }),
    UploadsModule,
    UsersModule,
    OverviewModule,
    MakePaymentModule,
    PaymentDetailsModule,
    PaymentMethodModule,
    PlaidModule,
    MailModule,
    DocusignModule,
    LoanAgreementModule,
    BorrowerHomeModule,
    BankAccountModule,
    LoanModule
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
