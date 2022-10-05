import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { LoanService } from './loan.service';

@ApiTags('LOAN')
@Controller('loan')
export class LoanController {
  constructor(private readonly loanService: LoanService) {}

  @Get('/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get loan details' })
  async getLoanDetails(@Param('id', ParseUUIDPipe) id: string) {
    return this.loanService.getLoanDetails(id);
  }

  @Get('/status/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get loan status' })
  async getLoanStatus(@Param('id', ParseUUIDPipe) id: string) {
    return this.loanService.getLoanStatus(id);
  }
}
