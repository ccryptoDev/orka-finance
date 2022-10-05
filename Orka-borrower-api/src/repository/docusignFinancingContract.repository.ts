import { EntityRepository, Repository } from 'typeorm';
import { DocusignFinancingContractEntity } from '../entities/docusignFinancingContract.entity';

@EntityRepository(DocusignFinancingContractEntity)
export class DocusignFinancingContractRepository extends Repository<
  DocusignFinancingContractEntity
> {}
