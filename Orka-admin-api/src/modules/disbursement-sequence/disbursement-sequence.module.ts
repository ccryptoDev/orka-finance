import { Module } from '@nestjs/common';
import { DisbursementSequenceService } from './disbursement-sequence.service';
import { DisbursementSequenceController } from './disbursement-sequence.controller';
import { ProductRepository } from 'src/repository/products.repository';
import { PartnerProductRepository } from 'src/repository/partnerProduct.repository'; 
import { TypeOrmModule } from '@nestjs/typeorm';
import { LogRepository} from '../../repository/log.repository';
import { DisbursementSequence} from '../../repository/disbursementSequence.repository';
import { InstallerRepository } from 'src/repository/installer.repository';
import { LogsService } from 'src/common/logs/logs.service';
import { ProductLogRepository } from 'src/repository/productLog.repository';

@Module({
  controllers: [DisbursementSequenceController],
  providers: [DisbursementSequenceService,LogsService],
  imports:[TypeOrmModule.forFeature([ProductLogRepository,LogRepository,ProductRepository,PartnerProductRepository,InstallerRepository,DisbursementSequence]),
  ],
  exports:[DisbursementSequenceService]
})
export class DisbursementSequenceModule {}
