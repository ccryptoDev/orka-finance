
import { EntityRepository, Repository } from 'typeorm';
import { Rolesmaster } from '../entities/rolesmaster.entity';

@EntityRepository(Rolesmaster)
export class RolesmasterRepository extends Repository<Rolesmaster> {
 
}
