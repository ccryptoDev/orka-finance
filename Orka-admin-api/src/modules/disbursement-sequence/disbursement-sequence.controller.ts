import { Controller, Get, Post, Body, Patch, Param, Delete, HttpStatus, HttpCode, Put, UseGuards } from '@nestjs/common';
import { DisbursementSequenceService } from './disbursement-sequence.service';
import { CreateDisbursementSequenceDto } from './dto/create-disbursement-sequence.dto';
import { UpdateDisbursementSequenceDto } from './dto/update-disbursement-sequence.dto';
import { ActiveDeactiveDto } from './dto/active-deactive.dto';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RolesGuard } from '../../guards/roles.guard';
import { SetMetadata } from '@nestjs/common';
export const Roles = (...roles: string[]) => SetMetadata('role', roles);


@ApiTags('Disbursement Sequence Services')
@ApiBearerAuth()
@Roles('admin')
@UseGuards(AuthGuard('jwt'),RolesGuard)


@Controller('disbursement-sequence')
export class DisbursementSequenceController {
  constructor(private readonly disbursementSequenceService: DisbursementSequenceService) {}


  @Post('setStatus')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Enable/Disable a Disbursement Sequence" })
  async productactivateDeactivate(
    @Body() ActiveDeactiveDto:ActiveDeactiveDto
  )
  {
    return this.disbursementSequenceService.disbursementactivateDeactivate(ActiveDeactiveDto)
  }


  @Get('')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "GET_ALL" })
  async get() {
    return this.disbursementSequenceService.get();
  }


  @Get('/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Get all the disbursement sequence and details of active disbursement sequence for a particular partner" })
  async getProoducts(
    @Param('id') disbursementId:string
  ){
    return this.disbursementSequenceService.getDisbursementSequence(disbursementId)
  }

  @Get('/logs/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Get all the disbursement sequence related logs" })
  async getLogs(@Param('id') installerId:string){
    return this.disbursementSequenceService.getLogs(installerId)
  }

  @Post('add')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Add Disbursement Sequence" })
  async add(@Body() CreateDisbursementSequenceDto: CreateDisbursementSequenceDto){
    return this.disbursementSequenceService.add(CreateDisbursementSequenceDto);
  }

  @Put('edit')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Edit Disbursement Sequence Details" })
  async putEditDetails(@Body() UpdateDisbursementSequenceDto: UpdateDisbursementSequenceDto) {
    return this.disbursementSequenceService.putEditDetails(UpdateDisbursementSequenceDto);
  }

  
}
