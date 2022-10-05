import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class EditProfileDto {

    // @IsNotEmpty()
    // @IsString()
    // @ApiProperty({
    //     description: 'first Name.',
    //     example: 'Test',
    // })
    // firstName: string;

    // @IsNotEmpty()
    // @IsString()
    // @ApiProperty({
    //     description: 'last Name.',
    //     example: 'Test',
    // })
    // lastName: string;

    // @IsNotEmpty()
    // @IsString()
    // @ApiProperty({
    //     description: 'birthday.',
    //     example: '30/01/1976',
    // })
    // birthday: string;

    // @IsNotEmpty()
    // @IsString()
    // @ApiProperty({
    //     description: 'user Id.',
    //     example: 'dbb5eeba-971e-4a9f-9758-f2ad703826e5',
    // })
    // user_id: string;

    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        description: 'business Name.',
        example: 'Test',
    })
    businessName: string;

    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        description: 'business Shortname url slug.',
        example: 'Test',
    })
    businessShortName: string;

    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        description: 'business Email.',
        example: 'test@gmail.com',
    })
    businessEmail: string;

    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        description: 'business Phone.',
        example: '+ 1(999) 999-9999',
    })
    businessPhone: string;

    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        description: 'business Address.',
        example: 'Fairway St',
    })
    businessAddress: string;
    
    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        description: 'First Name',
        example: 'Orka',
    })
    firstName: string;
   
    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        description: 'Last Name',
        example: 'Orka',
    })
    lastName: string;

    // @IsNotEmpty()
    // @IsString()
    // @ApiProperty({
    // description: 'unit.',
    // example: '7001',
    // })
    // unit: string;

    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        description: 'city.',
        example: 'Quinton',
    })
    city: string;

    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        description: 'state.',
        example: 'VA',
    })
    state: string;

    @IsNotEmpty()
    @IsNumber()
    @ApiProperty({
        description: 'zipCode.',
        example: '123456',
    })
    zipCode: number;

    // @IsNotEmpty()
    // @IsString()
    // @ApiProperty({
    //     description: 'contractorLicense.',
    //     example: 'ABCD123456',
    // })
    // contractorLicense: string;

    // @IsNotEmpty()
    // @IsString()
    // @ApiProperty({
    //     description: 'contractorLicenseState.',
    //     example: 'VA',
    // })
    // contractorLicenseState: string;

}