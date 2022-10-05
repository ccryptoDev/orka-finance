import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { BusinessPrincipalIdentityFormDto } from './dto/business-principle-identity-form.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { CustomerRepository } from '../../repository/customer.repository';
import { LogRepository } from 'src/repository/log.repository';
import { LogEntity } from 'src/entities/log.entity';
import { Flags } from 'src/configs/config.enum';
import { v4 as uuid } from 'uuid';
import { LogsService } from 'src/common/logs/logs.service';
import { LoanRepository } from 'src/repository/loan.repository';
import { getManager } from 'typeorm';

@Injectable()
export class BusinessPrincipleIdentityService {
  constructor(
    @InjectRepository(CustomerRepository)
    private readonly customerRepository: CustomerRepository,
    @InjectRepository(LoanRepository)
    private readonly loanRepository: LoanRepository,
    private readonly logsService: LogsService,
  ) {}

  async getDetails(loanId: string) {
    try {
      const details = await this.customerRepository.find({
        select: [
          'id',
          'loanId',
          'ownerFirstName',
          'ownerLastName',
          'ownerEmail',
          'ownerDOB',
          'ownerSSN',
          'ownerPhone',
          'ownerAddress',
          'ownerCity',
          'ownerState',
          'ownerZipCode',
          'ownerProfessionalTitle',
          'ownerAnnualIncome',
          'ownerPercentage',
          'owner2',
          'owner2Id',
          'owner2FirstName',
          'owner2LastName',
          'owner2Email',
          'owner2DOB',
          'owner2SSN',
          'owner2Phone',
          'owner2Address',
          'owner2City',
          'owner2State',
          'owner2ZipCode',
          'owner2ProfessionalTitle',
          'owner2AnnualIncome',
          'owner2Percentage',

          'owner3',
          'owner3Id',
          'owner3FirstName',
          'owner3LastName',
          'owner3Email',
          'owner3DOB',
          'owner3SSN',
          'owner3Phone',
          'owner3Address',
          'owner3City',
          'owner3State',
          'owner3ZipCode',
          'owner3ProfessionalTitle',
          'owner3AnnualIncome',
          'owner3Percentage',
        ],
        where: { loanId: loanId },
      });
      return { statusCode: 200, businessData: details[0] };
    } catch (error) {
      let resp = new InternalServerErrorException(error).getResponse();
      if (Object.keys(resp).includes('name'))
        resp = Object.values(resp)[Object.keys(resp).indexOf('name')];
      return {
        statusCode: 500,
        message: ['Invalid ID'],
        error: 'Invalid ID',
      };
    }
  }

  async principalDetails(
    businessPrincipalIdentityFormDto: BusinessPrincipalIdentityFormDto,
    ip: string,
  ) {
    //console.log( businessPrincipalIdentityFormDto);
    const entityManager = getManager();
    const a =
      businessPrincipalIdentityFormDto.owner2 == 'Y' ? Flags.Y : Flags.N;
    const ow2Id = uuid();
    const ow3Id = uuid();
    try {
      let details = await this.customerRepository.update(
        { loanId: businessPrincipalIdentityFormDto.loanId },
        {
          ownerFirstName: businessPrincipalIdentityFormDto.ownerFirstName,
          ownerLastName: businessPrincipalIdentityFormDto.ownerLastName,
          ownerEmail: businessPrincipalIdentityFormDto.ownerEmail,
          ownerDOB: businessPrincipalIdentityFormDto.ownerDOB,
          ownerSSN: businessPrincipalIdentityFormDto.ownerSSN,
          ownerPhone: businessPrincipalIdentityFormDto.ownerPhone,
          ownerAddress: businessPrincipalIdentityFormDto.ownerAddress,
          ownerCity: businessPrincipalIdentityFormDto.ownerCity,
          ownerState: businessPrincipalIdentityFormDto.ownerState,
          ownerZipCode: businessPrincipalIdentityFormDto.ownerZipCode,
          ownerProfessionalTitle:
            businessPrincipalIdentityFormDto.ownerProfessionalTitle,
          ownerAnnualIncome: businessPrincipalIdentityFormDto.ownerAnnualIncome,
          ownerPercentage: businessPrincipalIdentityFormDto.ownerPercentage,
          owner2: a,
          pgno: 3,
        },
      );
      if (businessPrincipalIdentityFormDto.owner2 == 'Y') {
        details = await this.customerRepository.update(
          { loanId: businessPrincipalIdentityFormDto.loanId },
          {
            owner2Id: ow2Id,
            owner2FirstName: businessPrincipalIdentityFormDto.owner2FirstName,
            owner2LastName: businessPrincipalIdentityFormDto.owner2LastName,
            owner2Email: businessPrincipalIdentityFormDto.owner2Email,
            owner2DOB: businessPrincipalIdentityFormDto.owner2DOB,
            owner2SSN: businessPrincipalIdentityFormDto.owner2SSN,
            owner2Phone: businessPrincipalIdentityFormDto.owner2Phone,
            owner2Address: businessPrincipalIdentityFormDto.owner2Address,
            owner2City: businessPrincipalIdentityFormDto.owner2City,
            owner2State: businessPrincipalIdentityFormDto.owner2State,
            owner2ZipCode: businessPrincipalIdentityFormDto.owner2ZipCode,
            owner2ProfessionalTitle:
              businessPrincipalIdentityFormDto.owner2ProfessionalTitle,
            owner2AnnualIncome:
              businessPrincipalIdentityFormDto.owner2AnnualIncome,
            owner2Percentage: businessPrincipalIdentityFormDto.owner2Percentage,
          },
        );
      }
      if (businessPrincipalIdentityFormDto.owner3 == 'Y') {
        details = await this.customerRepository.update(
          { loanId: businessPrincipalIdentityFormDto.loanId },
          {
            owner3Id: ow3Id,
            owner3FirstName: businessPrincipalIdentityFormDto.owner3FirstName,
            owner3LastName: businessPrincipalIdentityFormDto.owner3LastName,
            owner3Email: businessPrincipalIdentityFormDto.owner3Email,
            owner3DOB: businessPrincipalIdentityFormDto.owner3DOB,
            owner3SSN: businessPrincipalIdentityFormDto.owner3SSN,
            owner3Phone: businessPrincipalIdentityFormDto.owner3Phone,
            owner3Address: businessPrincipalIdentityFormDto.owner3Address,
            owner3City: businessPrincipalIdentityFormDto.owner3City,
            owner3State: businessPrincipalIdentityFormDto.owner3State,
            owner3ZipCode: businessPrincipalIdentityFormDto.owner3ZipCode,
            owner3ProfessionalTitle:
              businessPrincipalIdentityFormDto.owner3ProfessionalTitle,
            owner3AnnualIncome:
              businessPrincipalIdentityFormDto.owner3AnnualIncome,
            owner3Percentage: businessPrincipalIdentityFormDto.owner3Percentage,
          },
        );
      }

      const user: any = await this.loanRepository.find({
        select: ['user_id'],
        where: { id: businessPrincipalIdentityFormDto.loanId },
      });

      await this.logsService.log(
        businessPrincipalIdentityFormDto.loanId,
        user[0].user_id,
        'Business principal details Submitted IP:' + ip,
      );

      const message = [];
      const ownerAge = this.getOwnerAge(
        businessPrincipalIdentityFormDto.ownerDOB,
      );
      // ownerAge === false
      //   ? message.push(
      //       `ORKA offers loans to borrowers who are 18 years of age or older. .
      //       Please contact your solar sales rep to discuss other financing options
      //       for this project and/or consider reapplying once you have met this requirement.
      //        We hope that you will keep us in mind for future financing needs.`,
      //     )
      //   : null;

      ownerAge === false
        ? message.push(
            `ORKA offers loans to borrowers who are 18 years of age or older.
             Please contact your solar sales rep to discuss other financing options for 
             this project and/or consider reapplying once you have met this requirement.
              We hope that you will keep us in mind for future financing needs.`,
          )
        : null;

      if (ownerAge === false) {
        //mark application as denied
        await entityManager.query(
          `update tblloan set status_flag='canceled'::tblloan_status_flag_enum  where id='${businessPrincipalIdentityFormDto.loanId}'`,
        );

        message.forEach(async msg => {
          await this.logsService.log(
            businessPrincipalIdentityFormDto.loanId,
            user[0].user_id,
            msg + ip,
          );
        });
        return { statusCode: 201, message: message };
      }
      return {
        statusCode: 200,
        message: ['Changes Saved'],
      };
    } catch (error) {
      console.log(error);

      let resp = new InternalServerErrorException(error).getResponse();
      if (Object.keys(resp).includes('name'))
        resp = Object.values(resp)[Object.keys(resp).indexOf('name')];
      return {
        statusCode: 500,
        message: ['Invalid ID'],
        error: 'Invalid ID',
      };
    }
  }

  getOwnerAge(ownerDOB) {
    const currDate = new Date();
    const ownerDateOfBirth = new Date(ownerDOB);
    const time_difference = currDate.getTime() - ownerDateOfBirth.getTime();
    const days_difference = Math.round(time_difference / (1000 * 60 * 60 * 24));
    return days_difference > 6570 ? true : false;
  }
}
