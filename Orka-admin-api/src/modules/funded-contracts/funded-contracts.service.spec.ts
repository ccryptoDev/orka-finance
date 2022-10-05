import { Test, TestingModule } from '@nestjs/testing';
import { FundedContractsService } from './funded-contracts.service';

describe('FundedContractsService', () => {
  let service: FundedContractsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FundedContractsService],
    }).compile();

    service = module.get<FundedContractsService>(FundedContractsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
