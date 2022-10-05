import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { BankAccount } from '../../entities/bankAccount.entity';
import { PlaidAuthEntity } from '../../entities/plaidAuth.entity';
import { UserBankAccount } from '../../entities/userBankAccount.entity';
import { BankAccountController } from './bank-account.controller';
import { BankAccountService } from './bank-account.service';

@Module({
  imports: [TypeOrmModule.forFeature([BankAccount, PlaidAuthEntity, UserBankAccount])],
  controllers: [BankAccountController],
  providers: [BankAccountService]
})
export class BankAccountModule {}
