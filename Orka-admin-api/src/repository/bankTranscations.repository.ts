
import { BankTransactions } from 'src/entities/bankTransactions.entity';
import { EntityRepository, Repository } from 'typeorm';

@EntityRepository(BankTransactions)
export class BankTransactionsRepository extends Repository<BankTransactions> {
 
}