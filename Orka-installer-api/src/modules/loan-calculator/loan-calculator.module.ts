import { Module } from '@nestjs/common';
import { LoanCalculatorService } from './loan-calculator.service';
import { LoanCalculatorController } from './loan-calculator.controller';

@Module({
  controllers: [LoanCalculatorController],
  providers: [LoanCalculatorService]
})
export class LoanCalculatorModule {}
