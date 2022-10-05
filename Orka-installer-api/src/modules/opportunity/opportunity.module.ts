import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ProductEntity } from '../../entities/products.entity';
import { CustomerRepository } from '../../repository/customer.repository';
import { LoanRepository } from '../../repository/loan.repository';
import { Milestone } from '../../repository/milestone.repository';
import { LogRepository } from '../../repository/log.repository';
import { OpportunityController } from './opportunity.controller'
import { OpportunityService } from './opportunity.service';;
import { LogsService } from '../logs/logs.service';
import { MailService } from '../mail/mail.service';


@Module({
  imports: [
    TypeOrmModule.forFeature([
      ProductEntity,
      CustomerRepository,
      LoanRepository,
      Milestone,
      LogRepository
    ])
  ],
  controllers: [OpportunityController],
  providers: [OpportunityService, LogsService, MailService]
})
export class OpportunityModule {}
