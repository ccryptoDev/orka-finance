import { BankAccounts } from 'src/entities/bankAccounts.entity';
import { EntityRepository, Repository } from 'typeorm';

@EntityRepository(BankAccounts)
export class BankAccountsRepository extends Repository<BankAccounts> {
 
}