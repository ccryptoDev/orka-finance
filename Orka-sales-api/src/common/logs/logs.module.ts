import { Module } from '@nestjs/common';
import { LogsService } from './logs.service';
import { LogRepository } from 'src/repository/log.repository';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([LogRepository])],
  providers: [LogsService],
  exports: [LogsService],
})
export class LogsModule {}
