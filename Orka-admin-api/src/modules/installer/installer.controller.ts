import { Controller, Get, HttpStatus, HttpCode,UseGuards,ParseUUIDPipe,Param,Post,Body, Put } from '@nestjs/common';
import { InstallerService } from './installer.service';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RolesGuard } from '../../guards/roles.guard';
import { SetMetadata } from '@nestjs/common';
import {EditProfileDto} from './dto/add.dto';
import { EditInstallerProfileDto } from './dto/edit.dto';
import {AddExistingDto} from './dto/add-existing.dto'

export const Roles = (...roles: string[]) => SetMetadata('role', roles);
 

@ApiTags('Installer')
@ApiBearerAuth()
@Roles('admin')
@UseGuards(AuthGuard('jwt'),RolesGuard)

@Controller('installer')
export class InstallerController {
  constructor(private readonly installerService: InstallerService) {}

  @Get('')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "GET_ALL" })
  async findAll() {
    return this.installerService.get();
  }

  @Get('loan')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "GET_ALL" })
  async getDetails() {
    return this.installerService.getLoanDetails();
  }


  @Get('/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Get Edit Details" })
  async getEditDetails(@Param('id') id: string) {
    return this.installerService.getEditDetails(id);
  }

  @Put('edit')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Edit Details" })
  async putEditDetails(@Body() editInstallerProfileDto: EditInstallerProfileDto) {
    return this.installerService.putEditDetails(editInstallerProfileDto);
  }

  @Post('add')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Add Installer" })
  async add(@Body() editProfileDto: EditProfileDto){
    return this.installerService.add(editProfileDto);
  }

  @Post('add-existing')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Add User for Existing Partner" })
  async addExisting(@Body() addExistingDto:AddExistingDto){
    return this.installerService.addExisting(addExistingDto);
  }

  @Get('specific-installer-users/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Get all Users of a specific installers" })
  async getSpecific(@Param('id') id:string){
    return this.installerService.getSpecific(id);
  }

}
