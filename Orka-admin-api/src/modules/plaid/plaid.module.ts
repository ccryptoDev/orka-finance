import { Module } from '@nestjs/common';
import { PlaidService } from './plaid.service';
import { PlaidController } from './plaid.controller';
import { MailModule } from '../../mail/mail.module';
import { MailService } from '../../mail/mail.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BankAccountsRepository } from 'src/repository/bankAccounts.repository';
import { BankTransactionsRepository } from 'src/repository/bankTranscations.repository';
import { CustomerRepository } from 'src/repository/customer.repository';
import {LoanRepository} from '../../repository/loan.repository';
import { PlaidMasterRepository } from 'src/repository/plaidMaster.repository';
import { HistoricalBalanceRepository } from 'src/repository/historicalBalance.repository';
import { PlaidAuthRepository } from 'src/repository/plaidAuth.repository';
@Module({
  controllers: [PlaidController],
  imports:[
    TypeOrmModule.forFeature([BankAccountsRepository, BankTransactionsRepository, 
      CustomerRepository,LoanRepository,PlaidMasterRepository,HistoricalBalanceRepository,
      PlaidAuthRepository
    ]),
    MailModule
  ],
  exports:[PlaidService,],
  providers: [PlaidService,MailService]
})
export class PlaidModule {}
