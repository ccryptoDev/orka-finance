import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class OpportunityDto {
  
  @ApiProperty({
    description:'Legal Name',
    example:null
  })
  legalName: string;

  @ApiProperty({
    description:'Owner First Name',
    example:null
  })
  ownerFirstName:string;

  @ApiProperty({
    description:'Owner Last Name',
    example:null
  })
  ownerLastName:string;

  @ApiProperty({
    description:'email',
    example:null
  })
  email:string;

  @ApiProperty({
    description:'Business Phone',
    example:null
  })
  businessPhone:string;

  @ApiProperty({
    description:'Business Address',
    example:null
  })
  businessAddress:string;

  @ApiProperty({
    description:'Business State',
    example:null
  })
  state:string;

  @ApiProperty({
    description:'Business City',
    example:null
  })
  city:string;

  @ApiProperty({
    description:'Business Zipcode',
    example:null
  })
  zipcode:string;

  @ApiProperty({
    description:'Finance Requested',
    example:null
  })
  financingRequested:string;

  @ApiProperty({
    description:'Financing Term Requested',
    example:null
  })
  financingTermRequested:string;

  @ApiProperty({
    description:'Business Install Address',
    example:null
  })
  businessInstallAddress:string;

  @ApiProperty({
    description:'Business Install State',
    example:null
  })
  businessInstallState:string;

  @ApiProperty({
    description:'Business Install City',
    example:null
  })
  businessInstallCity:string;

  @ApiProperty({
    description:'Business Install Zipcode',
    example:null
  })
  businessInstallZipCode:string;


  @ApiProperty({
    description:'Site Type',
    example:null
  })
  siteType: string;
     
  @ApiProperty({
    description:'Electric Company',
    example:null
  })
  electricCompany:string;

  @ApiProperty({
    description:'Average Util Per Month',
    example:null
  })
  avgUtilPerMonth: string;
      
  @ApiProperty({
    description:'Average Consumption',
    example:null
  })
  avgConsumptionPerMonth: string;
    
  @ApiProperty({
    description:'Array Size',
    example:null
  })
  arraySize: string;
      
  @ApiProperty({
    description:'Panel Manufacturer',
    example:null
  })
  panelManufacturer:string;
      
  @ApiProperty({
    description:'Inverter Name Plate Capacity',
    example:null
  })
  inverterNamePlateCapacity:string;

  @ApiProperty({
    description:'Inverter Manufacturer',
    example:null
  })
  inverterManufacturer:string;
    
  @ApiProperty({
    description:'Battery Capacity',
    example:null
  })
  batteryCapacity:string;
  
  @ApiProperty({
    description:'Battery Manufacturer',
    example:null
  })
  batteryManufacturer:string;
    
  @ApiProperty({
    description:'Mount Type',
    example:null
  })
  mountType:string;
    
  @ApiProperty({
    description:'Est Generation Rate',
    example:null
  })
  estGenerationRate:string;
    
  @ApiProperty({
    description:'Est Generation',
    example:null
  })
  estGeneration:string;
    
  @ApiProperty({
    description:'Non Solar Equipment Work',
    example:null
  })
  nonSolarEquipmentWork:string;
    
  @ApiProperty({
    description:'Non Solar Project Cost',
    example:null
  })
  nonSolarProjectCost:string;
    
  @ApiProperty({
    description:'Total Project Cost',
    example:null
  })
  totalProjectCost:string;

  @ApiProperty({
    description:'Latitude',
    example:null
  })
  lat:string

  @ApiProperty({
    description:'Longitude',
    example:null
  })
  lng:string

  @ApiProperty({
    description:'productID',
    example:null
  })
  productID:string

}