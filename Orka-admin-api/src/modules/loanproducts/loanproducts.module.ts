import { Module } from '@nestjs/common';
import { LoanproductsService } from './loanproducts.service';
import { LoanproductsController } from './loanproducts.controller';
import { ProductRepository } from 'src/repository/products.repository';
import { PartnerProductRepository } from 'src/repository/partnerProduct.repository'; 
import { TypeOrmModule } from '@nestjs/typeorm';
import { LogRepository} from '../../repository/log.repository';
import { UserRepository} from '../../repository/users.repository';
import { InstallerRepository } from 'src/repository/installer.repository';
import { LogsService } from 'src/common/logs/logs.service';
import { ProductLogRepository } from 'src/repository/productLog.repository';

@Module({
  controllers: [LoanproductsController],
  providers: [LoanproductsService,LogsService],
  imports:[TypeOrmModule.forFeature([UserRepository,ProductLogRepository,LogRepository,ProductRepository,PartnerProductRepository,InstallerRepository]),
  ],
  exports:[LoanproductsService]
})
export class LoanproductsModule {}
