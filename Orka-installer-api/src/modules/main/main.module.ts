import { LoanRepository } from 'src/repository/loan.repository';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomerRepository } from 'src/repository/customer.repository';
import { MainController } from './main.controller';
import { MainService } from './main.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([CustomerRepository,LoanRepository])
  ],
  controllers: [MainController],
  providers: [MainService]
})
export class MainModule {}
