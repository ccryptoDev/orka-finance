import { ApiProperty } from '@nestjs/swagger';
import {IsNotEmpty, IsNumber, IsString } from 'class-validator';


export class AddUserDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Main Installer Id',
    example: '6311715d-ea2b-4e12-8579-916d91b5d0d6',
  })
  mainInstallerId: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'First Name',
    example: 'welcome123',
  })
  firstName: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Last Name',
    example: 'test123',
  })
  lastName: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Email',
    example: 'testintaller@gmail.com',
  })
  email: string;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Role Id',
    example: '11',
  })
  role: number;
}