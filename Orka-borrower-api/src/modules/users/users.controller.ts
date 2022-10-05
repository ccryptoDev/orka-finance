import { Body, Controller, HttpCode, HttpStatus, Post,Get,ParseUUIDPipe,Param, UseGuards, Put, SetMetadata } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { SigninCreadentialsDto }from './dto/signin-user.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../../guards/roles.guard';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { CheckTokenDto, PasswordResetDto } from './dto/pasword-reset.dto';
import { SetPasswordDto } from './dto/setPassword.dto';
export const Roles = (...roles: string[]) => SetMetadata('role', roles);

export enum AuthSummary {
  SIGN_IN_SUMMARY = 'Sign in for users.',
  User_verify = 'User Verify'
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
  @Roles('customer')
  @UseGuards(AuthGuard('jwt'),RolesGuard)
  @Put('/changepassword/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "change borrower password"})
  async changePassword(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() changePasswordDto:ChangePasswordDto
  ){
    return this.usersService.changePassword(id, changePasswordDto)
  }

  @Get('/verify/:id/:token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: AuthSummary.User_verify })
  async verify(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('token') token: string
  ){
    return this.usersService.verify(id,token);
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

  @Get('getCurrentPassword/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({summary:"To check whether the user is eligible for set password for the first time"})
  async getCurrentPassword(
    @Param('id', ParseUUIDPipe) id: string
  ){
    return this.usersService.getCurrentPassword(id)
  }

  @Get('setPassword/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({summary:"To check whether the user is eligible for set password for the first time"})
  async checkFirstTime(
    @Param('id', ParseUUIDPipe) id: string
  ){
    return this.usersService.checkFirstTime(id)
  }

  @Post('setPassword')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({summary:"To set the password for the first time"})
  async setPassword(
    @Body() setPasswordDto:SetPasswordDto
  ){
    return this.usersService.setPassword(setPasswordDto);
  }
}
