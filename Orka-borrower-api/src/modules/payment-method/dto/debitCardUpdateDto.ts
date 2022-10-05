import {ApiProperty} from '@nestjs/swagger';
import {IsNotEmpty, IsString} from 'class-validator';

export class DebitCardUpdateDto {
    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        description: 'card id.',
        example: '1acc9252-581f-4b35-be46-2f8e3a049317',
    })
    cardId: string;
}