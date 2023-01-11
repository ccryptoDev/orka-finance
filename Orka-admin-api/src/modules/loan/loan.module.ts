import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { LoanController } from './loan.controller';
import { LoanService } from './loan.service';
import { CreditReportModule } from '../credit-report/credit-report.module';
import { MiddeskModule } from '../middesk/middesk.module';
import { ComplyAdvantageModule } from '../comply-advantage/comply-advantage.module';
import { CustomerEntity } from '../../entities/customer.entity';
import { DecisionServiceModule } from '../decision-service/decision-service.module';
import { PlaidModule } from '../plaid/plaid.module';
import { MailModule } from 'src/mail/mail.module';

@Module({
  controllers: [LoanController],
  exports: [LoanService],
  imports: [
    TypeOrmModule.forFeature([CustomerEntity]),
    CreditReportModule,
    MiddeskModule,
    ComplyAdvantageModule,
    DecisionServiceModule,
    PlaidModule,
    MailModule
  ],
  providers: [LoanService]
})
export class LoanModule {}
