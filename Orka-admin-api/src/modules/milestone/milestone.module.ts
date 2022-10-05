import { Module } from '@nestjs/common';
import { MilestoneService } from './milestone.service';
import { MilestoneController } from './milestone.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FilesRepository } from 'src/repository/files.repository'; 
import { LoanRepository } from 'src/repository/loan.repository';
import { UserRepository } from 'src/repository/users.repository';
import { LogRepository } from 'src/repository/log.repository';
import { Milestone } from 'src/repository/milestone.repository';
import { LogsService } from 'src/common/logs/logs.service';
import { MailService } from 'src/mail/mail.service';
import { ProductLogRepository } from 'src/repository/productLog.repository';


@Module({
  controllers: [MilestoneController],
  providers: [MilestoneService,LogsService,MailService],
  imports:[TypeOrmModule.forFeature([Milestone,LoanRepository,LogRepository,ProductLogRepository]),
  ],


})
export class MilestoneModule {}
