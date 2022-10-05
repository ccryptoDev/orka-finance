import { EntityRepository, Repository } from 'typeorm';
import { MilestoneEntity } from 'src/entities/milestone.entity';

@EntityRepository(MilestoneEntity)
export class Milestone extends Repository<MilestoneEntity> {
 
}