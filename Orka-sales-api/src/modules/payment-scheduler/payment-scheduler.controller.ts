import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { CreatePaymentSchedulerDto } from './dto/createPaymentSchedulerDto';
import { PaymentSchedulerService } from './payment-scheduler.service';

@Controller('payment-scheduler')
export class PaymentSchedulerController {
  constructor(
    private readonly paymentSchedulerService: PaymentSchedulerService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'create payment schedule' })
  async create(@Body() createPaymentSchedulerDto: CreatePaymentSchedulerDto) {
    return this.paymentSchedulerService.create(createPaymentSchedulerDto);
  }
}
