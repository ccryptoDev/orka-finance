import { IsNotEmpty, IsString } from 'class-validator';

export class PlaidOptoutFormDto {
  @IsString()
  @IsNotEmpty()
  loanId: string;
}
