import { Test, TestingModule } from '@nestjs/testing';
import { PlaidOptoutController } from './plaid-optout.controller';
import { PlaidOptoutService } from './plaid-optout.service';

describe('PlaidOptoutController', () => {
  let controller: PlaidOptoutController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PlaidOptoutController],
      providers: [PlaidOptoutService],
    }).compile();

    controller = module.get<PlaidOptoutController>(PlaidOptoutController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
