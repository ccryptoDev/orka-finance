import { PartialType } from '@nestjs/swagger';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { Flag } from 'aws-sdk/clients/iot';

export class CreateSalesContractreviewDto {

    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        description: 'LoanID',
    })
    loanid: string;

    @ApiProperty({
        description: 'Comments for Request Information.',
        example: 'comment',
    })
    comments: string;

    sendname: string;

    sendemail: string;






}
