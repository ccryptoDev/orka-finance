import { Module } from '@nestjs/common';
import { UploadsService } from './uploads.service';
import { UploadsController } from './uploads.controller';
// import { LogsService } from 'src/common/logs/logs.service';
import { FilesRepository } from '../../repository/files.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import {LoanRepository} from '../../repository/loan.repository';
import { CustomerRepository } from '../../repository/customer.repository';
import { LogRepository } from '../../repository/log.repository';
import { UserRepository } from 'src/repository/users.repository';

@Module({
  controllers: [UploadsController],
  imports: [
    TypeOrmModule.forFeature([
      FilesRepository,
      LoanRepository,
      LogRepository,
      CustomerRepository,
      UserRepository,
    ]),
  ],
  exports: [UploadsService],
  providers: [UploadsService],
})
export class UploadsModule {}
