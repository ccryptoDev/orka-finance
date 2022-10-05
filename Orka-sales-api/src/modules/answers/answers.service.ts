import { Injectable, InternalServerErrorException } from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { CreateAnswerDto } from './dto/create-answer.dto';
import { QuestionsRepository } from '../../repository/questions.repository';
import { LoanRepository } from '../../repository/loan.repository';
import { AnswersRepository } from '../../repository/answers.repository';
import { Loan } from '../../entities/loan.entity';
import { Answer } from '../../entities/answer.entity';
import { In } from 'typeorm';
import { Condition, Type } from '../../configs/config.enum';

@Injectable()
export class AnswersService {
  constructor(
    @InjectRepository(QuestionsRepository)
    private readonly questionsRepository: QuestionsRepository,
    @InjectRepository(LoanRepository)
    private readonly loanRepository: LoanRepository,
    @InjectRepository(AnswersRepository)
    private readonly answersRepository: AnswersRepository,
  ) {}

  async create(createAnswerDto: CreateAnswerDto) {
    let err = '';
    const questionId = createAnswerDto.answers.map((answer, pos) => {
      if (answer.answer.trim().length === 0)
        err = `answers[${pos}].answer should not be empty`;
      if (err.length > 0) return;
      return answer.questionId;
    });
    if (err.length > 0)
      return { statusCode: 400, message: [err], error: 'Bad Request' };
    try {
      const questionchecking = await this.questionsRepository.find({
        select: ['id', 'type', 'condition', 'approvedif'],
        where: { id: In(questionId) },
      });
      if (questionchecking.length === questionId.length) {
        let eligible = false;
        createAnswerDto.answers.forEach(answer => {
          questionchecking.forEach(question => {
            if (answer.questionId === question.id) {
              let answer1: any;
              let answer2: any;
              if (question.type === Type.Yes_or_no) {
                answer1 = question.approvedif;
                answer2 = answer.answer;
              } else if (question.type === Type.Value) {
                answer1 = Number(question.approvedif);
                answer2 = Number(answer.answer);
              }
              switch (question.condition) {
                case Condition.eq:
                  eligible = answer1 === answer2;
                  break;
                case Condition.gt:
                  eligible = answer1 <= answer2;
                  break;
                case Condition.lt:
                  eligible = answer1 < answer2;
                  break;
                case Condition.gte:
                  eligible = answer1 >= answer2;
                  break;
                case Condition.lte:
                  eligible = answer1 <= answer2;
                  break;
              }
            }
          });
        });
        if (!eligible) {
          return {
            statusCode: 400,
            message: ['You are not eligible for this loan'],
            error: 'Bad Request',
          };
        }
        const loanEntity = new Loan();
        loanEntity.insUserId = createAnswerDto.insIserId;

        const loan = await this.loanRepository.save(loanEntity);
        const answers = createAnswerDto.answers.map(i => {
          const answer = new Answer();
          answer.questionId = i.questionId;
          answer.answer = i.answer;
          answer.loanId = loan.id;
          return answer;
        });
        await this.answersRepository.save(answers);
        return { statusCode: 200, Loan_ID: loan.id };
      }
      return {
        statusCode: 400,
        message: ['question ID is not found'],
        error: 'Bad Request',
      };
    } catch (error) {
      let resp = new InternalServerErrorException(error).getResponse();
      if (Object.keys(resp).includes('name'))
        resp = Object.values(resp)[Object.keys(resp).indexOf('name')];
      return {
        statusCode: 500,
        message: [resp],
        error: 'Bad Request',
      };
    }
  }
}
