import { Module } from '@nestjs/common';
import { RolesService } from './roles.service';
import { RolesController } from './roles.controller';


import { PortalRepository } from '../../repository/portal.repository';
import { PagesRepository } from '../../repository/pages.repository';
import { PagetabsRepository } from '../../repository/pagetabs.repository';
import { RolesRepository } from '../../repository/roles.repository';
import { RolesmasterRepository } from '../../repository/rolesmaster.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
@Module({
  imports: [TypeOrmModule.forFeature([PortalRepository, PagesRepository,PagetabsRepository,RolesRepository,RolesmasterRepository])],
  controllers: [RolesController],
  exports:[
    RolesService
  ],
  providers: [RolesService]
})
export class RolesModule {}
