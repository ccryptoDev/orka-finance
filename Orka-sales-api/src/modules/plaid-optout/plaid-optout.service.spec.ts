import { Test, TestingModule } from '@nestjs/testing';
import { PlaidOptoutService } from './plaid-optout.service';

describe('PlaidOptoutService', () => {
  let service: PlaidOptoutService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PlaidOptoutService],
    }).compile();

    service = module.get<PlaidOptoutService>(PlaidOptoutService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
