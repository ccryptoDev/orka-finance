
import { ComplyAdvantageReport } from 'src/entities/complyAdvantage.entity';
import { EntityRepository, Repository } from 'typeorm';

@EntityRepository(ComplyAdvantageReport)
export class ComplyAdvantageReportRepository extends Repository<ComplyAdvantageReport> {

}
