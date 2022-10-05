import { PartialType } from '@nestjs/swagger';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { Flag } from 'aws-sdk/clients/iot';

export class CreateMilestoneDto {

    ref_no:string;

    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        description: 'LoanID',
    })
    loanid: string;

    milestone:string;

    @ApiProperty({
        description: 'Comments for Request Information.',
        example: 'comment',
    })
    comments: string;

    status:string

}
