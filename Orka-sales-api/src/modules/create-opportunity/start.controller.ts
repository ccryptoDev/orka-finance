import {
  Controller,
  Post,
  HttpCode,
  HttpStatus,
  Body,
  Get,
  Param,
  Put,
} from '@nestjs/common';
import { StartService } from './start.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { StartApplicationFormDto } from './dto/start-application-form.dto';
import { RealIP } from 'nestjs-real-ip';

@ApiTags('Create Opportunity/Welcome ORKA')
@Controller('create-opportunity')
export class StartController {
  constructor(private readonly startService: StartService) {}

  @Get('/all-clients')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Only for Dev/Testing purpose' })
  async getClients() {
    return this.startService.getClients();
  }

  @Get('/:id')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Get details for start  page' })
  async getClientData(@Param('id') cusId: string) {
    return this.startService.getClientData(cusId);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Creating Client Opportunity' })
  async createClientOpportunity(
    @Body() startApplicationFormDto: StartApplicationFormDto,
    @RealIP() ip: string,
  ) {
    //console.log(startApplicationFormDto);
    //return startApplicationFormDto;
    return this.startService.createOpportunity(startApplicationFormDto, ip);
  }

  @Put()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Update details of Start page on change' })
  async putClientData(
    @Body() startApplicationFormDto: StartApplicationFormDto,
    @RealIP() ip: string,
  ) {
    return this.startService.putClientData(startApplicationFormDto, ip);
  }

  @Put('/resend')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Resend Email' })
  async resendMail(@Body() startApplicationFormDto: StartApplicationFormDto) {
    return this.startService.resendMail(startApplicationFormDto);
  }
}
