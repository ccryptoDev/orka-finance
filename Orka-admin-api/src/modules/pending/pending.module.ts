import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';

import { PendingService } from './pending.service';
import { PendingController } from './pending.controller';
import { UserBankAccountRepository } from '../../repository/userBankAccounts.repository';
import { UserRepository } from '../../repository/users.repository';
import { CommentsRepository } from '../../repository/comments.repository';
import { LogRepository } from '../../repository/log.repository';
import { MailService } from '../../mail/mail.service';
import { LoanRepository } from '../../repository/loan.repository'
import { CreditreportRepository } from './../../repository/creditRepositiry.repository';
import { LoanService } from './../loan/loan.service';
import { ComplyAdvantageService } from '../comply-advantage/comply-advantage.service';
import { ComplyAdvantageReportRepository } from '../../repository/complyAdvantage.repository';
import { CustomerEntity } from '../../entities/customer.entity';
import { EquifaxModule } from '../equifax/equifax.module';
import { DecisionServiceModule } from '../decision-service/decision-service.module';
import { CreditReportModule } from '../credit-report/credit-report.module';
import { MiddeskModule } from '../middesk/middesk.module';
import { PlaidModule } from '../plaid/plaid.module';

@Module({
  controllers: [PendingController],
  exports: [PendingService],
  imports: [
    TypeOrmModule.forFeature([
      UserBankAccountRepository,
      UserRepository,
      CommentsRepository,
      LogRepository,
      LoanRepository,
      CreditreportRepository,
      ComplyAdvantageReportRepository,
      CustomerEntity
    ]),
    HttpModule,
    EquifaxModule,
    DecisionServiceModule,
    CreditReportModule,
    MiddeskModule,
    PlaidModule
  ],
  providers: [
    PendingService,
    MailService,
    LoanService,
    ComplyAdvantageService
  ]
})
export class PendingModule {}
