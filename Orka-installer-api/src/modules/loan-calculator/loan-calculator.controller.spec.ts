import { Test, TestingModule } from '@nestjs/testing';
import { LoanCalculatorController } from './loan-calculator.controller';
import { LoanCalculatorService } from './loan-calculator.service';

describe('LoanCalculatorController', () => {
  let controller: LoanCalculatorController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LoanCalculatorController],
      providers: [LoanCalculatorService],
    }).compile();

    controller = module.get<LoanCalculatorController>(LoanCalculatorController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
