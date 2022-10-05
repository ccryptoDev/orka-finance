import {  Controller, HttpCode, HttpStatus, Get,ParseUUIDPipe,Param, UseGuards, Put, Body, Post,SetMetadata } from '@nestjs/common';

import { PlaidService } from './plaid.service';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RolesGuard } from '../../guards/roles.guard';
import {TokenDto} from './dto/token-plaid.dto'

import {
  Configuration,
  PlaidApi,
  PlaidEnvironments,
  ItemPublicTokenExchangeRequest,
} from 'plaid';

export const Roles = (...roles: string[]) => SetMetadata('role', roles);



@ApiTags('Plaid')
// @ApiBearerAuth()
// @Roles('admin')
// @UseGuards(AuthGuard('jwt'),RolesGuard)

@Controller('plaid')//commit changes
export class PlaidController {

  constructor(private readonly plaidService: PlaidService) {}
  @Get('/linktoken/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({summary:'Obtain the Link token - For Credit App'})
  async linktoken( @Param('id', ParseUUIDPipe) id: string){
    return await this.plaidService.linkToken(id);
  }



  @Post('/savetoken/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Save Token and Get all the transactions' })
  async savetoken(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() tokenDto: TokenDto,
  ) {
    try {
      return this.plaidService.savetoken(id, tokenDto.public_token);
    } catch (error) {
        console.log(error);
        return { statusCode: 400, message: error.response.data.error_message };
    }
  }

  @Get('/accountsRepull/:id/:plaidTokenMasterId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Request repull Accounts" })
  async repullAccounts(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('plaidTokenMasterId', ParseUUIDPipe) plaidTokenMasterId: string,
  ){
    return this.plaidService.repullAccounts(id, plaidTokenMasterId)
  }

  @Get('/accounts/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Get Accounts - Display in Admin" })
  async accounts(
    @Param('id', ParseUUIDPipe) id: string,
  ){
    return this.plaidService.accounts(id)
  }

    @Get('/get-assets/:id')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: "Get Created Assets and Save in DB with calculations. Triggered at Final submit in Credit App" })
    async getAssets(
      @Param('id', ParseUUIDPipe) id: string,
    ){
        return this.plaidService.getAssets(id)
      }

    @Get('/get-assets-display/:id')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: "Get Historical Balance Calculations and Display in Admin Portal" })
    async getAssetsDisplay(
      @Param('id', ParseUUIDPipe) id: string,
    ){
        return this.plaidService.getAssetsDisplay(id)
      }

      @Get('/get-auth/:id')
      @HttpCode(HttpStatus.OK)
      @ApiOperation({ summary: "Get Historical Balance Calculations and Display in Admin Portal" })
      async getAuth(
        @Param('id', ParseUUIDPipe) id: string,
      ){
          return this.plaidService.getAuth(id)
        }

      @Get('/requestBank/:id')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: "Get Connect Bank link generated" })
    async requestBank(
      @Param('id', ParseUUIDPipe) id: string,
    ){
        return this.plaidService.request_bank_login(id)
      }
}




