import {
  Body,
  Controller,
  Param,
  ParseUUIDPipe,
  Patch,
  SetMetadata,
  UseGuards
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { RolesGuard } from '../../guards/roles.guard';
import { LoanService } from './loan.service';
import { Loan } from '../../entities/loan.entity';

export const Roles = (...roles: string[]) => SetMetadata('role', roles);

@Roles('customer')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@ApiBearerAuth()
@ApiTags('Loan')
@Controller('loans')
export class LoanController {
  constructor(
    private readonly loanService: LoanService
  ) {}

  @Patch(':id')
  @ApiOperation({ summary: 'Update loan' })
  public async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() payload: Pick<Loan, "selectedBankAccountId">
  ): Promise<Loan> {
    const loan = await this.loanService.update(id, payload);

    return loan;
  }
}
