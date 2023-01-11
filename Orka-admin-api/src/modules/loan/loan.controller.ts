import {
  Controller,
  ParseUUIDPipe,
  Param,
  Post
} from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';

import { LoanService } from './loan.service';

@Controller('loan')
export class LoanController {
  constructor(private readonly loanService: LoanService) {}

  @Post(':id/decision')
  @ApiOperation({ summary: 'Get the reports and generate the automated decision results' })
  public async getDecisions(@Param('id', ParseUUIDPipe) id: string) {
    return this.loanService.getDecisions(id);
  }
}
