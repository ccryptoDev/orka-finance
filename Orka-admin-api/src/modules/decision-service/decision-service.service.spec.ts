import { Test, TestingModule } from '@nestjs/testing';
import { DecisionServiceService } from './decision-service.service';

describe('DecisionServiceService', () => {
  let service: DecisionServiceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DecisionServiceService],
    }).compile();

    service = module.get<DecisionServiceService>(DecisionServiceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
