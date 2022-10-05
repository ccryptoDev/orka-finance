import { PartialType } from '@nestjs/swagger';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { Flag } from 'aws-sdk/clients/iot';
import { CreateMilestoneDto } from './create-milestone.dto';
import { uuid } from 'aws-sdk/clients/customerprofiles';

export class UpdateMilestoneDto{


    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        description: 'LoanID',
    })
    loanid: string;

    id:uuid;
    
    sendname: string;

    sendemail: string;

    comments: string;

    milestone:string;

    businessname:string;
}
