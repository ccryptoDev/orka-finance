import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Creditreport } from '../../entities/creditReport.entity';
import { CustomerEntity } from '../../entities/customer.entity';
import { CommonModule } from '../../common/common.module';
import { EquifaxModule } from '../equifax/equifax.module';
import { CreditReportService } from './credit-report.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Creditreport, CustomerEntity]),
    CommonModule,
    EquifaxModule
  ],
  exports: [CreditReportService],
  providers: [CreditReportService]
})
export class CreditReportModule {}
