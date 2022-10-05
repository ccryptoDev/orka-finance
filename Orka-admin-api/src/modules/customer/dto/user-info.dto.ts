import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

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

export class UpdateUserStreetDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'street Address.',
    example: 'Test',
  })
  streetAddress: string;
}

export class UpdateUserCityDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'city.',
    example: 'Test',
  })
  city: string;
}

export class UpdateUserZipCodeDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'zip Code.',
    example: 123456,
  })
  zipCode: string;
}