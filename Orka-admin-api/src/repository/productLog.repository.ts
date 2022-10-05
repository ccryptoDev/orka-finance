import { EntityRepository, Repository } from 'typeorm';
import { ProductLogEntity } from '../entities/productLog.entity';

@EntityRepository(ProductLogEntity)
export class ProductLogRepository extends Repository<ProductLogEntity> {
 
}