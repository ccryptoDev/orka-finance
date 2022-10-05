
import { MiddeskReport } from 'src/entities/middesk.entity';
import { EntityRepository, Repository } from 'typeorm';

@EntityRepository(MiddeskReport)
export class MiddeskReportRepository extends Repository<MiddeskReport> {
 
}
