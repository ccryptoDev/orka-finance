import { EntityRepository, Repository } from 'typeorm';
import { PaymentSchedule } from '../entities/paymentSchedule.entity';

@EntityRepository(PaymentSchedule)
export class PaymentScheduleRepository extends Repository<PaymentSchedule> {
 
}