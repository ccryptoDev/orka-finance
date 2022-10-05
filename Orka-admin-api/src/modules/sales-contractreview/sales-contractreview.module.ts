import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SalesContractreviewService } from './sales-contractreview.service';
import { SalesContractreviewController } from './sales-contractreview.controller';
import { ProductRepository } from '../../repository/products.repository';
import { PartnerProductRepository } from '../../repository/partnerProduct.repository'; 
import { LogRepository} from '../../repository/log.repository';
import { MailService } from '../../mail/mail.service';
import { UserRepository} from '../../repository/users.repository';
import { InstallerRepository } from '../../repository/installer.repository';
import { LogsService } from '../../common/logs/logs.service';
import { ProductLogRepository } from '../../repository/productLog.repository';
import { SalesContractReview } from '../../repository/salesContractReview.repositiry';
import { LoanRepository } from '../../repository/loan.repository';
import { CustomerRepository } from '../../repository/customer.repository';

@Module({
  controllers: [SalesContractreviewController],
  providers: [SalesContractreviewService,LogsService,MailService],
  imports: [TypeOrmModule.forFeature([
    SalesContractReview,
    LoanRepository,
    UserRepository,
    ProductLogRepository,
    LogRepository,
    ProductRepository,
    PartnerProductRepository,
    InstallerRepository,
    CustomerRepository
  ])],
})
export class SalesContractreviewModule {}
