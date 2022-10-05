import { EntityRepository, Repository } from 'typeorm';
import { LendingLimitEntity } from '../entities/lendingLimit.entity';

@EntityRepository(LendingLimitEntity)
export class LendingLimitRepository extends Repository<LendingLimitEntity> { }