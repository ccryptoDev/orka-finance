import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class ProductActiveInactiveDto{

    @IsNotEmpty()
    @ApiProperty({
        description: 'Loan Product ID',
        example: '1',
    })
    productId: number;
    

    @IsNotEmpty()
    @ApiProperty({
        description: 'Activate/Deactivate',
        example: 'ACTIVE',
    })
    status:string


}