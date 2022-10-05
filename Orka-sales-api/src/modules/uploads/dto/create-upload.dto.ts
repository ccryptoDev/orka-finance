import { IsNotEmpty, IsString } from 'class-validator';

export class CreateUploadDto {
  @IsNotEmpty()
  @IsString()
  loanId: string;
}
