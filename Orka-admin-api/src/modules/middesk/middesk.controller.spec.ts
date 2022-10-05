import { Test, TestingModule } from '@nestjs/testing';
import { MiddeskController } from './middesk.controller';
import { MiddeskService } from './middesk.service';

describe('MiddeskController', () => {
  let controller: MiddeskController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MiddeskController],
      providers: [MiddeskService],
    }).compile();

    controller = module.get<MiddeskController>(MiddeskController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
