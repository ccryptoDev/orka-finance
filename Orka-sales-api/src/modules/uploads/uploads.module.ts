import { Module } from '@nestjs/common';
import { UploadsService } from './uploads.service';
import { UploadsController } from './uploads.controller';

import { FilesRepository } from '../../repository/files.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoanRepository } from '../../repository/loan.repository';
import { LogRepository } from '../../repository/log.repository';

@Module({
  controllers: [UploadsController],
  imports: [
    TypeOrmModule.forFeature([FilesRepository, LoanRepository, LogRepository]),
  ],
  exports: [UploadsService],
  providers: [UploadsService],
})
export class UploadsModule {}
