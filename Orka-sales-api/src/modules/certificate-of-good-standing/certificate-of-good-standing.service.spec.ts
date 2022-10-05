import { Test, TestingModule } from '@nestjs/testing';
import { CertificateOfGoodStandingService } from './certificate-of-good-standing.service';

describe('CertificateOfGoodStandingService', () => {
  let service: CertificateOfGoodStandingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CertificateOfGoodStandingService],
    }).compile();

    service = module.get<CertificateOfGoodStandingService>(
      CertificateOfGoodStandingService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
