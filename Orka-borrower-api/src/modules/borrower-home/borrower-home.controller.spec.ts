import { Test, TestingModule } from '@nestjs/testing';
import { BorrowerHomeController } from './borrower-home.controller';
import { BorrowerHomeService } from './borrower-home.service';

describe('BorrowerHomeController', () => {
  let controller: BorrowerHomeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BorrowerHomeController],
      providers: [BorrowerHomeService],
    }).compile();

    controller = module.get<BorrowerHomeController>(BorrowerHomeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
