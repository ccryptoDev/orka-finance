
import { Creditreport } from 'src/entities/creditReport.entity';
import { EntityRepository, Repository } from 'typeorm';

@EntityRepository(Creditreport)
export class CreditreportRepository extends Repository<Creditreport> {
 
}
