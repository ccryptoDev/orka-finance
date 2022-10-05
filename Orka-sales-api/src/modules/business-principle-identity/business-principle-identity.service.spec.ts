import { Test, TestingModule } from '@nestjs/testing';
import { BusinessPrincipleIdentityService } from './business-principle-identity.service';

describe('BusinessPrincipleIdentityService', () => {
  let service: BusinessPrincipleIdentityService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BusinessPrincipleIdentityService],
    }).compile();

    service = module.get<BusinessPrincipleIdentityService>(
      BusinessPrincipleIdentityService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
