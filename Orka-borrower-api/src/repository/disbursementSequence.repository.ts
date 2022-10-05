import { EntityRepository, Repository } from 'typeorm';
import { DisbursementEntity } from 'src/entities/disbursementSequence.entity';

@EntityRepository(DisbursementEntity)
export class DisbursementSequence extends Repository<DisbursementEntity> {
 
}