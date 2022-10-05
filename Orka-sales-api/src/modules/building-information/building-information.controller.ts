import {
  Controller,
  Post,
  HttpCode,
  HttpStatus,
  Body,
  Get,
  Param,
} from '@nestjs/common';
import { BuildingInformationService } from './building-information.service';
import { BuildingInformationFormDto } from './dto/building-information-form.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { RealIP } from 'nestjs-real-ip';

@ApiTags('Building Information')
@Controller('building-information')
export class BuildingInformationController {
  constructor(
    private readonly buildingInformationService: BuildingInformationService,
  ) {}
  @Get('/:id')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Get details for building Information' })
  async getBuildingInfo(@Param('id') cusId: string) {
    return this.buildingInformationService.getBuildingInfo(cusId);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Posting the building Information' })
  async buildingInfo(
    @Body() buildingInformationFormDto: BuildingInformationFormDto,
    @RealIP() ip: string,
  ) {
    return this.buildingInformationService.buildingInfo(
      buildingInformationFormDto,
      ip,
    );
  }
}
