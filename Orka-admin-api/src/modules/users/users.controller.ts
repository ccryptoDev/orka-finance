import { Body, Controller, HttpCode, HttpStatus, Post,Get,UseGuards,ParseUUIDPipe,Param, Put } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { SigninCreadentialsDto }from './dto/signin-user.dto';
import { AddCreadentialsDto } from './dto/add-user.dto';
import { EditCredentialsDto } from './dto/edit-user.dto';
import { RolesGuard } from '../../guards/roles.guard';
import { SetMetadata } from '@nestjs/common';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { CheckTokenDto, PasswordResetDto } from './dto/pasword-reset.dto';
import { TestEmailTemplateDto} from './dto/test-email.dto'
export const Roles = (...roles: string[]) => SetMetadata('role', roles);

export enum AuthSummary {
  SIGN_IN_SUMMARY = 'Sign in for users.'
}

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  @Post('/signin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: AuthSummary.SIGN_IN_SUMMARY })
  async signIn(
    @Body() signinCreadentialsDto: SigninCreadentialsDto,
  ){
    return this.usersService.signIn(signinCreadentialsDto);
  }

  @ApiBearerAuth()
  @Roles('admin')
  @UseGuards(AuthGuard('jwt'),RolesGuard)
  @Put('/changepassword/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "change admin password"})
  async changePassword(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() changePasswordDto:ChangePasswordDto
  ){
    return this.usersService.changePassword(id, changePasswordDto)
  }

  @ApiBearerAuth()
  @Roles('admin')
  @UseGuards(AuthGuard('jwt'),RolesGuard)
  @Get('/list')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "list"})
  async list(){
    return this.usersService.list()
  }

  @ApiBearerAuth()
  @Roles('admin')
  @UseGuards(AuthGuard('jwt'),RolesGuard)
  @Get('/admin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "list"})
  async adminlist(){
    return this.usersService.adminlist()
  }



  @ApiBearerAuth()
  @Roles('admin')
  @UseGuards(AuthGuard('jwt'),RolesGuard)
  @Get('/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Get User details" })
  async getdetails(
    @Param('id', ParseUUIDPipe) id: string
  ){
    return this.usersService.getdetails(id);
  }

  @ApiBearerAuth()
  @Roles('admin')
  @UseGuards(AuthGuard('jwt'),RolesGuard)
  @Get('/deactive/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Deactive User" })
  async deactive(
    @Param('id', ParseUUIDPipe) id: string
  ){
    return this.usersService.deactive(id);
  }

  @ApiBearerAuth()
  @Roles('admin')
  @UseGuards(AuthGuard('jwt'),RolesGuard)
  @Get('/active/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Active User" })
  async active(
    @Param('id', ParseUUIDPipe) id: string
  ){
    return this.usersService.active(id);
  }

  @ApiBearerAuth()
  @Roles('admin')
  @UseGuards(AuthGuard('jwt'),RolesGuard)
  @Get('/delete/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Delete User" })
  async delete(
    @Param('id', ParseUUIDPipe) id: string
  ){
    return this.usersService.delete(id);
  }


  @ApiBearerAuth()
  @Roles('admin')
  @UseGuards(AuthGuard('jwt'),RolesGuard)
  @Post('/add')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: AuthSummary.SIGN_IN_SUMMARY })
  async add(
    @Body() addCreadentialsDto: AddCreadentialsDto,
  ){
    return this.usersService.add(addCreadentialsDto);
  }

  @ApiBearerAuth()
  @Roles('admin')
  @UseGuards(AuthGuard('jwt'),RolesGuard)
  @Put('/edit')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: AuthSummary.SIGN_IN_SUMMARY })
  async edit(
    @Body() editCredentialsDto: EditCredentialsDto,
  ){
    return this.usersService.edit(editCredentialsDto);
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "To get password reset link" })
  async forgotPassword(
    @Body() forgotPasswordDto:ForgotPasswordDto
  ){
    return this.usersService.forgotPassword(forgotPasswordDto);
  }

  @Post('checkToken')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "To check password reset token is valid or not" })
  async checkToken(
    @Body() checkTokenDto:CheckTokenDto
  ){
    return this.usersService.checkToken(checkTokenDto);
  }

  @Post('passwordReset')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "To reset the new password" })
  async passwordReset(
    @Body() passwordResetDto:PasswordResetDto
  ){
    return this.usersService.passwordReset(passwordResetDto);
  }

  @Post('testEmailTemplate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "To check Dynamic E-mail Template" })
  async testEmailTemplate(
    @Body() TestEmailTemplateDto:TestEmailTemplateDto
  ){
    return this.usersService.testEmailTemplate(TestEmailTemplateDto);
  }



}
