import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsBoolean,
  IsEmail,
} from 'class-validator';

export class UpdateQuestionsDto {
  loanId: string;

  @IsNotEmpty()
  @IsString()
  lifeCycleStage: string;

  @IsNotEmpty()
  @IsString()
  expectedRevGrowth: string;

  @IsNotEmpty()
  @IsString()
  growthDrivers: string;

  @IsNotEmpty()
  @IsString()
  profitabilityGrowth: string;

  @IsNotEmpty()
  @IsString()
  liabilities: string;

  challenges: string;

  otherReason: string;
}
