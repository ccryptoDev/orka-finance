import { EntityRepository, Repository } from 'typeorm';
import {ProductEntity} from '../entities/products.entity'

@EntityRepository(ProductEntity)
export class ProductRepository extends Repository<ProductEntity>{
    
}