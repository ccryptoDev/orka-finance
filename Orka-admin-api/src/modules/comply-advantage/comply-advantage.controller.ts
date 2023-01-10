import { Controller, Get, Param, SetMetadata, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

import { RolesGuard } from '../../guards/roles.guard';
import { ComplyAdvantageService } from './comply-advantage.service';

@ApiTags('Middesk')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('loans/:loanId/comply-advantage')
export class ComplyAdvantageController {
  constructor(private readonly complyAdvantageService: ComplyAdvantageService) {}

  @ApiOperation({ summary: 'Find comply advantage report by loan ID' })
  @Get()
  public async findByLoanId(@Param('loanId') loanId: string): Promise<any> {
    const middesk = await this.complyAdvantageService.findByLoanId(loanId);

    return middesk;
  }
}
