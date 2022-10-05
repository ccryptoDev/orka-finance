import { EntityRepository, Repository } from 'typeorm';
import { HistoricalBalanceEntity } from 'src/entities/historicalBalance.entity';

@EntityRepository(HistoricalBalanceEntity)
export class HistoricalBalanceRepository extends Repository<HistoricalBalanceEntity>{
    
}