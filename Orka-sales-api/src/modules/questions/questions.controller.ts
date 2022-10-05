import {
  Controller,
  Get,
  HttpStatus,
  HttpCode,
  Post,
  Body,
  Param,
} from '@nestjs/common';
import { QuestionsService } from './questions.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { UpdateQuestionsDto } from './dto/updatequestions.dto';

@ApiTags('Financial Review Questions')
@Controller('questions')
export class QuestionsController {
  constructor(private readonly questionsService: QuestionsService) {}

  @Get('')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'GET_ALL' })
  async findAll() {
    return this.questionsService.findAll();
  }

  @Get('checkshowquestions')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'check show questions or not' })
  async checkShowQuestions() {
    return this.questionsService.checkShowQuestions();
  }

  @Get('/:id')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Get details for Financial Review Questions' })
  async getDetails(@Param('id') loanId: string) {
    return this.questionsService.getDetails(loanId);
  }

  @Post('update')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Creating Client Opportunity' })
  async createClientOpportunity(
    @Body() UpdateQuestionsDto: UpdateQuestionsDto,
  ) {
    return this.questionsService.updatecustomerdetails(UpdateQuestionsDto);
  }
}
