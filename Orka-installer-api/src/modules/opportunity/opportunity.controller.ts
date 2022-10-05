import { OpportunityDto } from './dto/opportunity.dto';
import { Controller,Get,Post, HttpCode,HttpStatus,ParseUUIDPipe, Param,UseGuards, Body } from '@nestjs/common';
import { OpportunityService } from './opportunity.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../../guards/roles.guard';
import { SetMetadata } from '@nestjs/common';
import { CreateMilestoneDto } from './dto/createmilestone.dto';


export const Roles = (...roles: string[]) => SetMetadata('role', roles);


@ApiBearerAuth()
@Roles('installer')
@UseGuards(AuthGuard('jwt'),RolesGuard)
@ApiTags('Opportunity')
@Controller('opportunity')
export class OpportunityController {
  constructor(private readonly opportunityService: OpportunityService) {}

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({summary:"Get all the details of a selected Loan ID"})
  async getDetails(
    @Param('id',ParseUUIDPipe) id:string)
    {
      return this.opportunityService.getLoanDetails(id)
    }

  @Get('loanproducts/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({summary:"Get all the details of a selected Installer ID"})
  async getloanproductsDetails(
  @Param('id',ParseUUIDPipe) id:string)
  {
  return this.opportunityService.getLoanProductsDetails(id)
  }

  @Post(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({summary:"Save all the details of a selected Loan ID"})
  async putDetails(
    @Param('id',ParseUUIDPipe) id:string,
    @Body() opportunityDto:OpportunityDto
    ){
    return this.opportunityService.putDetails(id,opportunityDto)
  }

  @Post('salescomments/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({summary:"Sales contract comment updated selected Loan ID"})
  async putDetailscomments(
    @Param('id',ParseUUIDPipe) id:string,
    // @Body() opportunityDto:OpportunityDto
    ){
    return this.opportunityService.putDetailscomments(id)
  }

  @Post('milestone/create/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Add Milestone information" })
  async addmilestone(
    @Body() createMilestone:CreateMilestoneDto
  )
  {
    return this.opportunityService.addmilestone(createMilestone)
  }

  @Post(':id/send-financing-contract-email')
  @ApiOperation({ summary: 'Send the financing contract email to the customer' })
  async sendFinancingContractEmail(@Param('id', ParseUUIDPipe) id: string) {
    await this.opportunityService.sendFinancingContractMail(id);
  }
}
