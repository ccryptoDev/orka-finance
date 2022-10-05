import { Test, TestingModule } from '@nestjs/testing';
import { LoanproductsController } from './loanproducts.controller';
import { LoanproductsService } from './loanproducts.service';

describe('LoanproductsController', () => {
  let controller: LoanproductsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LoanproductsController],
      providers: [LoanproductsService],
    }).compile();

    controller = module.get<LoanproductsController>(LoanproductsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
