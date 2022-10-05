import { LoanRepository } from 'src/repository/loan.repository';
import { Module } from '@nestjs/common';
import { StartService } from './start.service';
import { StartController } from './start.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomerRepository } from '../../repository/customer.repository';
import { UserRepository } from '../../repository/users.repository';
import { MailService } from '../../mail/mail.service';
import { LogRepository } from 'src/repository/log.repository';
import { LogsService } from 'src/common/logs/logs.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CustomerRepository,
      UserRepository,
      LoanRepository,
      LogRepository,
    ]),
  ],
  controllers: [StartController],
  providers: [StartService, MailService, LogsService],
  exports: [StartService],
})
export class StartModule {}
