import { Controller, Get, HttpStatus, HttpCode,UseGuards,ParseUUIDPipe,Param,Post,Body, Put } from '@nestjs/common';
import { LoanproductsService } from './loanproducts.service';
import { RolesGuard } from '../../guards/roles.guard';
import { SetMetadata } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import {ActiveInactiveDto} from './dto/activeInactive.dto'
import { ProductActiveInactiveDto } from './dto/productactiveinactive.dto'
import { AddLoanProductsDto } from './dto/add.dto';
import { EditLoanProductsDto } from './dto/edit.dto';

export const Roles = (...roles: string[]) => SetMetadata('role', roles);

@ApiTags('Loan Products')
@ApiBearerAuth()
@Roles('admin')
@UseGuards(AuthGuard('jwt'),RolesGuard)

@Controller('loanproducts')
export class LoanproductsController {
  constructor(private readonly loanproductsService: LoanproductsService) {}

  @Post('')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Enable/Disable a loan product for a partner" })
  async activateDeactivate(
    @Body() activeInactiveDto:ActiveInactiveDto
  )
  {
    return this.loanproductsService.activateDeactivate(activeInactiveDto)
  }

  @Post('products')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Enable/Disable a loan product" })
  async productactivateDeactivate(
    @Body() productActiveInactiveDto:ProductActiveInactiveDto
  )
  {
    return this.loanproductsService.productactivateDeactivate(productActiveInactiveDto)
  }

  @Get('')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "GET_ALL" })
  async get() {
    return this.loanproductsService.get();
  }

  @Get('product/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Get the particular loan products and details" })
  async getProducts(
    @Param('id') productId:string
  ){
    return this.loanproductsService.getProductsIdlist(productId)
  }


  @Get('/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Get all the loan products and details of active products for a particular partner" })
  async getProoducts(
    @Param('id') installerId:string
  ){
    return this.loanproductsService.getProducts(installerId)
  }

  @Get('/logs/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Get all the loan products related logs" })
  async getLogs(@Param('id') installerId:string){
    return this.loanproductsService.getLogs(installerId)
  }

  @Post('add')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Add Loan Product" })
  async add(@Body() addLoanProductsDto: AddLoanProductsDto){
    return this.loanproductsService.add(addLoanProductsDto);
  }

  @Put('edit')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Edit Loan Product Details" })
  async putEditDetails(@Body() editLoanProductsDto: EditLoanProductsDto) {
    return this.loanproductsService.putEditDetails(editLoanProductsDto);
  }
}
