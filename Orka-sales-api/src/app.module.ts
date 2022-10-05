import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfig } from './configs/database/typeorm.config';
import { MailModule } from './mail/mail.module';
import { ConfigModule } from '@nestjs/config';
import { StartModule } from './modules/create-opportunity/start.module';
import { UploadsModule } from './modules/uploads/uploads.module';
import { BusinessVerificationModule } from './modules/business-verification/business-verification.module';
import { BusinessPrincipleIdentityModule } from './modules/business-principle-identity/business-principle-identity.module';
import { BuildingInformationModule } from './modules/building-information/building-information.module';
import { CertificateOfGoodStandingModule } from './modules/certificate-of-good-standing/certificate-of-good-standing.module';
import { LogsModule } from './common/logs/logs.module';
import { PlaidOptoutModule } from './modules/plaid-optout/plaid-optout.module';
import { LoanModule } from './modules/loan/loan.module';
import { QuestionsModule } from './modules/questions/questions.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(typeOrmConfig),
    MailModule,
    StartModule,
    BusinessVerificationModule,
    BusinessPrincipleIdentityModule,
    BuildingInformationModule,
    CertificateOfGoodStandingModule,
    UploadsModule,
    ConfigModule.forRoot({
      isGlobal: true, // no need to import into other modules
    }),
    LogsModule,
    PlaidOptoutModule,
    LoanModule,
    QuestionsModule,
  ],
})
export class AppModule {}
