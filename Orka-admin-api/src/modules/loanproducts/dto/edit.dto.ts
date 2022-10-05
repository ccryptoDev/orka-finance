import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class EditLoanProductsDto {

    @IsNotEmpty()
    @ApiProperty({
        description: 'Product Id.',
        example: '8',
    })
    productId: any;

    @IsNotEmpty()
    @ApiProperty({
        description: 'loan Product Name.',
        example: 'Test',
    })
    name: string;

    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        description: 'loan Product Type.',
        example: 'Test',
    })
    type: string;

    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        description: 'Tenor Months.',
        example: '2',
    })
    tenorMonths: string;

    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        description: 'Tenor Years.',
        example: '5',
    })
    tenorYears: string;

    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        description: 'interestBaseRate.',
        example: '5.99',
    })
    interestBaseRate: string;

    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        description: 'Ach Discount.',
        example: '0.5',
    })
    achDiscount: string;

    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        description: 'Ach Discount Interest Rate.',
        example: '4.99',
    })
    achDiscountInterestRate: string;

    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        description: 'Dealer Fee.',
        example: '10',
    })
    dealerFee: string;

    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        description: 'Origination Fee.',
        example: '0',
    })
    originationFee: string;

    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        description: 'Prepayment Flag.',
        example: 'Y',
    })
    prepayment_flag: string;

    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        description: 'Prepayment.',
        example: '26',
    })
    prepayment: string;

    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        description: 'Prepayment Month.',
        example: '18',
    })
    prepaymentMonth: string;

    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        description: 'Downpayment.',
        example: '0',
    })
    downpayment: string;

    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        description: 'Mpf Ach WItc Prepay.',
        example: '0.235',
    })
    mpfAchWItcPrepay: string;

    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        description: 'Mpf AchWO Prepay.',
        example: '0.4785',
    })
    mpfAchWOPrepay: string;

    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        description: 'Mpf Check WItc Prepay.',
        example: '0.2554',
    })
    mpfCheckWItcPrepay: string;

    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        description: 'Mpf Check WO Prepay.',
        example: '0.2554',
    })
    mpfCheckWOPrepay: string;

    // @IsNotEmpty()
    // @IsString()
    @ApiProperty({
        description: 'Flex Ream Prepay Amount.',
        example: '0.2554',
    })
    flexReamPrepayAmount: string;
	
	// @IsNotEmpty()
    // @IsString()
    @ApiProperty({
        description: 'Flex Ream PrepayPercent of Principal.',
        example: '0.2554',
    })
    flexReamPrepayPercentofPrincipal: string;
	
	// @IsNotEmpty()
    // @IsString()
    @ApiProperty({
        description: 'Flex Ream MaxAnnual Frequency.',
        example: '0.2554',
    })
    flexReamMaxAnnualFrequency: string;

    @ApiProperty({
        description: 'Phase Name.',
        example: 'MVP',
    })
    phase: string;

    @ApiProperty({
        description: 'Start Date.',
        example: '',
    })
    startDate: string;

    @ApiProperty({
        description: 'End Date.',
        example: '',
    })
    endDate: string;
}