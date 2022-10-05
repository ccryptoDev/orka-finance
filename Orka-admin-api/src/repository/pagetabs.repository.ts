
import { EntityRepository, Repository } from 'typeorm';
import { Pagetabs } from '../entities/pagetabs.entity';

@EntityRepository(Pagetabs)
export class PagetabsRepository extends Repository<Pagetabs> {
 
}
