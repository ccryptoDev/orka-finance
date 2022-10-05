import { PaymentManagement } from 'src/entities/paymentManagement.entity';
import { EntityRepository, Repository } from 'typeorm';


@EntityRepository(PaymentManagement)
export class PaymentManagementRepository extends Repository<PaymentManagement> {
 
}