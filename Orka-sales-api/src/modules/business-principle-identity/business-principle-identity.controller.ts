import { ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  Controller,
  Post,
  HttpCode,
  HttpStatus,
  Body,
  Get,
  Param,
} from '@nestjs/common';
import { BusinessPrincipleIdentityService } from './business-principle-identity.service';
import { BusinessPrincipalIdentityFormDto } from './dto/business-principle-identity-form.dto';
import { RealIP } from 'nestjs-real-ip';

@ApiTags('Business Principal Identity')
@Controller('business-principal-identity')
export class BusinessPrincipleIdentityController {
  constructor(
    private readonly businessPrincipleIdentityService: BusinessPrincipleIdentityService,
  ) {}

  @Get('/:id')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Get details for Business Principal Identity Form' })
  async getDetails(@Param('id') cusId: string) {
    return this.businessPrincipleIdentityService.getDetails(cusId);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Post details for Business Principal Identity Form',
  })
  async identity(
    @Body() businessPrincipalIdentityFormDto: BusinessPrincipalIdentityFormDto,
    @RealIP() ip: string,
  ) {
    return this.businessPrincipleIdentityService.principalDetails(
      businessPrincipalIdentityFormDto,
      ip,
    );
  }
}
