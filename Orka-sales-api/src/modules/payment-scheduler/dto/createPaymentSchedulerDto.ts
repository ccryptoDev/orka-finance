import { IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentScheduler } from './PaymentScheduler.dto';

export class CreatePaymentSchedulerDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PaymentScheduler)
  paymentScheduler: PaymentScheduler[];
}
