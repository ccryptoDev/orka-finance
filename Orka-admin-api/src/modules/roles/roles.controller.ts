import { Controller,Post,HttpCode,HttpStatus,Body,Get,Param,ParseIntPipe } from '@nestjs/common';
import { RolesService } from './roles.service';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RolesGuard } from '../../guards/roles.guard';
import { SetMetadata } from '@nestjs/common';

import {Addroles} from './dto/addrole.dto';
import {Updateroles} from './dto/updaterole.dto';
import {Addpermission} from './dto/addpermission.dto';
@ApiTags('Roles')
@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}


  @Get('shortname')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({summary:"Get all short name"})
  async get()
  {
    return this.rolesService.getShortName();
  }

  @Post('addroles')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Add Roles" })
  async addroles(
    @Body() addroles: Addroles
  ){
    return this.rolesService.addroles(addroles);
  }

  @Post('updateroles')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Update Roles" })
  async updateroles(
    @Body() updateroles: Updateroles
  ){
    return this.rolesService.updateroles(updateroles);
  }

  @Get('delete/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Delete Roles" })
  async deleteroles(
    @Param('id', ParseIntPipe) id: number
  ){
    return this.rolesService.delete(id);
  }

  @Post('addpermission')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Add Permission" })
  async addpermission(@Body() addpermission:Addpermission){
    return this.rolesService.addpermission(addpermission)
  }

  @Get('getmenulist/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Get Menulist" })
  async getmenulist(
    @Param('id', ParseIntPipe) id: number
  ){
    return this.rolesService.getmenulist(id);
  }


  @Get('getroles')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Get Roles" })
  async getroles(
    
  ){
    return this.rolesService.getroles();
  }

  @Get('checkpermission/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Check Permission" })
  async checkpermission(
    @Param('id', ParseIntPipe) id: number
  ){
    return this.rolesService.checkpermission(id);
  }

  @Get('getadminportalroles')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Get Admin Portal Roles" })
  async getAdminPortalRoles(){
    return this.rolesService.getAdminPortalRoles();
  }

}
