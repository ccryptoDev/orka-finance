import { Module } from '@nestjs/common';
import { QuestionsService } from './questions.service';
import { QuestionsController } from './questions.controller';
import { QuestionsRepository } from '../../repository/questions.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SettingsRepository } from 'src/entities/settings.repository';
import { LoanRepository } from 'src/repository/loan.repository';
import { UserRepository } from 'src/repository/users.repository';
import { LogRepository } from 'src/repository/log.repository';
import { LogsService } from 'src/common/logs/logs.service';
import { CustomerRepository } from 'src/repository/customer.repository';
import { MailService } from 'src/mail/mail.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      QuestionsRepository,
      SettingsRepository,
      LoanRepository,
      LogRepository,
      UserRepository,
      CustomerRepository,
    ]),
  ],
  controllers: [QuestionsController],
  exports: [QuestionsService],
  providers: [QuestionsService, LogsService, MailService],
})
export class QuestionsModule {}
