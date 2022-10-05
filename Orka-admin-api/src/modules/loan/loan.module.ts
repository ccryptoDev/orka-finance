import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';

import { LoanController } from './loan.controller';
import { LoanService } from './loan.service';
import { UserBankAccountRepository } from '../../repository/userBankAccounts.repository';
import { UserRepository } from '../../repository/users.repository';
import { CommentsRepository } from '../../repository/comments.repository';
import { LogRepository } from '../../repository/log.repository';
import { LoanRepository } from '../../repository/loan.repository'
import { CreditreportRepository } from './../../repository/creditRepositiry.repository';
import { MiddeskModule } from '../middesk/middesk.module';
import { ComplyAdvantageModule } from '../comply-advantage/comply-advantage.module';
import { CustomerEntity } from '../../entities/customer.entity';
import { EquifaxModule } from '../equifax/equifax.module';
import { DecisionServiceModule } from '../decision-service/decision-service.module';

@Module({
  controllers: [LoanController],
  exports: [LoanService],
  imports: [
    TypeOrmModule.forFeature([
      UserBankAccountRepository,
      UserRepository,
      CommentsRepository,
      LogRepository,
      LoanRepository,
      CreditreportRepository,
      CustomerEntity
    ]),
    HttpModule,
    MiddeskModule,
    ComplyAdvantageModule,
    EquifaxModule,
    DecisionServiceModule
  ],
  providers: [LoanService]
})
export class LoanModule { }
