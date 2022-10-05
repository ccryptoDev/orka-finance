import { IsNotEmpty, IsString, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { Answers } from './Answers.dto';

export class CreateAnswerDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Answers)
  answers: Answers[];

  @IsNotEmpty()
  @IsString()
  insIserId: string;
}
