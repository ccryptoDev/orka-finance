import { MainFilterDto } from './dto/main-filter.dto';
import { Controller, Get,Post, HttpCode, HttpStatus, ParseUUIDPipe, Param,UseGuards, Body } from '@nestjs/common';
import { MainService } from './main.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../../guards/roles.guard';
import { SetMetadata } from '@nestjs/common';

export const Roles = (...roles: string[]) => SetMetadata('role', roles);
@ApiBearerAuth()
@Roles('installer')
@UseGuards(AuthGuard('jwt'),RolesGuard)
@ApiTags('Dashboard')
@Controller('home')
export class MainController {
    constructor(private readonly mainService: MainService){}

    @Get(':id')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: "Get all the Applicants of corresponding partner" })
    async getAllApplicants(@Param('id', ParseUUIDPipe) id: string){
        return this.mainService.getAllApplicants(id);
    }

    @Post('fliter/:id')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: "Get all the Applicants of corresponding partner based on filter applied" })
    async getFilter(@Param('id', ParseUUIDPipe) id: string,
        @Body() mainFilterDto:MainFilterDto
    ){
        return this.mainService.getFilter(id,mainFilterDto);
    }
}