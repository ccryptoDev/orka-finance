import {IsNotEmpty, IsString} from 'class-validator';

export class AddCommentsDto {
    @IsNotEmpty()
    @IsString()
    subject: string;

    @IsNotEmpty()
    @IsString()
    comments: string;

    @IsNotEmpty()
    @IsString()
    loanId: string;

    @IsNotEmpty()
    @IsString()
    userId: string;

}