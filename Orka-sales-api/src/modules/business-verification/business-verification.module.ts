import { LogsService } from 'src/common/logs/logs.service';
import { Module } from '@nestjs/common';
import { BusinessVerificationService } from './business-verification.service';
import { BusinessVerificationController } from './business-verification.controller';
import { CustomerRepository } from '../../repository/customer.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoanRepository } from '../../repository/loan.repository';
import { LogRepository } from '../../repository/log.repository';
import { FilesRepository } from '../../repository/files.repository';
import { UserRepository } from 'src/repository/users.repository';
@Module({
  imports: [
    TypeOrmModule.forFeature([
      FilesRepository,
      LoanRepository,
      LogRepository,
      CustomerRepository,
      UserRepository,
    ]),
  ],
  controllers: [BusinessVerificationController],
  providers: [BusinessVerificationService, LogsService],
  exports: [BusinessVerificationService],
})
export class BusinessVerificationModule {}
