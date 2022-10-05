import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { BuildingInformationFormDto } from './dto/building-information-form.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Flags } from 'src/configs/config.enum';
//entities
import { LogEntity } from 'src/entities/log.entity';
//repositories
import { LogRepository } from 'src/repository/log.repository';
import { LoanRepository } from 'src/repository/loan.repository';
import { CustomerRepository } from '../../repository/customer.repository';
import { getManager } from 'typeorm';
import { LogsService } from 'src/common/logs/logs.service';
import { HttpService } from '@nestjs/axios';
import { MailService } from '../../mail/mail.service';

@Injectable()
export class BuildingInformationService {
  constructor(
    @InjectRepository(CustomerRepository)
    private readonly customerRepository: CustomerRepository,
    private readonly logRepository: LogRepository,
    private readonly loanRepository: LoanRepository,
    private readonly logsService: LogsService,
    private httpService: HttpService,
    private readonly mailService: MailService,
  ) {}

  async getBuildingInfo(loanId: string) {
    try {
      const buildingInfo: any = await this.customerRepository.find({
        select: [
          'id',
          'loanId',
          'businessAddressFlag',
          'businessInstallAddress',
          'businessInstallCity',
          'businessInstallState',
          'businessInstallZipCode',
          'estimatedPropertyValue',
          'yearsPropertyOwned',
          'ownershipType',
          'mortageStartDate',
          'mortageTerm',
          'monthlyMortagePayment',
        ],
        where: { loanId: loanId },
      });
      return { statusCode: 200, businessData: buildingInfo[0] };
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
  //adding all details to DB
  async buildingInfo(
    buildingInformationFormDto: BuildingInformationFormDto,
    ip,
  ) {
    const a: any =
      buildingInformationFormDto.businessAddressFlag == 'Y' ? Flags.Y : Flags.N; //setting the enum
    try {
      const buildingInfo: any = await this.customerRepository.update(
        { loanId: buildingInformationFormDto.loanId },
        {
          businessInstallAddress:
            buildingInformationFormDto.businessInstallAddress,
          businessInstallCity: buildingInformationFormDto.businessInstallCity,
          businessInstallState: buildingInformationFormDto.businessInstallState,
          businessInstallZipCode:
            buildingInformationFormDto.businessInstallZipCode,
          estimatedPropertyValue:
            buildingInformationFormDto.estimatedPropertyValue,
          yearsPropertyOwned: buildingInformationFormDto.yearsPropertyOwned,
          ownershipType: buildingInformationFormDto.ownershipType,
          mortageStartDate: buildingInformationFormDto.mortageStartDate,
          mortageTerm: buildingInformationFormDto.mortageTerm,
          monthlyMortagePayment:
            buildingInformationFormDto.monthlyMortagePayment,
          businessAddressFlag: a,
          pgno: 4,
          businessInstallLat: buildingInformationFormDto.lat,
          businessInstallLng: buildingInformationFormDto.lng,
        },
      );
      if (buildingInformationFormDto.businessAddressFlag == 'Y') {
        //incase if the install address is same as businessAddress
        const address: any = await this.customerRepository.find({
          select: ['businessAddress'],
          where: { loanId: buildingInformationFormDto.loanId },
        });

        //adding business Address to install address
        await this.customerRepository.update(
          { loanId: buildingInformationFormDto.loanId },
          {
            businessInstallAddress: address[0].businessAddress,
          },
        );
      }

      //Updating the Application from Incomplete to Pending. Changing the phase from new to underwriting.
      const entityManager = getManager();
      const updateStatus: any = await entityManager.query(
        `update tblloan set active_flag='Y'::tblloan_active_flag_enum::tblloan_active_flag_enum, phase_flag ='Underwriting'::tblloan_phase_flag_enum::tblloan_phase_flag_enum where id='${buildingInformationFormDto.loanId}'`,
      );

      const data: any = await this.customerRepository.find({
        select: [
          'id',
          'loanId',
          'ownerDOB',
          'ownershipType',
          'businessIndustry',
          'startDate',
        ],
        where: { loanId: buildingInformationFormDto.loanId },
      });

      const user: any = await this.loanRepository.find({
        select: ['user_id'],
        where: { id: buildingInformationFormDto.loanId },
      });
      await this.logsService.log(
        buildingInformationFormDto.loanId,
        user[0].user_id,
        'Building Information submitted IP:' + ip,
      );

      // const res: any = await this.initialKnockOut(
      //   data[0].startDate,
      //   data[0].businessIndustry,
      //   data[0].ownerDOB,
      //   data[0].ownershipType,
      // );

      const message = [];
      const ownerShipType = this.getOwnershipType(
        buildingInformationFormDto.ownershipType,
      );
      ownerShipType === false
        ? message.push(
            `ORKA cannot finance projects on leased properties at the moment. We are hoping to offer this option in the future, and will keep you posted if this changes. In the meantime, please contact your solar sales rep to discuss other financing options.`,
          )
        : null;

      if (ownerShipType === false) {
        //mark application as denied
        const updateDenied: any = await entityManager.query(
          `update tblloan set status_flag='canceled'::tblloan_status_flag_enum  where id='${buildingInformationFormDto.loanId}'`,
        );

        message.forEach(async msg => {
          await this.logsService.log(
            buildingInformationFormDto.loanId,
            user[0].user_id,
            msg + ip,
          );
        });

        return {
          statusCode: 201,
          message: message,
        };
      }

      const sendDatamail = await entityManager.query(`select t3."legalName" as partnerName,t3."ownerFirstName" as applicantFname,t3.email from tblloan t 
            left join tbluser t2 on t2.id =t.user_id 
            left join tblcustomer t3 on t3."loanId" =t.id
            where t.id='${buildingInformationFormDto.loanId}'`);

      //PLAID Asset Pull.
      console.log(sendDatamail[0]['email']);
      // this.mailService.thankyouEmail(sendDatamail[0]['email'])
      // this.mailService.thankyouEmail(sendDatamail[0]['email'])

      return {
        statusCode: 200,
        message: ['Data Saved'],
        // data: res,
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

  getOwnershipType(ownershipType) {
    return ownershipType == 'Leased' ? false : true;
  }

  async initialKnockOut(startDate, businessIndustry, ownerDOB, ownershipType) {
    const res = [];
    const currDate = new Date();
    const businessStartDate = new Date(startDate);
    const ownerDateOfBirth = new Date(ownerDOB);

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

    const startDateResult = this.getBusinessStartDuration(
      currDate,
      businessStartDate,
    );
    const ownerAgeResult = this.getOwnerAge(currDate, ownerDateOfBirth);
    const industryResult = restrictedIndustryArray.includes(businessIndustry);

    //You've indicated that your business start is within the past 3 years. Unfortunately, ORKA will be unable to finance your project at this time. Please contact your solar sales rep to discuss alternative financing."
    startDateResult == false
      ? res.push(
          `You've indicated that your business start is within the past 3 years. Unfortunately, ORKA will be unable to finance your project at this time. Please contact your solar sales rep to discuss alternative financing.`,
        )
      : null;
    //You've indicated that you're under 18 years old. If this is correct, ORKA will be unable to finance your project. Please contact your solar sales rep to discuss alternative financing.
    ownerAgeResult == false
      ? res.push(
          `You've indicated that you're under 18 years old. If this is correct, ORKA will be unable to finance your project. Please contact your solar sales rep to discuss alternative financing.`,
        )
      : null;
    //You've indicated that the business is operating in ${businessIndustry}. Unfortunately, ORKA will be unable to finance your project at this time. Please contact your solar sales rep to discuss alternative financing.
    industryResult == true
      ? res.push(
          `You've indicated that the business is operating in ${businessIndustry}. Unfortunately, ORKA will be unable to finance your project at this time. Please contact your solar sales rep to discuss alternative financing.`,
        )
      : null;
    //You've indicated that the installation site is a leased property. For the moment, ORKA isn't able to finance projects on leased properties. Please contact your solar sales rep to discuss alternative financing.
    ownershipType == 'Leased'
      ? res.push(
          `You've indicated that the installation site is a leased property. For the moment, ORKA isn't able to finance projects on leased properties. Please contact your solar sales rep to discuss alternative financing.`,
        )
      : null;

    return res;
  }

  getBusinessStartDuration(currDate, businessStartDate) {
    const time_difference = currDate.getTime() - businessStartDate.getTime();
    const days_difference = Math.round(time_difference / (1000 * 60 * 60 * 24));
    return days_difference > 1095 ? true : false;
  }

  getOwnerAge(currDate, ownerDateOfBirth) {
    const time_difference = currDate.getTime() - ownerDateOfBirth.getTime();
    const days_difference = Math.round(time_difference / (1000 * 60 * 60 * 24));
    return days_difference > 6570 ? true : false;
  }
}
