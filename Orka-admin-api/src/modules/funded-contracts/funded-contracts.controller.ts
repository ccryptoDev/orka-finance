import { Controller, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, SetMetadata, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RolesGuard } from 'src/guards/roles.guard';
import { FundedContractsService } from './funded-contracts.service';
export const Roles = (...roles: string[]) => SetMetadata('role', roles);

@ApiBearerAuth()
@Roles('admin')
@UseGuards(AuthGuard('jwt'),RolesGuard)

@ApiTags('Funded-contracts')
@Controller('funded-contracts')
export class FundedContractsController {

    constructor(private readonly fundedContractsService: FundedContractsService) {}

    @Get('')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: "Get all funded-contracts list" })
    async get() {
        return this.fundedContractsService.get();
    }

    @Get('/:id')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: "Get funded-contract full details" })
    async getdetails(
        @Param('id', ParseUUIDPipe) id: string
    ){
        return this.fundedContractsService.getdetails(id);
    }
}
