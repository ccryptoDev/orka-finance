import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsNumber, IsString } from 'class-validator';


export class TestEmailTemplateDto {
 
  @IsEmail()
  @ApiProperty({
    description: 'Test email.',
    example: 'example@test.com',
  })
  email: string;
  templateID: string;
//   link: string;
//   resetLink: string;
dynamic_data :any ={}
}