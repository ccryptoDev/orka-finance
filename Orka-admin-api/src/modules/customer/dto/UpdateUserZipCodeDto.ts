import {IsNotEmpty, IsString} from "class-validator";
import {ApiProperty} from "@nestjs/swagger";

export class UpdateUserZipCodeDto {
    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        description: 'zip Code.',
        example: 123456,
    })
    zipCode: string;
}