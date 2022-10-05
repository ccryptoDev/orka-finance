import { EntityRepository, Repository } from 'typeorm';
import { DocusignAchFormEntity } from '../entities/docusignAchForm.entity';

@EntityRepository(DocusignAchFormEntity)
export class DocusignAchFormRepository extends Repository<
  DocusignAchFormEntity
> {}
