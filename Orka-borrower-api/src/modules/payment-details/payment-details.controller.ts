import { Controller, Get, HttpCode, HttpStatus, ParseUUIDPipe, Param,UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PaymentDetailsService } from './payment-details.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../../guards/roles.guard';
import { SetMetadata } from '@nestjs/common';

export const Roles = (...roles: string[]) => SetMetadata('role', roles);
@ApiBearerAuth()
@Roles('customer')
@UseGuards(AuthGuard('jwt'),RolesGuard)
@ApiTags('Payment-details')
@Controller('payment-details')
export class PaymentDetailsController {
    constructor(private readonly paymentDetailsService: PaymentDetailsService){}

    @Get('/:id')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: "Get payment details" })
    async getOverview(
      @Param('id', ParseUUIDPipe) id: string
    ){
        return this.paymentDetailsService.getPaymentDetails(id);
    }
}
