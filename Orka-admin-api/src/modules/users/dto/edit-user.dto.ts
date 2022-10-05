import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsNumber, IsString } from 'class-validator';


export class EditCredentialsDto {
    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        description: 'user Id.',
        example: 'dbb5eeba-971e-4a9f-9758-f2ad703826e5',
    })
    user_id: string;

    @IsNotEmpty()
    @IsEmail()
    @ApiProperty({
        description: 'User email.',
        example: 'example@test.com',
    })
    email: string;

    @IsNotEmpty()
    @IsString()
    firstName: string;

    @IsNotEmpty()
    @IsString()
    lastName: string;

}