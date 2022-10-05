import { ApiProperty } from '@nestjs/swagger';
import {
    IsNotEmpty,
    IsString,
    IsNumber,
    IsBoolean,
} from 'class-validator';

export class LoanOpsChangeStatusDto {

    @IsNotEmpty()
    @ApiProperty({
        description: 'loan Id.',
        example: '8',
    })
    loanID: any;

    @IsNotEmpty()
    status:string;

    incomeVerifiedAmount: string

    moduleName:string;

}
