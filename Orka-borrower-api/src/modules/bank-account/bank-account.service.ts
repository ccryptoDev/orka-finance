import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

import { BankAccount } from '../../entities/bankAccount.entity';
import { PlaidAuthEntity } from '../../entities/plaidAuth.entity';
import { UserBankAccount } from '../../entities/userBankAccount.entity';

export interface BankAccounts {
  plaid: (BankAccount & Pick<PlaidAuthEntity, "accountNumber">)[];
  manuallyInputed: UserBankAccount[];
}

@Injectable()
export class BankAccountService {
  constructor(
    @InjectRepository(BankAccount) private readonly plaidBankAccountRepository: Repository<BankAccount>,
    @InjectRepository(PlaidAuthEntity) private readonly plaidBankAccountDetailsRepository: Repository<PlaidAuthEntity>,
    @InjectRepository(UserBankAccount) private readonly manuallyInputedBankAccountRepository: Repository<UserBankAccount>
  ) {}

  public async getByLoanId(loanId: string): Promise<BankAccounts> {
    const manuallyInputedAccounts = await this.manuallyInputedBankAccountRepository.find({ loanId });
    const plaidAccounts = await this.plaidBankAccountRepository.find({ loan_id: loanId });
    const plaidAccountIds = plaidAccounts.map((plaiAccount) => plaiAccount.plaidAccountId);
    const plaidAccountsDetails = await this.plaidBankAccountDetailsRepository.find({ plaidAccountId: In(plaidAccountIds) });
    const plaidAccountsWithAccountNumber = plaidAccounts.map((account) => {
      const accountDetails = plaidAccountsDetails.find((accountDetails) => account.plaidAccountId === accountDetails.plaidAccountId);

      return Object.assign({}, account, { accountNumber: accountDetails.accountNumber });
    });

    return { manuallyInputed: manuallyInputedAccounts, plaid: plaidAccountsWithAccountNumber };
  }
}
