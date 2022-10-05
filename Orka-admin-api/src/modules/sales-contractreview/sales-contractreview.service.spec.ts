import { Test, TestingModule } from '@nestjs/testing';
import { SalesContractreviewService } from './sales-contractreview.service';

describe('SalesContractreviewService', () => {
  let service: SalesContractreviewService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SalesContractreviewService],
    }).compile();

    service = module.get<SalesContractreviewService>(SalesContractreviewService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
