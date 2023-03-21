import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { StartService } from './start.service';
import { StartController } from './start.controller';
import { CustomerRepository } from '../../repository/customer.repository';
import { UserRepository } from '../../repository/users.repository';
import { MailService } from '../../mail/mail.service';
import { LoanRepository } from '../../repository/loan.repository';
import { LogRepository } from '../../repository/log.repository';
import { LogsService } from '../../common/logs/logs.service';
import { Installer } from '../../entities/installer.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CustomerRepository,
      UserRepository,
      LoanRepository,
      LogRepository,
      Installer
    ]),
  ],
  controllers: [StartController],
  providers: [StartService, MailService, LogsService],
  exports: [StartService],
})
export class StartModule {}
