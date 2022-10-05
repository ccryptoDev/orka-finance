import { Test, TestingModule } from '@nestjs/testing';
import { BuildingInformationController } from './building-information.controller';
import { BuildingInformationService } from './building-information.service';

describe('BuildingInformationController', () => {
  let controller: BuildingInformationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BuildingInformationController],
      providers: [BuildingInformationService],
    }).compile();

    controller = module.get<BuildingInformationController>(
      BuildingInformationController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
