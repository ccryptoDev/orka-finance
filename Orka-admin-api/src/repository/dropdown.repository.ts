import { EntityRepository, Repository } from 'typeorm';
import { DropDownEntity } from 'src/entities/dropdown.entity';

@EntityRepository(DropDownEntity)
export class DropDownRepository extends Repository<DropDownEntity> {
 
}