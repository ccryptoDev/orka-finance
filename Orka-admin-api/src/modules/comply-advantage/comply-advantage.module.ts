import { Module } from '@nestjs/common';
import { ComplyAdvantageService } from './comply-advantage.service';
import { ComplyAdvantageController } from './comply-advantage.controller';
import { HttpModule } from '@nestjs/axios';
import { ComplyAdvantageReportRepository } from 'src/repository/complyAdvantage.repository';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  controllers: [ComplyAdvantageController],
  providers: [ComplyAdvantageService],
  imports: [TypeOrmModule.forFeature([ComplyAdvantageReportRepository]), HttpModule],
  exports: [ComplyAdvantageService]
})
export class ComplyAdvantageModule { }
