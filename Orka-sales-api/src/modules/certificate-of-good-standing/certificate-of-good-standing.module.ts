import { CustomerRepository } from 'src/repository/customer.repository';
import { Module } from '@nestjs/common';
import { CertificateOfGoodStandingService } from './certificate-of-good-standing.service';
import { CertificateOfGoodStandingController } from './certificate-of-good-standing.controller';
import { FilesRepository } from '../../repository/files.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoanRepository } from '../../repository/loan.repository';
import { LogRepository } from '../../repository/log.repository';
import { LogsService } from 'src/common/logs/logs.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      FilesRepository,
      LoanRepository,
      LogRepository,
      CustomerRepository,
    ]),
  ],
  controllers: [CertificateOfGoodStandingController],
  providers: [CertificateOfGoodStandingService, LogsService],
})
export class CertificateOfGoodStandingModule {}
