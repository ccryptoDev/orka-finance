import { EntityRepository, Repository } from 'typeorm';
import { LoanAgreementEntity } from '../entities/loanAgreement.entity';

@EntityRepository(LoanAgreementEntity)
export class LoanAgreementRepository extends Repository<LoanAgreementEntity> {}
