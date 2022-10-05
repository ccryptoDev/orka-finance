import { Test, TestingModule } from '@nestjs/testing';
import { BuildingInformationService } from './building-information.service';

describe('BuildingInformationService', () => {
  let service: BuildingInformationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BuildingInformationService],
    }).compile();

    service = module.get<BuildingInformationService>(
      BuildingInformationService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
