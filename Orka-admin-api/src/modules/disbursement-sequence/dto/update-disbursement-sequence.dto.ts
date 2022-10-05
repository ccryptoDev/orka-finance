import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class UpdateDisbursementSequenceDto  {

    @IsNotEmpty()
    @ApiProperty({
        description: 'Disbursement Sequence Id.',
        example: '8',
    })
    id: any;

    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        description: 'Disbursement Name.',
        example: 'Test',
    })
    name: string;

    @IsNotEmpty()
    @ApiProperty({
        description: 'Disbursement Total.',
        example: 'Test',
    })
    total_disbs: string;

    @IsNotEmpty()
    @ApiProperty({
        description: 'Disbursement M1 Percentage.',
        example: 'Test',
    })
    m1_percent: string;

    @IsNotEmpty()
    @ApiProperty({
        description: 'Disbursement M2 Percentage.',
        example: 'Test',
    })
    m2_percent: string;

    @IsNotEmpty()
    @ApiProperty({
        description: 'Disbursement M3 Percentage.',
        example: 'Test',
    })
    m3_percent: string;

    //@IsNotEmpty()
    @ApiProperty({
        description: 'Disbursement M4 Percentage.',
        example: 'Test',
    })
    m4_percent: string;

   // @IsNotEmpty()
    @ApiProperty({
        description: 'Disbursement M5 Percentage.',
        example: 'Test',
    })
    m5_percent: string;

    @IsNotEmpty()
    @ApiProperty({
        description: 'Disbursement M1 Type.',
        example: 'Test',
    })
    m1_type: string;


    @IsNotEmpty()
    @ApiProperty({
        description: 'Disbursement M2 Type.',
        example: 'Test',
    })
    m2_type: string;

    @IsNotEmpty()
    @ApiProperty({
        description: 'Disbursement M3 Type.',
        example: 'Test',
    })
    m3_type: string;


    // @IsNotEmpty()
    @ApiProperty({
        description: 'Disbursement M4 Type.',
        example: 'Test',
    })
    m4_type: string;


    // @IsNotEmpty()
    @ApiProperty({
        description: 'Disbursement M5 Type.',
        example: 'Test',
    })
    m5_type: string;

}
