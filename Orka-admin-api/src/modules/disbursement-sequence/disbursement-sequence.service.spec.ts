import { Test, TestingModule } from '@nestjs/testing';
import { DisbursementSequenceService } from './disbursement-sequence.service';

describe('DisbursementSequenceService', () => {
  let service: DisbursementSequenceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DisbursementSequenceService],
    }).compile();

    service = module.get<DisbursementSequenceService>(DisbursementSequenceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
