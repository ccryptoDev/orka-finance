import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LogRepository } from 'src/repository/log.repository';
import { LogEntity } from 'src/entities/log.entity';
@Injectable()
export class LogsService {
  constructor(
    @InjectRepository(LogRepository)
    private readonly logRepository: LogRepository,
  ) {}

  async log(loanId, userId, message) {
    const log = new LogEntity();
    log.loan_id = loanId;
    log.user_id = userId;
    log.module = message;
    await this.logRepository.save(log);
  }
}
