import { ProductLogEntity } from './../../entities/productLog.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LogRepository } from 'src/repository/log.repository';
import {ProductLogRepository} from 'src/repository/productLog.repository'
import { LogEntity } from 'src/entities/log.entity';
@Injectable()
export class LogsService {
    constructor(@InjectRepository(LogRepository) private readonly logRepository:LogRepository,
    @InjectRepository(ProductLogRepository) private readonly productLogRepository:ProductLogRepository
    ){

    }

    async log(loanId,userId,message){
      const log = new LogEntity();
      log.loan_id = loanId;
      log.user_id = userId;
      log.module = message;
      await this.logRepository.save(log);
    }

    async productLog(installer_id,user_id,message)
    {
      const log = new ProductLogEntity();
      log.installer_id = installer_id;
      log.user_id = user_id;
      log.activity=message
      await this.productLogRepository.save(log)
    }

}
