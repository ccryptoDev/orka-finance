import { Module } from '@nestjs/common';
import { BusinessPrincipleIdentityService } from './business-principle-identity.service';
import { BusinessPrincipleIdentityController } from './business-principle-identity.controller';
import { CustomerRepository } from '../../repository/customer.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LogRepository } from 'src/repository/log.repository';
import { LogsService } from 'src/common/logs/logs.service';
import { LoanRepository } from 'src/repository/loan.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CustomerRepository,
      LogRepository,
      LoanRepository,
    ]),
  ],
  controllers: [BusinessPrincipleIdentityController],
  providers: [BusinessPrincipleIdentityService, LogsService],
  exports: [BusinessPrincipleIdentityService],
})
export class BusinessPrincipleIdentityModule {}
