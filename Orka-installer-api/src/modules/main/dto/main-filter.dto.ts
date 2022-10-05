import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class MainFilterDto {
  
  @ApiProperty({
    description:'phase',
    example:'Underwriting'
  })
  phase: string;
  
  @ApiProperty({
    description:'state',
    example:'LA'
  })
  state: string;

  @ApiProperty({
    description:'salesRep',
    example:'Chandrasekar'
  })
  salesRep: string;

}