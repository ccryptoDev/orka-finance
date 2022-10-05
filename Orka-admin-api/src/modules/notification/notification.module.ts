import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';

import { NotificationRepository } from '../../repository/notification.repository';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  controllers: [NotificationController],
  imports: [TypeOrmModule.forFeature([NotificationRepository])],
  exports:[NotificationService],
  providers: [NotificationService]
})
export class NotificationModule {}
