import { Test, TestingModule } from '@nestjs/testing';
import { MiddeskService } from './middesk.service';

describe('MiddeskService', () => {
  let service: MiddeskService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MiddeskService],
    }).compile();

    service = module.get<MiddeskService>(MiddeskService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
