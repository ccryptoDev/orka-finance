import { PlaidAuthEntity } from './../entities/plaidAuth.entity';
import { EntityRepository, Repository } from 'typeorm';

@EntityRepository(PlaidAuthEntity)
export class PlaidAuthRepository extends Repository<PlaidAuthEntity>{
    
}