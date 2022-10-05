import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class AddExistingDto {

    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        description: "businessShortName",
        example: 'orka',
    })
    businessShortName: string;

    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        description: 'userEmail',
        example: 'test@gmail.com',
    })
    userEmail: string;

    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        description: 'firstName',
        example: 'Nag',
    })
    firstName: string;

    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        description: 'lastName',
        example: 'Raj',
    })
    lastName: string;


    //required when role is implemented
    // @IsNotEmpty()
    // @IsString()
    // @ApiProperty({
    //     description: 'role',
    //     example: 'Fairway St',
    // })
    // role: string;

}