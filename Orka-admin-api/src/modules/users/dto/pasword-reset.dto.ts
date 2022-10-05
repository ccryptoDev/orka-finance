import { ApiProperty } from '@nestjs/swagger';
import {IsNotEmpty, IsString } from 'class-validator';

export class CheckTokenDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Token',
    example: '$2b$10$.Qs8C90kOFDiuXKJBqyfvu.BqAuRydN2EucjiYCCRsF6bAI0ASX1G',
  })
  token: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'email',
    example: 'sundar.ajay147@gmail.com',
  })
  email: string;
}

export class PasswordResetDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'New password',
    example: '123456@Abc',
  })
  newpw: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'email',
    example: 'sundar.ajay147@gmail.com',
  })
  email: string;
}