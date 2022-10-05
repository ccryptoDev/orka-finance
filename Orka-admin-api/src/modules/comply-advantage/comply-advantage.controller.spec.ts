import { Test, TestingModule } from '@nestjs/testing';
import { ComplyAdvantageController } from './comply-advantage.controller';
import { ComplyAdvantageService } from './comply-advantage.service';

describe('ComplyAdvantageController', () => {
  let controller: ComplyAdvantageController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ComplyAdvantageController],
      providers: [ComplyAdvantageService],
    }).compile();

    controller = module.get<ComplyAdvantageController>(ComplyAdvantageController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
