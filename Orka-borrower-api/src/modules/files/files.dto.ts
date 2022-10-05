
import { IsNotEmpty, IsString,IsArray,ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class FilesDto {
    @IsNotEmpty()
    @IsString()
    link_id: string;
    
    @IsString()
    services:string
}
