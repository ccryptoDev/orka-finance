import { Module } from '@nestjs/common';
import { PlaidOptoutService } from './plaid-optout.service';
import { PlaidOptoutController } from './plaid-optout.controller';
import { LogsService } from 'src/common/logs/logs.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoanRepository } from 'src/repository/loan.repository';
import { FilesRepository } from 'src/repository/files.repository';
import { CustomerRepository } from 'src/repository/customer.repository';
import { LogRepository } from 'src/repository/log.repository';
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
  controllers: [PlaidOptoutController],
  providers: [PlaidOptoutService, LogsService],
})
export class PlaidOptoutModule {}
