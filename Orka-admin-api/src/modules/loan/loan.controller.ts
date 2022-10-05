import {
  Controller,
  Get,
  HttpStatus,
  HttpCode,
  ParseUUIDPipe,
  Param,
  Post
} from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';

import { LoanService } from './loan.service';

@Controller('loan')
export class LoanController {
  constructor(private readonly loanService: LoanService) { }

  @Get('pull-equifax-credit-report/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Pull equifax credit report and save in DB" })
  async equifaxCreditReport(
    @Param('id', ParseUUIDPipe) id: string
  ) {
    return this.loanService.equifaxCreditPull(id)
  }

  @Get('equifax-set2-report/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Pull equifax credit report and save in DB" })
  async equifaxSet2Report(
    @Param('id', ParseUUIDPipe) id: string
  ) {
    return this.loanService.equifaxCreditPullSet2(id)
  }

  @Post('middesk/:loanid')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Pull middesk report and save in DB" })
  async getMiddeskId(
    @Param('loanid', ParseUUIDPipe) loanid: string
  ) {
    return this.loanService.getMiddeskId(loanid);
  }

  @Get('middeskreport/:loanid')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Get middesk report from DB" })
  async getMiddeskReport(
    @Param('loanid', ParseUUIDPipe) loanid: string
  ) {
    return this.loanService.getMiddeskReport(loanid)
  }

  @Post('complyadvantagereport/:loanid')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Pull Comply Advantage report and save in DB and show" })
  async getComplyAdvantageReport(
    @Param('loanid', ParseUUIDPipe) loanid: string
  ) {
    return this.loanService.getComplyAdvantageReport(loanid)
  }

  @Get('reportResult/:loanid')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Get DE rules result" })
  async getReports(
    @Param('loanid', ParseUUIDPipe) loanid: string
  ) {
    return this.loanService.getReportsResult(loanid)
  }
}
