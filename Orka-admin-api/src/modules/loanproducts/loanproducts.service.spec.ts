import { Test, TestingModule } from '@nestjs/testing';
import { LoanproductsService } from './loanproducts.service';

describe('LoanproductsService', () => {
  let service: LoanproductsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LoanproductsService],
    }).compile();

    service = module.get<LoanproductsService>(LoanproductsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
