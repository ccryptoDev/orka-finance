import { EntityRepository, Repository } from 'typeorm';
import { CoapplicationEntity } from '../entities/coapplican.entity';

@EntityRepository(CoapplicationEntity)
export class CoapplicationRepository extends Repository<CoapplicationEntity> {}
