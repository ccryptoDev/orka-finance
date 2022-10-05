import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FilesRepository } from 'src/repository/files.repository';
import { InstallerRepository } from 'src/repository/installer.repository';
import { UserRepository } from 'src/repository/users.repository';
import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';

@Module({
  imports: [TypeOrmModule.forFeature([FilesRepository, InstallerRepository, UserRepository])],
  controllers: [ProfileController],
  providers: [ProfileService]
})
export class ProfileModule {}
