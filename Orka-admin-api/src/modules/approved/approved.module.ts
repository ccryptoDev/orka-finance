import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';

import { ApprovedService } from './approved.service';
import { ApprovedController } from './approved.controller';
import { LoanService } from '../loan/loan.service'
import { UserBankAccountRepository } from '../../repository/userBankAccounts.repository';
import { UserRepository } from '../../repository/users.repository';
import { CommentsRepository } from '../../repository/comments.repository';
import { LogRepository } from '../../repository/log.repository';
import { LoanRepository } from '../../repository/loan.repository'
import { CreditreportRepository } from './../../repository/creditRepositiry.repository';
import { MiddeskService } from '../middesk/middesk.service';
import { ComplyAdvantageService } from '../comply-advantage/comply-advantage.service';
import { ComplyAdvantageReportRepository } from '../../repository/complyAdvantage.repository';
import { CustomerEntity } from '../../entities/customer.entity';
import { EquifaxModule } from '../equifax/equifax.module';
import { DecisionServiceModule } from '../decision-service/decision-service.module';

@Module({
  controllers: [ApprovedController],
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
    DecisionServiceModule
  ],
  providers: [
    ApprovedService,
    LoanService,
    MiddeskService,
    ComplyAdvantageService
  ]
})
export class ApprovedModule { }
