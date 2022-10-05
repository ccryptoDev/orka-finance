import { EntityRepository, Repository } from 'typeorm';
import { SalesContractReviewEntity } from 'src/entities/salesContractReview.entity';

@EntityRepository(SalesContractReviewEntity)
export class SalesContractReview extends Repository<SalesContractReviewEntity> {
 
}