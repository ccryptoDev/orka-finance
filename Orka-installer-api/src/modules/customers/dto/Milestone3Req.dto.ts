import {IsNotEmpty, IsString} from "class-validator";
import {ApiProperty} from "@nestjs/swagger";

export class Milestone3ReqDto {
    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        description: 'Request next 60% of funding .',
        example: '1000.00',
    })
    milestone3ReqAmount: string;

    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        description: 'user id.',
        example: 'f15e1e4f5e4f54e5fe',
    })
    userId: string;

    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        description: 'loan id.',
        example: 'f15e1e4f5e4f54e5fe',
    })
    loanId: string;

    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        description: 'signature.',
        example: '',
    })
    signature: string;
}