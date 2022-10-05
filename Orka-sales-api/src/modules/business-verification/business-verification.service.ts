import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { BusinessVerificationFormDto } from './dto/business-verification.dto';
import { Flags } from 'src/configs/config.enum';
//entities
import { LogEntity } from '../../entities/log.entity';
import { getManager } from 'typeorm';
import { FilesEntity } from 'src/entities/files.entity';
//Repositories for
import { InjectRepository } from '@nestjs/typeorm';
import { CustomerRepository } from '../../repository/customer.repository';
import { FilesRepository } from '../../repository/files.repository';
import { LoanRepository } from 'src/repository/loan.repository';
import { LogRepository } from 'src/repository/log.repository';
import { UserRepository } from 'src/repository/users.repository';
import { LogsService } from 'src/common/logs/logs.service';

@Injectable()
export class BusinessVerificationService {
  constructor(
    @InjectRepository(CustomerRepository)
    private readonly customerRepository: CustomerRepository,
    @InjectRepository(FilesRepository)
    private readonly filesRepository: FilesRepository,
    @InjectRepository(LoanRepository)
    private readonly loanRepository: LoanRepository,
    @InjectRepository(UserRepository)
    private readonly userRepository: UserRepository,

    private readonly logService: LogsService,
  ) {}

  async getDetails(loanId: string) {
    try {
      const details = await this.customerRepository.find({
        select: [
          'id',
          'loanId',
          'taxId',
          'businessIndustry',
          'businessBipocowned',
          'startDate',
          'empContractCount',
          'businessPhone',
          'legalName',
          'businessAddress',
          'city',
          'state',
          'zipCode',
          // 'yearOfOwnership',
          'businessStructure',
          'lastYearRevenue',
          'taxExempt',
          'taxExemptNumber',
        ],
        where: { loanId: loanId },
      });

      const certifyuseloandetails = await this.loanRepository.find({
        select: ['id', 'certifyUseofLoan'],
        where: { id: loanId },
      });
      return {
        statusCode: 200,
        businessData: details[0],
        certifyuseofloan: certifyuseloandetails,
      };
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

  async getFilesDetails(id: string) {
    const entityManager = getManager();
    try {
      const data = await entityManager.query(
        `select originalname,filename,services from tblfiles where link_id = '${id}' and delete_flag='N' and services in ('businessVerification/upload','businessVerification/taxreturn/upload')`,
      );
      return { statusCode: 200, data: data };
    } catch (err) {
      console.log(err);
      return {
        statusCode: 500,
        message: [new InternalServerErrorException(err)['response']['name']],
        error: 'Bad Request',
      };
    }
  }

  async deleteFiles(filename: string) {
    const entityManager = getManager();
    try {
      const data = await entityManager.query(
        `update tblfiles set delete_flag ='Y' where filename ='Development/orka/${filename}'`,
      );
      return { statusCode: 200, data: data };
    } catch (err) {
      console.log(err);
      return {
        statusCode: 500,
        message: [new InternalServerErrorException(err)['response']['name']],
        error: 'Bad Request',
      };
    }
  }

  async verificationDetails(
    businessVerificationFormDto: BusinessVerificationFormDto,
    ip: string,
  ) {
    const entityManager = getManager();
    const a = businessVerificationFormDto.taxExempt == 'Y' ? Flags.Y : Flags.N;
    const data: any = await this.customerRepository.find({
      select: ['id', 'loanId'],
      where: { loanId: businessVerificationFormDto.loanId },
    });
    try {
      const details = await this.customerRepository.update(
        { loanId: businessVerificationFormDto.loanId },
        {
          taxId: businessVerificationFormDto.taxId,
          businessIndustry: businessVerificationFormDto.businessIndustry,
          businessBipocowned: businessVerificationFormDto.businessBipocowned,
          startDate: businessVerificationFormDto.startDate,
          empContractCount: businessVerificationFormDto.empContractCount,
          businessPhone: businessVerificationFormDto.businessPhone,
          // applicantLegalName: businessVerificationFormDto.applicantLegalName,
          businessAddress: businessVerificationFormDto.businessAddress,
          city: businessVerificationFormDto.city,
          state: businessVerificationFormDto.state,
          zipCode: businessVerificationFormDto.zipCode,
          // yearOfOwnership: businessVerificationFormDto.yearOfOwnership,
          businessStructure: businessVerificationFormDto.businessStructure,
          lastYearRevenue: businessVerificationFormDto.lastYearRevenue,
          taxExempt: a,
          taxExemptNumber: businessVerificationFormDto.taxExemptNumber,
          pgno: 2,
        },
      );

      const certifyuseofloan = await this.loanRepository.update(
        { id: businessVerificationFormDto.loanId },
        {
          certifyUseofLoan: businessVerificationFormDto.certifyuseofloan,
        },
      );

      const user: any = await this.loanRepository.find({
        select: ['user_id'],
        where: { id: businessVerificationFormDto.loanId },
      });

      await this.logService.log(
        data[0].loanId,
        user[0].user_id,
        'Business details without tax exempt certificate submitted IP:' + ip,
      );

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

  async save(
    files,
    businessVerificationFormDto: BusinessVerificationFormDto,
    ip: string,
  ) {
    const entityManager = getManager();
    const data: any = await this.customerRepository.find({
      select: ['id', 'loanId'],
      where: { loanId: businessVerificationFormDto.loanId },
    });
    const filedata = files.map((i, index) => {
      const file: FilesEntity = new FilesEntity();
      file.originalname = i.originalname;
      file.filename = i.filename;
      //file.services = 'businessVerification/upload';
      file.services = Array.isArray(businessVerificationFormDto.services)
        ? businessVerificationFormDto.services[index]
        : businessVerificationFormDto.services;
      file.linkId = data[0].loanId;
      //console.log('file*******',i)
      return file;
    });
    try {
      await this.filesRepository.save(filedata);
      const user: any = await this.loanRepository.find({
        select: ['user_id'],
        where: { id: businessVerificationFormDto.loanId },
      });
      await this.logService.log(
        data[0].loanId,
        user[0].user_id,
        'Business details and tax exempt certificate submitted IP:' + ip,
      );

      // await this.loanRepository.update({id: certificateOfGoodStandingDto.loanId}, {activeFlag: Flags.Y});
      const a =
        businessVerificationFormDto.taxExempt == 'Y' ? Flags.Y : Flags.N;
      const details = await this.customerRepository.update(
        { loanId: businessVerificationFormDto.loanId },
        {
          taxId: businessVerificationFormDto.taxId,
          businessIndustry: businessVerificationFormDto.businessIndustry,
          businessBipocowned: businessVerificationFormDto.businessBipocowned,
          startDate: businessVerificationFormDto.startDate,
          empContractCount: businessVerificationFormDto.empContractCount,
          businessPhone: businessVerificationFormDto.businessPhone,
          // applicantLegalName: businessVerificationFormDto.applicantLegalName,
          businessAddress: businessVerificationFormDto.businessAddress,
          city: businessVerificationFormDto.city,
          state: businessVerificationFormDto.state,
          zipCode: businessVerificationFormDto.zipCode,
          // yearOfOwnership: businessVerificationFormDto.yearOfOwnership,
          businessStructure: businessVerificationFormDto.businessStructure,
          lastYearRevenue: businessVerificationFormDto.lastYearRevenue,
          taxExempt: a,
          taxExemptNumber: businessVerificationFormDto.taxExemptNumber,
          pgno: 2,
        },
      );

      const certifyuseofloan = await this.loanRepository.update(
        { id: businessVerificationFormDto.loanId },
        {
          certifyUseofLoan: businessVerificationFormDto.certifyuseofloan,
        },
      );

      const message = [];
      const businessDuration = this.getBusinessStartDuration(
        businessVerificationFormDto.startDate,
      );
      businessDuration === false
        ? message.push(`ORKA currently only offers solar loans to companies who have been in business for 3 years or longer. Please contact your solar rep to discuss other financing options for this project and/or consider reapplying once you have met this requirement. We hope that you will keep us in mind for future financing needs.
      `)
        : null;

      const restrictedIndustry = this.getRestrictedIndustry(
        businessVerificationFormDto.businessIndustry,
      );
      restrictedIndustry === false
        ? message.push(`Unfortunately, ORKA will be unable to finance your project at this time as we are unable to lend to clients in your industry. Please contact your solar sales rep to discuss other financing options.
      `)
        : null;

      if (businessDuration === false || restrictedIndustry === false) {
        //mark application as denied
        await entityManager.query(
          `update tblloan set status_flag='canceled'::tblloan_status_flag_enum  where id='${businessVerificationFormDto.loanId}'`,
        );

        message.forEach(async msg => {
          await this.logService.log(data[0].loanId, user[0].user_id, msg + ip);
        });
        return { statusCode: 201, message: message };
      }
      return { statusCode: 200, id: data[0].id, loanId: data[0].loanId };
    } catch (error) {
      let resp = new InternalServerErrorException(error).getResponse();
      if (Object.keys(resp).includes('name'))
        resp = Object.values(resp)[Object.keys(resp).indexOf('name')];
      return {
        statusCode: 500,
        message: [resp],
        error: 'Bad Request',
      };
    }
  }

  getBusinessStartDuration(startDate) {
    const currDate = new Date();
    const businessStartDate = new Date(startDate);
    const time_difference = currDate.getTime() - businessStartDate.getTime();
    const days_difference = Math.round(time_difference / (1000 * 60 * 60 * 24));
    return days_difference > 1095 ? true : false;
  }

  getRestrictedIndustry(businessIndustry) {
    const restrictedIndustryArray = [
      'Adult Entertainment / Materials',
      'Cannabis',
      'Casino / Lottery / Raffles',
      'Firearms',
      'Farming & Agriculture',
      'Horoscope / Fortune Telling',
      'Money Services Business (MSB)',
      'Rooming & Boarding House',
    ];

    const industryResult = restrictedIndustryArray.includes(businessIndustry);
    return industryResult ? false : true;
  }
}
