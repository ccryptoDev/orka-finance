import { Module } from '@nestjs/common';
import { PaymentMethodController } from './payment-method.controller';
import { PaymentMethodService } from './payment-method.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserDebitCardRepository } from 'src/repository/userDebitCard.repository';
import { UserBankAccountRepository } from 'src/repository/userBankAccounts.repository';
import { CustomerRepository } from 'src/repository/customer.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserDebitCardRepository]),
    TypeOrmModule.forFeature([UserBankAccountRepository]),
    TypeOrmModule.forFeature([CustomerRepository])
  ],
  controllers: [PaymentMethodController],
  providers: [PaymentMethodService]
})
export class PaymentMethodModule {}
