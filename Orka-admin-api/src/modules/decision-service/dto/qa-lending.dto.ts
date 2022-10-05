import {
    IsNotEmpty,
    IsString,
    IsNumber,
    IsBoolean,
} from 'class-validator';

export class QaLendingDto {

    @IsNotEmpty()
    @IsNumber()
    financingRequested: number;

    @IsNotEmpty()
    @IsNumber()
    personalGuarantorFico: number;

    @IsNotEmpty()
    @IsNumber()
    personalGuarantorStatedIncome: number;

    @IsNotEmpty()
    @IsNumber()
    personalGuarantorEquifaxModeledIncome: number;

    @IsNotEmpty()
    @IsNumber()
    personalGuarantorNonOrkaMonthlyDebtAmount: number;

    @IsNotEmpty()
    @IsNumber()
    businessLastTwelveMonthsBankBalances: number;

    @IsNotEmpty()
    @IsBoolean()
    achEnabled:boolean = false;

}
