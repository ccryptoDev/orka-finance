import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Loan } from '../../entities/loan.entity';
import { UserEntity } from '../../entities/users.entity';
import { PartnerProductEntity } from '../../entities/partnerProducts.entity';
import { ProductEntity } from '../../entities/products.entity';
import { CustomerEntity } from '../../entities/customer.entity';
import { LendingLimitEntity } from '../../entities/lendingLimit.entity';
import { DecisionServiceService } from './decision-service.service';
import { DecisionServiceController } from './decision-service.controller';
import { MailModule } from '../../mail/mail.module';
import { PlaidModule } from '../plaid/plaid.module';

@Module({
  controllers: [DecisionServiceController],
  exports: [DecisionServiceService],
  imports: [
    TypeOrmModule.forFeature([
      Loan,
      UserEntity,
      PartnerProductEntity,
      ProductEntity,
      CustomerEntity,
      LendingLimitEntity
    ]),
    MailModule,
    PlaidModule
  ],
  providers: [DecisionServiceService]
})
export class DecisionServiceModule { }
