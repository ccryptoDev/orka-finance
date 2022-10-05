import { Test, TestingModule } from '@nestjs/testing';
import { BusinessPrincipleIdentityController } from './business-principle-identity.controller';
import { BusinessPrincipleIdentityService } from './business-principle-identity.service';

describe('BusinessPrincipleIdentityController', () => {
  let controller: BusinessPrincipleIdentityController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BusinessPrincipleIdentityController],
      providers: [BusinessPrincipleIdentityService],
    }).compile();

    controller = module.get<BusinessPrincipleIdentityController>(
      BusinessPrincipleIdentityController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
