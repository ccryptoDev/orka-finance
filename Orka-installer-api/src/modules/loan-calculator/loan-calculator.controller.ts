import { Controller,Get,Post, HttpCode,HttpStatus,ParseUUIDPipe, Param,UseGuards, Body } from '@nestjs/common';
import { LoanCalculatorService } from './loan-calculator.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../../guards/roles.guard';
import { SetMetadata } from '@nestjs/common';

export const Roles = (...roles: string[]) => SetMetadata('role', roles);


@ApiBearerAuth()
@Roles('installer')
@UseGuards(AuthGuard('jwt'),RolesGuard)
@ApiTags('Loan Calculator')

@Controller('loan-calculator')
export class LoanCalculatorController {
  constructor(private readonly loanCalculatorService: LoanCalculatorService) {}

  @Get(':mainInstallerId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({summary:"Get the Activated loan products of a partner"})
  async getDetails(
    @Param('mainInstallerId',ParseUUIDPipe) id:string)
    {
      return this.loanCalculatorService.getLoanProducts(id)
    }
}
