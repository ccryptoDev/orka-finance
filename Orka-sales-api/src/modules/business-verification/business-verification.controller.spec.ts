import { Test, TestingModule } from '@nestjs/testing';
import { BusinessVerificationController } from './business-verification.controller';
import { BusinessVerificationService } from './business-verification.service';

describe('BusinessVerificationController', () => {
  let controller: BusinessVerificationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BusinessVerificationController],
      providers: [BusinessVerificationService],
    }).compile();

    controller = module.get<BusinessVerificationController>(
      BusinessVerificationController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
