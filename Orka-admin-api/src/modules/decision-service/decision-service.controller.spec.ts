import { Test, TestingModule } from '@nestjs/testing';
import { DecisionServiceController } from './decision-service.controller';
import { DecisionServiceService } from './decision-service.service';

describe('DecisionServiceController', () => {
  let controller: DecisionServiceController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DecisionServiceController],
      providers: [DecisionServiceService],
    }).compile();

    controller = module.get<DecisionServiceController>(DecisionServiceController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
