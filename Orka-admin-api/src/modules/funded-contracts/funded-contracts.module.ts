import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomerRepository } from 'src/repository/customer.repository';
import { FilesRepository } from 'src/repository/files.repository';
import { InstallingInfoRepository } from 'src/repository/installingInfo.repository';
import { SystemInfoRepository } from 'src/repository/systemInfo.repository';
import { FundedContractsController } from './funded-contracts.controller';
import { FundedContractsService } from './funded-contracts.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      InstallingInfoRepository, 
      FilesRepository, 
      SystemInfoRepository,
      CustomerRepository
    ])
  ],
  controllers: [FundedContractsController],
  providers: [FundedContractsService]
})
export class FundedContractsModule {}
