import { StartApplicationFormDto } from './dto/start-application-form.dto';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MailService } from '../../mail/mail.service';
import { LogsService } from '../../common/logs/logs.service';
import * as bcrypt from 'bcrypt';
import { Flags } from 'src/configs/config.enum';
//Entities
import { CustomerEntity } from '../../entities/customer.entity';
import { UserEntity } from '../../entities/users.entity';
import { Loan } from '../../entities/loan.entity';
import { LogEntity } from 'src/entities/log.entity';
//Repositories
import { CustomerRepository } from '../../repository/customer.repository';
import { UserRepository } from '../../repository/users.repository';
import { LoanRepository } from '../../repository/loan.repository';
import { LogRepository } from 'src/repository/log.repository';
import { getManager, Repository } from 'typeorm';
import { idText } from 'typescript';
import { Installer } from '../../entities/installer.entity';
@Injectable()
export class StartService {
  constructor(
    @InjectRepository(UserRepository)
    private readonly userRepository: UserRepository,
    @InjectRepository(CustomerRepository)
    private readonly customerRepository: CustomerRepository,
    @InjectRepository(LoanRepository)
    private readonly loanRepository: LoanRepository,
    @InjectRepository(Installer)
    private readonly installerRepository: Repository<Installer>,
    private readonly mailService: MailService,
    private readonly logService: LogsService,
  ) {}
  async getClients() {
    try {
      const entityManager = getManager();
      const data = await entityManager.query(`select * from tblcustomer`);
      return { statusCode: 200, data };
    } catch (error) {
      console.log(error);
      return { error: error };
    }
  }

  //create opportunity
  async createOpportunity(
    startApplicationFormDto: StartApplicationFormDto,
    ip: string,
  ) {
    //if user already exists we will not add again
    try {
      const businessData: any = await this.customerRepository.find({
        select: ['id', 'loanId', 'email', 'legalName'],
        where: { email: startApplicationFormDto.businessEmail },
      });
      if (businessData.length === 0) {
        //store the customer details
        const business = new CustomerEntity();
        business.email = startApplicationFormDto.businessEmail;
        business.ownerFirstName = startApplicationFormDto.applicantFirstName;
        business.ownerLastName = startApplicationFormDto.applicantLastName;
        business.ownerEmail = startApplicationFormDto.businessEmail;
        business.legalName = startApplicationFormDto.businessLegalName;
        business.businessPhone = startApplicationFormDto.businessPhone;
        business.businessAddress = startApplicationFormDto.businessAddress;
        business.city = startApplicationFormDto.businessCity;
        business.state = startApplicationFormDto.businessState;
        business.zipCode = startApplicationFormDto.businessZip;
        const data = await this.customerRepository.save(business);

        //create a new user in tbluser

        const user = new UserEntity();
        user.email = startApplicationFormDto.businessEmail;
        user.firstName = startApplicationFormDto.applicantFirstName;
        user.lastName = startApplicationFormDto.applicantLastName;
        user.emailVerify = Flags.N;
        //fetching role id
        const entityManager = getManager();
        const role = await entityManager.query(
          `select id from tblroles where "name" = 'customer' order by id asc limit 1`,
        );
        user.role = role[0].id;

        //creating password
        // var length = 8,
        //charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
        const password = 'welcome';
        // for (var i = 0, n = charset.length; i < length; ++i) {
        //     password += charset.charAt(Math.floor(Math.random() * n));
        // }

        //creating salt and hashing the pwd
        user.salt = await bcrypt.genSalt();
        user.password = await bcrypt.hash(password, user.salt);
        user.active_flag = Flags.Y;

        const tbluserdata = await this.userRepository.save(user);

        //get salesRep Name
        const salesRepData = await entityManager.query(
          `select "firstName","mainInstallerId" from tbluser where id='${startApplicationFormDto.installerId}'`,
        );
        //update the user id/cusId to loan table and setting to default values
        const loan = new Loan();
        loan.user_id = tbluserdata.id;
        loan.salesRepId = startApplicationFormDto.installerId;
        loan.insUserId =
          salesRepData[0]['mainInstallerId'] != null
            ? salesRepData[0]['mainInstallerId']
            : startApplicationFormDto.installerId;
        loan.salesRep = salesRepData[0]['firstName'];
        const loandata = await this.loanRepository.save(loan);

        //update the generated id in tblloan in tblcustomer->loanId column
        await this.customerRepository.update(
          { id: data.id },
          { loanId: loandata.id },
        );

        //Updating logs by calling logsService
        const message = 'Client Opportunity Mail Sent IP:' + ip;
        this.logService.log(loandata.id, tbluserdata.id, message);

        //Mail will be triggered seperately.
        // const url = `${process.env.OrkaUrl}/sales/welcome?id=${loandata.id}`;
        // await this.mailService.opportunityEmail(
        //   startApplicationFormDto.businessEmail,
        //   startApplicationFormDto.businessLegalName,
        //   url,
        // );
        return {
          id: data.id,
          loanId: loandata.id,
          statusCode: 200,
          mesage: [`Client Opportunity Created!`],
        };
      } else {
        //send an new loan opportunity for existing mailID
        //creating another opportunity
        return {
          message: ['Client Opportunity Already Exists'],
        };
      }
    } catch (error) {
      console.log(error);
      return {
        message: [error],
      };
    }
  }

  async getClientData(loanId: string) {
    try {
      const businessData: any = await this.customerRepository.find({
        select: [
          'id',
          'loanId',
          'email',
          'legalName',
          'ownerFirstName',
          'businessPhone',
          'businessAddress',
          'pgno',
        ],
        where: { loanId: loanId },
      });
      if (businessData.length !== 0)
        return { statusCode: 200, businessData: businessData[0] };
      else return { message: ['Provide Valid Id'] };
    } catch (error) {
      let resp = new InternalServerErrorException(error).getResponse();
      if (Object.keys(resp).includes('name'))
        resp = Object.values(resp)[Object.keys(resp).indexOf('name')];
      return {
        statusCode: 500,
        message: ['Invalid Link or Link Expired'],
        error: 'Invalid ID',
      };
    }
  }

  async putClientData(
    startApplicationFormDto: StartApplicationFormDto,
    ip: string,
  ) {
    try {
      const businessData: any = await this.customerRepository.update(
        { loanId: startApplicationFormDto.loanId },
        {
          email: startApplicationFormDto.businessEmail,
          ownerEmail: startApplicationFormDto.businessEmail,
          legalName: startApplicationFormDto.businessLegalName,
          pgno: 1,
        },
      );
      const loan: Partial<Loan> = await this.loanRepository.findOne({
        where: {
          id: startApplicationFormDto.loanId,
        },
      });

      await this.userRepository.update(
        { id: loan.user_id },
        { email: startApplicationFormDto.businessEmail },
      );
      await this.logService.log(
        startApplicationFormDto.loanId,
        loan.user_id,
        `Welcome page details submitted IP: ${ip}`,
      );

      if (businessData.affected !== 0) {
        return { statusCode: 200, message: ['Changes Saved'] };
      }
    } catch (error) {
      console.log(error);

      let resp = new InternalServerErrorException(error).getResponse();

      if (Object.keys(resp).includes('name')) {
        resp = Object.values(resp)[Object.keys(resp).indexOf('name')];
      }

      return {
        statusCode: 500,
        message: ['Invalid Link or Link Expired'],
        error: 'Invalid ID',
      };
    }
  }

  async resendMail(loanId: string) {
    const loan = await this.loanRepository.findOne({ id: loanId });
    const customer = await this.customerRepository.findOne({ loanId });
    const installer = await this.installerRepository.findOne({ user_id: loan.insUserId });

    try {
      const url = `${process.env.OrkaUrl}/sales/welcome?id=${loanId}`;
      await this.mailService.opportunityEmail(
        customer.email,
        customer.legalName,
        installer.businessName,
        url
      );

      return {
        id: loanId,
        statusCode: 200,
        mesage: [`Client Opportunity Mail sent`],
      };
    } catch (error) {
      let resp = new InternalServerErrorException(error).getResponse();

      if (Object.keys(resp).includes('name')) {
        resp = Object.values(resp)[Object.keys(resp).indexOf('name')];
      }

      return {
        statusCode: 500,
        message: ['Invalid Link or Link Expired'],
        error: 'Invalid ID',
      };
    }
  }
}
