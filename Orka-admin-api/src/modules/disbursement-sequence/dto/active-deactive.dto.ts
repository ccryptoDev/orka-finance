import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class ActiveDeactiveDto {

    @IsNotEmpty()
    @ApiProperty({
        description: 'Disbursement Sequence Id.',
        example: '8',
    })
    id: any;

    @IsNotEmpty()
    @ApiProperty({
        description: 'Activate/Deactivate',
        example: 'Y',
    })
    status:string


}