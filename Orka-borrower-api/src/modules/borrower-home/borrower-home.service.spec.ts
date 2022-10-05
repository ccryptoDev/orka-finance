import { Test, TestingModule } from '@nestjs/testing';
import { BorrowerHomeService } from './borrower-home.service';

describe('BorrowerHomeService', () => {
  let service: BorrowerHomeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BorrowerHomeService],
    }).compile();

    service = module.get<BorrowerHomeService>(BorrowerHomeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
