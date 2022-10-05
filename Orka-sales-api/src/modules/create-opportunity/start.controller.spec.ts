import { Test, TestingModule } from '@nestjs/testing';
import { StartController } from './start.controller';
import { StartService } from './start.service';

describe('StartController', () => {
  let controller: StartController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StartController],
      providers: [StartService],
    }).compile();

    controller = module.get<StartController>(StartController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
