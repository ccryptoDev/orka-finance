import { Test, TestingModule } from '@nestjs/testing';
import { CounterSignatureController } from './counter-signature.controller';
import { CounterSignatureService } from './counter-signature.service';

describe('CounterSignatureController', () => {
  let controller: CounterSignatureController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CounterSignatureController],
      providers: [CounterSignatureService],
    }).compile();

    controller = module.get<CounterSignatureController>(CounterSignatureController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
