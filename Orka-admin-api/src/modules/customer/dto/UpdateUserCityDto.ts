import {IsNotEmpty, IsString} from "class-validator";
import {ApiProperty} from "@nestjs/swagger";

export class UpdateUserCityDto {
    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        description: 'city.',
        example: 'Test',
    })
    city: string;
}