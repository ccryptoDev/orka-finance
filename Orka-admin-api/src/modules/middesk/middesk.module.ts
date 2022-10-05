import { Module } from '@nestjs/common';
import { MiddeskService } from './middesk.service';
import { MiddeskController } from './middesk.controller';
import { HttpModule, HttpService } from '@nestjs/axios';

@Module({
  controllers: [MiddeskController],
  providers: [MiddeskService],
  imports: [HttpModule],
  exports: [MiddeskService]
})
export class MiddeskModule { }
