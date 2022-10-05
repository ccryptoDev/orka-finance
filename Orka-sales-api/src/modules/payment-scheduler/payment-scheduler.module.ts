import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentScheduleRepository } from 'src/repository/paymentSchedule.repository';
import { PaymentSchedulerController } from './payment-scheduler.controller';
import { PaymentSchedulerService } from './payment-scheduler.service';
import { UserRepository } from '../../repository/users.repository';
import { MailService } from '../../mail/mail.service';
import { LogRepository } from '../../repository/log.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PaymentScheduleRepository,
      UserRepository,
      LogRepository,
    ]),
  ],
  controllers: [PaymentSchedulerController],
  providers: [PaymentSchedulerService, MailService],
})
export class PaymentSchedulerModule {}
