import { Test, TestingModule } from '@nestjs/testing';
import { CounterSignatureService } from './counter-signature.service';

describe('CounterSignatureService', () => {
  let service: CounterSignatureService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CounterSignatureService],
    }).compile();

    service = module.get<CounterSignatureService>(CounterSignatureService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
