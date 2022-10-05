import { Controller, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { BorrowerHomeService } from './borrower-home.service';

@ApiTags('Borrower Information')
@Controller('borrower-home')
export class BorrowerHomeController {
  constructor(private readonly borrowerHomeService: BorrowerHomeService) {}

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({summary:"Get all the details of a selected Loan ID"})
  async getDetails(@Param('id',ParseUUIDPipe) id:string) {
    return this.borrowerHomeService.getBorrowerDetails(id)
  }
}
