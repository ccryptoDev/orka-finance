import { LoanRepository } from 'src/repository/loan.repository';
import { Module } from '@nestjs/common';
import { BuildingInformationService } from './building-information.service';
import { BuildingInformationController } from './building-information.controller';
import { CustomerRepository } from '../../repository/customer.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LogRepository } from 'src/repository/log.repository';
import { LogsService } from 'src/common/logs/logs.service';
import { HttpModule } from '@nestjs/axios';
import { MailService } from '../../mail/mail.service';
@Module({
  imports: [
    TypeOrmModule.forFeature([
      CustomerRepository,
      LogRepository,
      LoanRepository,
    ]),
    HttpModule,
  ],
  controllers: [BuildingInformationController],
  providers: [BuildingInformationService, LogsService, MailService],
  exports: [BuildingInformationService],
})
export class BuildingInformationModule {}
