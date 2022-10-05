import { Injectable, InternalServerErrorException } from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { SettingsRepository } from 'src/entities/settings.repository';
import { QuestionsRepository } from '../../repository/questions.repository';
import { UpdateQuestionsDto } from './dto/updatequestions.dto';
import { CustomerRepository } from '../../repository/customer.repository';
import { UserRepository } from '../../repository/users.repository';
import { LoanRepository } from '../../repository/loan.repository';
import { LogRepository } from 'src/repository/log.repository';
import { getManager } from 'typeorm';
import { MailService } from '../../mail/mail.service';
import { LogsService } from 'src/common/logs/logs.service';

@Injectable()
export class QuestionsService {
  constructor(
    @InjectRepository(UserRepository)
    private readonly userRepository: UserRepository,
    @InjectRepository(CustomerRepository)
    private readonly customerRepository: CustomerRepository,
    @InjectRepository(LoanRepository)
    private readonly loanRepository: LoanRepository,
    @InjectRepository(LogRepository)
    private readonly logRepository: LogRepository,
    private readonly mailService: MailService,
    private readonly logService: LogsService,
    @InjectRepository(QuestionsRepository)
    private readonly questionsRepository: QuestionsRepository,
    @InjectRepository(SettingsRepository)
    private readonly settingsRepository: SettingsRepository,
  ) {}

  async findAll() {
    try {
      const question = await this.questionsRepository.find({
        select: ['id', 'question', 'type'],
        where: { deleteFlag: 'N' },
      });
      return { statusCode: 200, question };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async getDetails(loanId: string) {
    try {
      const details = await this.customerRepository.find({
        select: [
          'id',
          'loanId',
          'challenges',
          'liabilities',
          'profitabilityGrowth',
          'growthDrivers',
          'expectedRevGrowth',
          'lifeCycleStage',
          'otherReason',
        ],
        where: { loanId: loanId },
      });
      return { statusCode: 200, businessData: details[0] };
    } catch (error) {
      let resp = new InternalServerErrorException(error).getResponse();
      if (Object.keys(resp).includes('name'))
        resp = Object.values(resp)[Object.keys(resp).indexOf('name')];
      return {
        statusCode: 500,
        message: ['Invalid ID'],
        error: 'Invalid ID',
      };
    }
  }

  async checkShowQuestions() {
    try {
      const showQuestions = await this.settingsRepository.findOne({
        select: ['value'],
        where: { key: 'showQuestions' },
      });
      return { statusCode: 200, showQuestions };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
  async updatecustomerdetails(UpdateQuestionsDto: UpdateQuestionsDto) {
    try {
      const financialQuestions: any = await this.customerRepository.update(
        { loanId: UpdateQuestionsDto.loanId },
        {
          lifeCycleStage: UpdateQuestionsDto.lifeCycleStage,
          expectedRevGrowth: UpdateQuestionsDto.expectedRevGrowth,
          growthDrivers: UpdateQuestionsDto.growthDrivers,
          profitabilityGrowth: UpdateQuestionsDto.profitabilityGrowth,
          liabilities: UpdateQuestionsDto.liabilities,
          challenges: UpdateQuestionsDto.challenges,
          otherReason: UpdateQuestionsDto.otherReason,
        },
      );

      const user: any = await this.loanRepository.find({
        select: ['user_id'],
        where: { id: UpdateQuestionsDto.loanId },
      });
      //calling log service
      const message = 'Financial Review Qusetions are Updated';
      await this.logService.log(
        UpdateQuestionsDto.loanId,
        user[0].user_id,
        message,
      );

      if (financialQuestions.affected !== 0)
        return { statusCode: 200, message: ['Changes Saved'] };
    } catch (error) {
      let resp = new InternalServerErrorException(error).getResponse();
      if (Object.keys(resp).includes('name'))
        resp = Object.values(resp)[Object.keys(resp).indexOf('name')];
      console.log(error);

      return {
        statusCode: 500,
        message: ['Invalid Link or Link Expired'],
        error: 'Invalid ID',
      };
    }
  }
}
