import { EntityRepository, Repository } from 'typeorm';
import {PartnerProductEntity} from '../entities/partnerProducts.entity'

@EntityRepository(PartnerProductEntity)
export class PartnerProductRepository extends Repository<PartnerProductEntity>{
    
}