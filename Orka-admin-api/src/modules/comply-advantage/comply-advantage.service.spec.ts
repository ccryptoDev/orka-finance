import { Test, TestingModule } from '@nestjs/testing';
import { ComplyAdvantageService } from './comply-advantage.service';

describe('ComplyAdvantageService', () => {
  let service: ComplyAdvantageService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ComplyAdvantageService],
    }).compile();

    service = module.get<ComplyAdvantageService>(ComplyAdvantageService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
