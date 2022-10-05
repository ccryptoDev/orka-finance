import { ApiProperty } from '@nestjs/swagger';
import {IsNotEmpty, IsString } from 'class-validator';

export class SetPasswordDto{
  @IsNotEmpty()
  @ApiProperty({
    description: 'User Id'
  })
  id: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'Password'
  })
  password: string;
}