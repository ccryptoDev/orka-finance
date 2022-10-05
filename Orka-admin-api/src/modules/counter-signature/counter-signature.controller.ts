import { Controller,Get, HttpStatus, HttpCode,UseGuards,ParseUUIDPipe,Param, Post, Body } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RolesGuard } from '../../guards/roles.guard';
import { SetMetadata } from '@nestjs/common';
import { CounterSignatureService } from './counter-signature.service';
import { CreateCounterSignatureDto } from './dto/create-counter-signature.dto';
import { UpdateCounterSignatureDto } from './dto/update-counter-signature.dto';
export const Roles = (...roles: string[]) => SetMetadata('role', roles);


@ApiTags('CounterSignature')
@ApiBearerAuth()
@Roles('admin')
@Controller('counter-signature')
export class CounterSignatureController {
  constructor(private readonly counterSignatureService: CounterSignatureService) {}

  @Get('')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "GET PENDING COUNTER SIGNATURE" })
  async get() {
    return this.counterSignatureService.get();
  }

  @Get('completed')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "GET COMPLETED COUNTER SIGNATURE" })
  async getCompleted() {
    return this.counterSignatureService.getCompleted();
  }

}
