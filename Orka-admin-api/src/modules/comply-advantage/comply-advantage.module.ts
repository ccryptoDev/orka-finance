import { Module } from '@nestjs/common';
import { ComplyAdvantageService } from './comply-advantage.service';
import { ComplyAdvantageController } from './comply-advantage.controller';
import { HttpModule } from '@nestjs/axios';
import { ComplyAdvantageReportRepository } from 'src/repository/complyAdvantage.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomerEntity } from '../../entities/customer.entity';

@Module({
  controllers: [ComplyAdvantageController],
  providers: [ComplyAdvantageService],
  imports: [TypeOrmModule.forFeature([ComplyAdvantageReportRepository, CustomerEntity]), HttpModule],
  exports: [ComplyAdvantageService]
})
export class ComplyAdvantageModule { }
