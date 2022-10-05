import { Body, Controller, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Post, SetMetadata, UseGuards } from '@nestjs/common';
// import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RolesGuard } from 'src/guards/roles.guard';
import { DecisionServiceService } from './decision-service.service';
import { QaLendingDto } from './dto/qa-lending.dto';
import { LoanOpsChangeStatusDto } from './dto/loanops-change-status.dto';

export const Roles = (...roles: string[]) => SetMetadata('role', roles);

@ApiTags('Decision Service')
// @ApiBearerAuth()
// @Roles('admin')
// @UseGuards(AuthGuard('jwt'),RolesGuard)

@Controller('decision-service')
export class DecisionServiceController {
  constructor(private readonly decisionServiceService: DecisionServiceService) { }

  @Post('set-lending-limit-personal-guarantor/:loanId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Set Lending Limit Personal Guarantor" })
  async personalGaurantor(@Param('loanId', ParseUUIDPipe) loanId: string,) {
    return this.decisionServiceService.setLendingLimitPersonalGuarantor(loanId)
  }

  @Post('qa-lending-limit')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Set Lending Limit Business Borrower" })
  async qaTesting(@Body() qaLendingDto: QaLendingDto) {
    return this.decisionServiceService.qaLendingLimit(qaLendingDto)
  }

  @Get('loanops/:loanId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "get lending info" })
  async getLoanInfo(@Param('loanId', ParseUUIDPipe) loanId: string,) {
    return this.decisionServiceService.getLoanInfo(loanId)
  }


  @Post('loanops/setstatus')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Loanops Status change based on the LoanID" })
  async loanopschangestatus(
    @Body() LoanOpsChangeStatusDto:LoanOpsChangeStatusDto
  )
  {
    return this.decisionServiceService.loanopschangestatus(LoanOpsChangeStatusDto)
  }

  @Post('loanops/sendRequestInfomationEmail/:loanId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Loanops Status change based on the LoanID" })
  async sendRequestInfomationEmail(
    @Param('loanId', ParseUUIDPipe) loanId: string
  )
  {
    return this.decisionServiceService.sendRequestInfomationEmail(loanId)
  }

}
