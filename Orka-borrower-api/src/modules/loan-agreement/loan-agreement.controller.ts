import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';

import { UserEntity } from '../../entities/users.entity';
import { RolesGuard } from '../../guards/roles.guard';
import { Roles } from '../users/users.controller';
import { LoanAgreementService } from './loan-agreement.service';

@ApiTags('Loan Agreement')
@Controller('loan-agreement')
export class LoanAgreementController {
  constructor(private readonly loanAgreementService: LoanAgreementService) {}

  @ApiBearerAuth()
  @Roles('customer')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @ApiOperation({ summary: 'Borrower Envelope' })
  @Post('/:loanId')
  async getEnvelope(@Param('loanId', ParseUUIDPipe) loanId: string) {
    const results = await this.loanAgreementService.create(loanId);

    return { results };
  }

  @ApiBearerAuth()
  @Roles('customer')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @ApiOperation({ summary: 'Download Financing Contract Document' })
  @Get('/financing-contract/doc/:loanId')
  async getFinancingAgreementDoc(
    @Param('loanId', ParseUUIDPipe) loanId: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const user: UserEntity = <UserEntity>req.user;

    try {
      const results = await this.loanAgreementService.getFinancingAgreementDoc(
        user.email,
        loanId,
        res,
      );
      if (results) {
        res.status(results.statusCode).json(results);
      }
    } catch (error) {
      console.log('Error', error);
    }
  }

  @ApiBearerAuth()
  @Roles('customer')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @ApiOperation({ summary: 'Download Borrower ACH Auth Form Document' })
  @Get('/ach-auth-form/doc/:loanId')
  async getAchAuthFormDoc(
    @Param('loanId', ParseUUIDPipe) loanId: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const user: UserEntity = <UserEntity>req.user;

    try {
      const results = await this.loanAgreementService.getAchAuthFormDoc(
        user.email,
        loanId,
        res,
      );
      if (results) {
        res.status(results.statusCode).json(results);
      }
    } catch (error) {
      console.log('Error', error);
    }
  }

  @ApiBearerAuth()
  @Roles('customer')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @ApiOperation({ summary: 'Download All Personal Guarantors Document' })
  @Get('/borrower-guarantor/doc/:loanId')
  async getBorrowerGuarantorDoc(
    @Param('loanId', ParseUUIDPipe) loanId: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const user: UserEntity = <UserEntity>req.user;

    try {
      const results = await this.loanAgreementService.getBorrowerGurarantorDoc(
        user.email,
        loanId,
        res,
      );
      if (results) {
        res.status(results.statusCode).json(results);
      }
    } catch (error) {
      console.log('Error', error);
    }
  }

  @ApiBearerAuth()
  @Roles('admin')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @ApiOperation({ summary: 'Download Completed Envelope Document' })
  @Get('/completed-envelope/doc/:loanId')
  async getCompleteEnvelopeDoc(
    @Param('loanId', ParseUUIDPipe) loanId: string,
    @Res() res: Response,
  ) {
    try {
      const results = await this.loanAgreementService.getCompletedEnvelopeDoc(
        loanId,
        res,
      );
      if (results) {
        res.status(results.statusCode).json(results);
      }
    } catch (error) {
      console.log('Error', error);
    }
  }

  @ApiBearerAuth()
  @Roles('admin')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @ApiOperation({ summary: 'Get Admin Envelope' })
  @Get('/admin/:loanId')
  async getAdminEnvelope(
    @Param('loanId', ParseUUIDPipe) loanId: string,
    @Req() req: Request,
  ) {
    const user: UserEntity = <UserEntity>req.user;
    const results = await this.loanAgreementService.getAdminEnvelope(
      user.email,
      loanId,
    );
    
    return { results };
  }

  @HttpCode(200)
  @Post('/connect/TjA1NjAtZm/webhooks/:id')
  async postExample(@Param('id') id: string, @Req() request: Request) {
    const res = await this.loanAgreementService.docusignWebhook(
      id,
      request.body,
      request.headers['x-docusign-signature-1'] as string,
    );
    return res;
  }


  @Get('/docusigndate/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({summary:"Get all the datesubmitted Docusign Signed"})
  async getDocusigndatesubmitted(@Param('id',ParseUUIDPipe) id:string)
  {
    return this.loanAgreementService.getDocusigndatesubmitted(id)
  }
}
