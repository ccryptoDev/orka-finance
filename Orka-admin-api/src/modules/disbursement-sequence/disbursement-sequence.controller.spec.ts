import { Test, TestingModule } from '@nestjs/testing';
import { DisbursementSequenceController } from './disbursement-sequence.controller';
import { DisbursementSequenceService } from './disbursement-sequence.service';

describe('DisbursementSequenceController', () => {
  let controller: DisbursementSequenceController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DisbursementSequenceController],
      providers: [DisbursementSequenceService],
    }).compile();

    controller = module.get<DisbursementSequenceController>(DisbursementSequenceController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
