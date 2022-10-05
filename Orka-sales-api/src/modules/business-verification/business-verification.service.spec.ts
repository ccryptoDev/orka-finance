import { Test, TestingModule } from '@nestjs/testing';
import { BusinessVerificationService } from './business-verification.service';

describe('BusinessVerificationService', () => {
  let service: BusinessVerificationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BusinessVerificationService],
    }).compile();

    service = module.get<BusinessVerificationService>(
      BusinessVerificationService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
