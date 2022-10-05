import { IsNotEmpty, IsString } from 'class-validator';

export class Answers {
  @IsNotEmpty()
  @IsString()
  questionId: string;

  @IsNotEmpty()
  @IsString()
  answer: string;
}
