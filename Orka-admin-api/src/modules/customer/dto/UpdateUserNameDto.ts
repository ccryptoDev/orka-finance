import {IsNotEmpty, IsString} from "class-validator";
import {ApiProperty} from "@nestjs/swagger";

export class UpdateUserNameDto {
    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        description: 'first Name.',
        example: 'Test',
    })
    firstName: string;

    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        description: 'last Name.',
        example: 'Test',
    })
    lastName: string;
}