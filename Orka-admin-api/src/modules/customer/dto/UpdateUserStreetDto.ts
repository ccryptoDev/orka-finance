import {IsNotEmpty, IsString} from "class-validator";
import {ApiProperty} from "@nestjs/swagger";

export class UpdateUserStreetDto {
    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        description: 'street Address.',
        example: 'Test',
    })
    streetAddress: string;
}