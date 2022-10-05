import { EntityRepository, Repository } from 'typeorm';
import { DocusignPersonalGuarantorEntity } from '../entities/docusignPersonalGuarantor.entity';

@EntityRepository(DocusignPersonalGuarantorEntity)
export class DocusignPersonalGuarantorRepository extends Repository<
  DocusignPersonalGuarantorEntity
> {}
