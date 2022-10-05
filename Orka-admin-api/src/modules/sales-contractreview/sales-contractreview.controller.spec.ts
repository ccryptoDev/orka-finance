import { Test, TestingModule } from '@nestjs/testing';
import { SalesContractreviewController } from './sales-contractreview.controller';
import { SalesContractreviewService } from './sales-contractreview.service';

describe('SalesContractreviewController', () => {
  let controller: SalesContractreviewController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SalesContractreviewController],
      providers: [SalesContractreviewService],
    }).compile();

    controller = module.get<SalesContractreviewController>(SalesContractreviewController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
