import { IsNotEmpty, IsString } from 'class-validator';
export class CreateUploadDto {
    @IsNotEmpty()
    @IsString()
    loan_id: string;
}
