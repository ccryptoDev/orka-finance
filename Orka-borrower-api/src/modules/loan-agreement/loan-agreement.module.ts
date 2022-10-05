import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { LoanAgreementEntity } from '../../entities/loanAgreement.entity';
import { DocusignAchFormEntity } from '../../entities/docusignAchForm.entity';
import { DocusignFinancingContractEntity } from '../../entities/docusignFinancingContract.entity';
import { DocusignPersonalGuarantorEntity } from '../../entities/docusignPersonalGuarantor.entity';
import { CustomerEntity } from '../../entities/customer.entity';
import { InstallerEntity } from '../../entities/installer.entity';
import { DisbursementEntity } from '../../entities/disbursementSequence.entity';
import { ProductEntity } from '../../entities/products.entity';
import { LendingLimitEntity } from '../../entities/lendingLimit.entity';
import { PlaidMasterEntity } from '../../entities/plaidMaster.entity';
import { PlaidAuthEntity } from '../../entities/plaidAuth.entity';
import { BankAccount } from '../../entities/bankAccount.entity';
import { UserBankAccount } from '../../entities/userBankAccount.entity';
import { LoanRepository } from 'src/repository/loan.repository';
import { UserRepository } from 'src/repository/users.repository';
import { DocusignModule } from '../docusign/docusign.module';
import { LoanAgreementController } from './loan-agreement.controller';
import { LoanAgreementService } from './loan-agreement.service';
import { MailService } from '../../mail/mail.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      LoanAgreementEntity,
      DocusignAchFormEntity,
      DocusignFinancingContractEntity,
      DocusignPersonalGuarantorEntity,
      CustomerEntity,
      InstallerEntity,
      DisbursementEntity,
      ProductEntity,
      LendingLimitEntity,
      PlaidMasterEntity,
      PlaidAuthEntity,
      BankAccount,
      UserBankAccount,
      LoanRepository,
      UserRepository,
    ]),
    DocusignModule,
  ],
  controllers: [LoanAgreementController],
  providers: [LoanAgreementService, MailService],
})
export class LoanAgreementModule {}
