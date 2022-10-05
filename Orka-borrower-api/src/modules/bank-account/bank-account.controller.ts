import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  SetMetadata,
  UseGuards
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

import { RolesGuard } from '../../guards/roles.guard';
import { BankAccountService, BankAccounts } from './bank-account.service';

export const Roles = (...roles: string[]) => SetMetadata('role', roles);

@Roles('customer')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@ApiBearerAuth()
@ApiTags('Bank Account')
@Controller('loans/:id/bank-accounts')
export class BankAccountController {
  constructor(
    private readonly bankAccountService: BankAccountService
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get the plaid bank accounts and the manually inputed bank accounts for a loan' })
  public async getByLoanId(@Param('id', ParseUUIDPipe) id: string): Promise<BankAccounts> {
    const bankAccounts = await this.bankAccountService.getByLoanId(id);

    return bankAccounts;
  }
}
