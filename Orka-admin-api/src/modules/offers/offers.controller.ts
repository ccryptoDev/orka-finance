import { Controller,Get, HttpStatus, HttpCode,UseGuards,ParseUUIDPipe,Param,Post,Body } from '@nestjs/common';
import { OffersService } from './offers.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Offers')
@Controller('offers')
export class OffersController {
    constructor(private readonly offersService: OffersService) {}
  
    @Get('')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: "GET ALL OFFERS" })
    async get() {
        return this.offersService.get();
    }
}
