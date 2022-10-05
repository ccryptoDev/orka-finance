import { IsNotEmpty, IsString } from 'class-validator';

export class LoanDetails {
    @IsNotEmpty()
    @IsString()
    financingRequested:string

    @IsNotEmpty()
    @IsString()
    financingTermRequested: string;

    @IsNotEmpty()
    @IsString()
    interestRate: string;

    @IsNotEmpty()
    @IsString()
    apr:string

    @IsNotEmpty()
    @IsString()
    originationFee:string;


    @IsNotEmpty()
    @IsString()
    paymentAmount:string
}