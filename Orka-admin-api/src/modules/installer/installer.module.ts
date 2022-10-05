import { Module } from '@nestjs/common';
import { InstallerService } from './installer.service';
import { InstallerController } from './installer.controller';
import { UserRepository } from '../../repository/users.repository';
import { InstallerRepository } from '../../repository/installer.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MailModule } from '../../mail/mail.module';
import { MailService } from '../../mail/mail.service';

@Module({
  controllers: [InstallerController],
  imports: [TypeOrmModule.forFeature([UserRepository,InstallerRepository]),MailModule],
  exports: [InstallerService],
  providers: [InstallerService,MailService]
})
export class InstallerModule {}
