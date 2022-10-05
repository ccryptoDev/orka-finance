import { Controller,Get, HttpStatus, HttpCode,UseGuards } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RolesGuard } from '../../guards/roles.guard';
import { SetMetadata } from '@nestjs/common';
export const Roles = (...roles: string[]) => SetMetadata('role', roles);
@ApiTags('Notification')
@ApiBearerAuth()
@Roles('admin')
@UseGuards(AuthGuard('jwt'),RolesGuard)


@Controller('notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get('/gettop')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "GET_TOP" })
  async gettop() {
    return this.notificationService.gettop();
  }

  @Get('/getall')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "GET_ALL" })
  async getall(
   
  ){
    return this.notificationService.getall();
  }

  @Get('/viewed')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Viewed" })
  async viewed(
    
  ){
    return this.notificationService.viewed();
  }
}
