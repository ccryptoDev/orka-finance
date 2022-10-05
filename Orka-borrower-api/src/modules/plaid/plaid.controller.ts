import { Body, Controller, HttpCode, HttpStatus, Post,Get,ParseUUIDPipe,Param, UseGuards, Put, SetMetadata } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { PlaidService } from './plaid.service';
import { TokenDto } from './dto/token.dto';
import { config } from 'dotenv';
import { Configuration, PlaidApi, PlaidEnvironments,ItemPublicTokenExchangeRequest } from 'plaid';
config();


@ApiTags('Plaid')
@Controller('plaid')
export class PlaidController {
  constructor(private readonly plaidService: PlaidService) {}

  @Post('/savetoken/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Save Token" })
  async savetoken(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() tokenDto: TokenDto,
  ){
    const configuration = new Configuration({
      basePath: PlaidEnvironments.sandbox,
      baseOptions: {
        headers: {
          'PLAID-CLIENT-ID': process.env.PLAID_CLIENTID,
          'PLAID-SECRET': process.env.PLAIND_SECRETKEY,
        },
      },
    });

    let token:ItemPublicTokenExchangeRequest = {"public_token":tokenDto.public_token}
    try {
      const client = new PlaidApi(configuration);
      const response = await client.itemPublicTokenExchange( token )
      const access_token = response.data.access_token;
      return this.plaidService.savetoken(id,access_token)
      // const accounts_response = await client.accountsGet({ access_token });
      // console.log(accounts_response.data.accounts)
    } catch (error) {
      console.log(error)
      return {"statusCode": 400,"message": error.response.data.error_message}
    }
    //return this.PlaidService.signIn(signinCreadentialsDto);
  }
}
