import { Test, TestingModule } from '@nestjs/testing';
import { CertificateOfGoodStandingController } from './certificate-of-good-standing.controller';
import { CertificateOfGoodStandingService } from './certificate-of-good-standing.service';

describe('CertificateOfGoodStandingController', () => {
  let controller: CertificateOfGoodStandingController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CertificateOfGoodStandingController],
      providers: [CertificateOfGoodStandingService],
    }).compile();

    controller = module.get<CertificateOfGoodStandingController>(
      CertificateOfGoodStandingController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
