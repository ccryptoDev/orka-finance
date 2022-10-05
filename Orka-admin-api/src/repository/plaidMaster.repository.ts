import { EntityRepository, Repository } from 'typeorm';
import { PlaidMasterEntity } from 'src/entities/plaidMaster.entity';

@EntityRepository(PlaidMasterEntity)
export class PlaidMasterRepository extends Repository<PlaidMasterEntity>{
    
}