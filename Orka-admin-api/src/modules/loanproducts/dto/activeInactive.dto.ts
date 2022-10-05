import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class ActiveInactiveDto{

    @IsNotEmpty()
    @ApiProperty({
        description: 'Loan Product ID',
        example: '1',
    })
    productId: number;
    
    @IsNotEmpty()
    @ApiProperty({
        description: 'Main Partner ID',
        example: 'Partner UUID',
    })
    installerId:string

    @IsNotEmpty()
    @ApiProperty({
        description: 'Main Partner ID',
        example: 'Admin UUID',
    })
    userId:string

    @IsNotEmpty()
    @ApiProperty({
        description: 'Activate/Deactivate',
        example: 'Y',
    })
    status:string


}