
import { EntityRepository, Repository } from 'typeorm';
import { Pages } from '../entities/pages.entity';

@EntityRepository(Pages)
export class PagesRepository extends Repository<Pages> {
 
}
