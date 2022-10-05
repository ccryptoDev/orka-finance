import { Controller, Get, HttpStatus, HttpCode,UseGuards,ParseUUIDPipe,Param,Post,Body, Put } from '@nestjs/common';
import { RolesGuard } from '../../guards/roles.guard';
import { SetMetadata } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SalesContractreviewService } from './sales-contractreview.service';
import { CreateSalesContractreviewDto } from './dto/create-sales-contractreview.dto';
import { UpdateSalesContractreviewDto } from './dto/update-sales-contractreview.dto';


export const Roles = (...roles: string[]) => SetMetadata('role', roles);

@ApiTags('Sales Contract Review')
@ApiBearerAuth()
@Roles('admin')
@Controller('sales-contractreview')
@UseGuards(AuthGuard('jwt'),RolesGuard)

export class SalesContractreviewController {
  constructor(private readonly salesContractreviewService: SalesContractreviewService) {}

  @Get('/review/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Get all the Details of Sales Contract Review" })
  async getReview(@Param('id') loanid:string){
    return this.salesContractreviewService.getReview(loanid)
  }
  
  @Get('loan')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "GET_ALL" })
  async getDetails() {
    return this.salesContractreviewService.getLoanDetails();
  }

  @Get('completeloan')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "GET_ALL" })
  async getcompleteloanDetails() {
    return this.salesContractreviewService.getcompleteloanDetails();
  }

  @Put('/update/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Update Sales Contract Review Details" })
  async putEditDetails(@Body() UpdateSalesContractreviewDto: UpdateSalesContractreviewDto) {
    return this.salesContractreviewService.putEditDetails(UpdateSalesContractreviewDto);
  }

  @Post('comments/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Add Comments For Request Information" })
  async addcomments(
    @Body() createsalescontract:CreateSalesContractreviewDto
  )
  {
    return this.salesContractreviewService.addcomments(createsalescontract)
  }

  
}
