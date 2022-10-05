import { Test, TestingModule } from '@nestjs/testing';
import { FundedContractsController } from './funded-contracts.controller';

describe('FundedContractsController', () => {
  let controller: FundedContractsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FundedContractsController],
    }).compile();

    controller = module.get<FundedContractsController>(FundedContractsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
