import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';

import { MiddeskController } from './middesk.controller';
import { MiddeskService } from './middesk.service';
import { MiddeskReport } from '../../entities/middesk.entity';
import { CustomerEntity } from '../../entities/customer.entity';
import { CommonModule } from '../../common/common.module';

@Module({
  controllers: [MiddeskController],
  exports: [MiddeskService],
  imports: [
    TypeOrmModule.forFeature([MiddeskReport, CustomerEntity]),
    HttpModule,
    CommonModule
  ],
  providers: [MiddeskService]
})
export class MiddeskModule {}
