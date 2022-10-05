import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { UserRepository } from '../../repository/users.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { jwtConfig } from '../../configs/configs.constants';
import { JwtStrategy } from '../../strategies/jwt.strategy';

import {RolesGuard} from '../../guards/roles.guard';
import { MailModule } from '../../mail/mail.module';
import { MailService } from '../../mail/mail.service';
import { TokenRepository } from 'src/repository/token.repository';
import { RolesService } from '../roles/roles.service';
import { PortalRepository } from 'src/repository/portal.repository';
import { PagesRepository } from 'src/repository/pages.repository';
import { PagetabsRepository } from 'src/repository/pagetabs.repository';
import { RolesRepository } from 'src/repository/roles.repository';
import { RolesmasterRepository } from 'src/repository/rolesmaster.repository';


@Module({
  controllers: [UsersController],
  imports: [
    TypeOrmModule.forFeature([
      UserRepository, 
      TokenRepository,
      PortalRepository, 
      PagesRepository,
      PagetabsRepository,
      RolesRepository,
      RolesmasterRepository
    ]),
    PassportModule,
    MailModule,
    JwtModule.register({
      secret: jwtConfig.secret,
      signOptions: {
        expiresIn: jwtConfig.expiresIn,
      },
    }),
  ],
  exports: [UsersService],
  providers: [UsersService, JwtStrategy,RolesGuard,MailService, RolesService]
})
export class UsersModule {}
