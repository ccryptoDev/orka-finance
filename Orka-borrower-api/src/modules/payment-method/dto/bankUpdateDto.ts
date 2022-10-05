import {ApiProperty} from '@nestjs/swagger';
import {IsNotEmpty, IsString} from 'class-validator';

export class BankUpdateDto {
    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        description: 'Bank Id.',
        example: '4f9dfe7e-6fb0-40ba-8011-43706695d1a7',
    })
    bankId: string;
}