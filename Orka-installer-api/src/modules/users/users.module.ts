import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserRepository } from 'src/repository/users.repository';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { jwtConfig } from '../../configs/configs.constants';
import { JwtStrategy } from '../../strategies/jwt.strategy';
import {RolesGuard} from '../../guards/roles.guard';
import { LogRepository } from 'src/repository/log.repository';
import { TokenRepository } from 'src/repository/token.repository';
import { MailService } from 'src/modules/mail/mail.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserRepository, LogRepository, TokenRepository]),
    PassportModule,
    JwtModule.register({
      secret: jwtConfig.secret,
      signOptions: {
        expiresIn: jwtConfig.expiresIn,
      },
    }),
  ],
  controllers: [UsersController],
  providers: [UsersService, JwtStrategy,RolesGuard, MailService]
})
export class UsersModule {}
