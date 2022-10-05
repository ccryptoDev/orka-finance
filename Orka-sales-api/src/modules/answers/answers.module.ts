import { Module } from '@nestjs/common';
import { AnswersService } from './answers.service';
import { AnswersController } from './answers.controller';
import { QuestionsRepository } from '../../repository/questions.repository';
import { LoanRepository } from '../../repository/loan.repository';
import { AnswersRepository } from '../../repository/answers.repository';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      QuestionsRepository,
      LoanRepository,
      AnswersRepository,
    ]),
  ],
  controllers: [AnswersController],
  exports: [AnswersService],
  providers: [AnswersService],
})
export class AnswersModule {}
