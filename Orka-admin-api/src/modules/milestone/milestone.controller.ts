import { Controller,Get, HttpStatus, HttpCode,UseGuards,ParseUUIDPipe,Param, Post, Body } from '@nestjs/common';
import { MilestoneService } from './milestone.service';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RolesGuard } from '../../guards/roles.guard';
import { SetMetadata } from '@nestjs/common';
import { CreateMilestoneDto } from './dto/create-milestone.dto';
import { UpdateMilestoneDto } from './dto/update-milestone.dto';
export const Roles = (...roles: string[]) => SetMetadata('role', roles);


@ApiTags('Milestone')
@ApiBearerAuth()
@Roles('admin')
@Controller('milestone')
@UseGuards(AuthGuard('jwt'),RolesGuard)

export class MilestoneController {
  constructor(private readonly milestoneService: MilestoneService) {}

  @Get('')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "GET ALL PROJECT CONSTRUCTION STATUS" })
  async get() {
    return this.milestoneService.get();
  }

  @Get('equipment')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "GET ALL MILESTONE PENDING LIST" })
  async getstatusList() {
    return this.milestoneService.getMilestoneDetails();
  }

  @Get('complete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "GET ALL MILESTONE COMPLETE LIST" })
  async getcompletestatusList() {
    return this.milestoneService.getcompleteMilestoneDetails();
  }

  @Get('equipment/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "GET PARTICULAR MILESTONE PENDING LIST" })
  async getReview(@Param('id') loanid:string){
    return this.milestoneService.getMilestListoneDetails(loanid)
  }

  // @Post('create/:id')
  // @HttpCode(HttpStatus.OK)
  // @ApiOperation({ summary: "Add Milestone information" })
  // async addmilestone(
  //   @Body() createMilestone:CreateMilestoneDto
  // )
  // {
  //   return this.milestoneService.addmilestone(createMilestone)
  // }

  @Post('comments/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Add Comments For Request Information" })
  async addcomments(
    @Body() updateMilestone:UpdateMilestoneDto
  )
  {
    return this.milestoneService.addcomments(updateMilestone)
  }

  @Post('update/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Add Comments For Request Information" })
  async updatestatus(
    @Body() updateMilestone:UpdateMilestoneDto
  )
  {
    return this.milestoneService.updatestatus(updateMilestone)
  }


}
