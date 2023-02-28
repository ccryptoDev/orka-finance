import { Injectable,InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { getManager } from 'typeorm';
import { config } from 'dotenv';
import * as bcrypt from 'bcrypt';

import { manualBankAddDto } from './dto/manual-bank-add.dto';
import { UserBankAccount } from '../../entities/userBankAccount.entity';
import { UserBankAccountRepository } from '../../repository/userBankAccounts.repository';
import { UserRepository } from '../../repository/users.repository';
import { LoanRepository } from '../../repository/loan.repository';
import { MailService } from '../../mail/mail.service';
import { addcommentsDto } from './dto/add-comments.dto';
import { CommentsRepository} from '../../repository/comments.repository';
import { Comments } from '../../entities/comments.entity';
import { Logs } from './dto/logs.dto';
import { LogEntity } from '../../entities/log.entity';
import { LogRepository} from '../../repository/log.repository';
import { LoanDetails } from './dto/loanDetails.dto';
import { CreditReportService } from '../credit-report/credit-report.service';

config();

//commit changes
@Injectable()
export class PendingService {
  constructor(
    @InjectRepository(UserBankAccountRepository) private readonly userBankAccountRepository:UserBankAccountRepository,
    @InjectRepository(UserRepository) private readonly userRepository: UserRepository,
    @InjectRepository(CommentsRepository) private readonly commentsRepository: CommentsRepository,
    @InjectRepository(LogRepository) private readonly logRepository: LogRepository,
    @InjectRepository(LoanRepository) private readonly loanRepository:LoanRepository,
    private readonly mailService: MailService,
    private readonly creditReportService: CreditReportService
  ) {}

  async get() {
      const entityManager = getManager();
      try{
          const rawData = await entityManager.query(`select t.id as loan_id, t.user_id as user_id, t.ref_no as loan_ref, t2.email as email,
          t2.ref_no as user_ref, t2."firstName" as firstName, t2."lastName" as lastName,t3."legalName" as businessName
          from tblloan t 
          join tbluser t2 on t2.id = t.user_id
          join tblcustomer t3 on t3."loanId" =t.id 
          where t.delete_flag = 'N' 
          and t.active_flag = 'Y' and t.status_flag = 'waiting' order by t."createdAt" desc`);
          //console.log(rawData)
          return {"statusCode": 200, data:rawData };
      }catch (error) {
          return {"statusCode": 500, "message": [new InternalServerErrorException(error)['response']['name']], "error": "Bad Request"};
      }

  }

  async getdetails(id: string){
    const entityManager = getManager();

    try{
      const rawData = await entityManager.query(
        `
          select
            count(*) as count
          from
            tblloan
          where
            delete_flag = 'N' and active_flag = 'Y' and status_flag = 'waiting' and id = $1
        `,
        [id]
      );

      if (rawData[0]['count'] > 0) {
        let data = { 'CoApplicant': [] };

        data['answers'] = await entityManager.query(`
          select
            t.answer as answer,
            t2.question as question
          from
            tblanswer t
          join
            tblquestion t2 on t2.id = t.question_id
          where
            loan_id = $1
          `,
          [id]
        );
        data['from_details'] = await entityManager.query(
          `
            select
              t.id as loan_id,
              t.user_id as user_id,
              t.ref_no as loan_ref,
              t2.email as email,
              t2.ref_no as user_ref,
              t2."firstName" as firstName,
              t2."lastName" as lastName,
              t3."legalName" as businessName,
              t3.*
            from
              tblloan t 
            join
              tbluser t2 on t2.id = t.user_id
            join
              tblcustomer t3 on t3."loanId" = t.id
            where
              t.id = $1 and t.delete_flag = 'N' and t.active_flag = 'Y' and t.status_flag = 'waiting'
            order by
              t."createdAt"
            desc
          `,
          [id]
        );
        data['files'] = await entityManager.query(
          `
            select
              originalname,
              filename
            from
              tblfiles
            where
              link_id = $1 and delete_flag = 'N'
          `,
          [id]
        );
        data['paymentScheduleDetails'] = await entityManager.query(
          `
            select
              *
            from
              tblpaymentschedule
            where
              loan_id = $1
            order by
              "scheduleDate"
            asc
          `,
          [id]
        );
        data["userConsentDoc"] = await entityManager.query(
          `
            select
              ucon.id,
              ucon."loanId",
              ucon."filePath",
              ucon."fileKey",
              conm.name
            from
              tbluserconsent ucon
            join
              tblconsentmaster conm on conm."fileKey" = ucon."fileKey"
            where
              "loanId" = $1
          `,
          [id]
        );
        data["loanDetails"] = await entityManager.query(
          `
            select
              t."financingRequested",
              t."financingTermRequested",
              t."status_flag",
              t.apr,
              t2."interestBaseRate", 
              t."originationFee",
              t."paymentAmount",
              t2.*
            from
              tblloan t 
            left join
              tblproduct t2 on CAST(t2."productId" as varchar) = t."productId" 
            where
              t.id = $1
            and 
              t.delete_flag = 'N'
          `,
          [id]
        );
        data['equifaxReport'] = await this.creditReportService.getByLoanId(id);
        
        return {"statusCode": 200, data:data };
      } else {
        return {
          "statusCode": 500,
          "message": ['This Loan Id Not Exists'],
          "error": "Bad Request"
        };
      }
    } catch (error) {
      console.log(error);

      return {
        "statusCode": 500,
        "message": [new InternalServerErrorException(error)['response']['name']],
        "error": "Bad Request"
      };
    }
  }

  async setdenied(id) {
    const entityManager = getManager();
    
    try {
      const [loanData] = await entityManager.query(
        `
          select
            t2."legalName" as "customerName",
            t2.email as "customerEmail",
            t3."businessName" as "partnerName",
            t4."firstName" as "salesRepFirstName",
            t4.email as "salesRepEmail"
          from
            tblloan t
          join
            tblcustomer t2 on t.id = t2."loanId"
          join
            tblinstaller t3 on t.ins_user_id = t3.user_id
          join
            tbluser t4 on t."salesRepId" = t4.id
          where
            t.id = $1 and t.delete_flag = 'N' and t.active_flag = 'Y' and t.status_flag = 'waiting';
        `,
        [id]
      );

      if (loanData) {
        await entityManager.query(
          `
            UPDATE
              tblloan
            SET
              status_flag = 'canceled'::tblloan_status_flag_enum::tblloan_status_flag_enum,
              approval_denial_date = now()
            WHERE
              id = $1
          `,
          [id]
        );

        const data = {
          'partnerName': loanData['partneName'],
          'partnerSalesName': loanData['salesRepFirstName'],
          'businessName': loanData['customerName'],
        };

        this.mailService.recreditdecisiongenericEmail(loanData['salesRepEmail'], data);
        this.mailService.creditOutcomeStandardEmail(loanData['customerEmail']);

        return {"statusCode": 200 };
      } else {
        return {
          "statusCode": 500,
          "message": ['This loan does not Exist'],
          "error": "Bad Request"
        };
      }
    } catch (error) {
      return {
        "statusCode": 500,
        "message": [new InternalServerErrorException(error)['response']['name']],
        "error": "Bad Request"
      };
    }
  }

  async setapproved(id) {
    const entityManager = getManager();

    try {
      const [loanData] = await entityManager.query(
        `
          select
            t2."legalName" as "customerName",
            t2.email as "customerEmail",
            t2."ownerFirstName",
            t3."businessName" as "partnerName",
            t4."firstName" as "salesRepFirstName",
            t4.email as "salesRepEmail"
          from
            tblloan t
          join
            tblcustomer t2 on t.id = t2."loanId"
          join
            tblinstaller t3 on t.ins_user_id = t3.user_id
          join
            tbluser t4 on t."salesRepId" = t4.id
          where
            t.id = $1 and t.delete_flag = 'N' and t.active_flag = 'Y' and t.status_flag = 'waiting';
        `,
        [id]
      );

      if (loanData) {
        await entityManager.query(
          `
            UPDATE
              tblloan
            SET
              status_flag = 'approved'::tblloan_status_flag_enum::tblloan_status_flag_enum,
              phase_flag = 'Project Setup'::tblloan_phase_flag_enum::tblloan_phase_flag_enum,
              approval_denial_date = now()
            WHERE
              id = $1
          `,
          [id]
        );

        const data = {
          'partnerName': loanData['partnerName'],
          'partnerSalesName': loanData['salesRepFirstName'],
          'businessName': loanData['customerName'],
        };

        this.mailService.recreditdecisiongenericEmail(loanData['salesRepEmail'], data);
        this.mailService.creditOutcomeEmail(loanData['customerEmail'], loanData['partnerName'], loanData['ownerFirstName']);

        return {"statusCode": 200 };
      } else {
        return {
          "statusCode": 500,
          "message": ['This loan does not Exist'],
          "error": "Bad Request"
        };
      }
    } catch (error) {
      console.log(error);

      return {
        "statusCode": 500,
        "message": [new InternalServerErrorException(error)['response']['name']],
        "error": "Bad Request"
      };
    }
  }

  async invite(id){
      let url:any = process.env.OrkaUrl
      var length = 8,
      charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
      password = "";
  for (var i = 0, n = charset.length; i < length; ++i) {
      password += charset.charAt(Math.floor(Math.random() * n));
  }
  const salt = await bcrypt.genSalt();
  let hashPassword:any = await bcrypt.hash(password, salt);



  try{
      let user:any = await this.userRepository.find( {select:["email","salt","emailVerify"], where:{id:id, role:2}});
      if(user.length>0){
          if(user[0]['emailVerify']=='N'){
              url=url+"borrower/verify/"+id+"/"+salt
              await this.userRepository.update({id: id}, { salt: salt, password:hashPassword });
          }else{
              password = "Password already sent your mail"
              url=url+"borrower/verify/"+id+"/"+user[0]['salt']
          }
          this.mailService.inviteEmail(user[0]['email'],password,url)
          return {"statusCode": 200 };
      }else{
          return {"statusCode": 500, "message": ['This User Id Not Exists'], "error": "Bad Request"};
      }

      //await this.userRepository.update({id: id}, { salt: salt, password:hashPassword });
  } catch (error) {
    return {"statusCode": 500, "message": [new InternalServerErrorException(error)['response']['name']], "error": "Bad Request"};
  }

  }

  async manualBankAdd(manualBankAddDto:manualBankAddDto) {
      try{
          let userBankAccount =  new UserBankAccount();
          userBankAccount.bankName = manualBankAddDto.bankName;
          userBankAccount.holderName = manualBankAddDto.holderName;
          userBankAccount.routingNumber = manualBankAddDto.routingNumber;
          userBankAccount.accountNumber = manualBankAddDto.accountNumber;
          userBankAccount.user_id = manualBankAddDto.user_id;


          await this.userBankAccountRepository.save(userBankAccount)
          return {"statusCode": 200}
      }catch(error){
          return {"statusCode": 500, "message": [new InternalServerErrorException(error)['response']['name']], "error": "Bad Request"};
      }
  }

  async addcomments(addcommentsDto:addcommentsDto) {
      try{
          let comment =  new Comments();
          comment.subject = addcommentsDto.subject;
          comment.comments = addcommentsDto.comments;
          comment.loan_id = addcommentsDto.loan_id;
          comment.user_id = addcommentsDto.user_id;
          await this.commentsRepository.save(comment)
          return {"statusCode": 200}
      }catch(error){
          return {"statusCode": 500, "message": [new InternalServerErrorException(error)['response']['name']], "error": "Bad Request"};
      }

  }

  async getcomments(id) {
      const entityManager = getManager();
      try{
          const rawData = await entityManager.query(`select t.subject, t."comments" ,t2."role" , t2."firstName" , t2."lastName" ,t."createdAt" from tblcomments t join tbluser t2 on t2.id=t.user_id where t.loan_id = '${id}' order by t."createdAt" desc`);


          //console.log(rawData)
              return {"statusCode": 200,"data":rawData };

      }catch (error) {
          return {"statusCode": 500, "message": [new InternalServerErrorException(error)['response']['name']], "error": "Bad Request"};
      }
  }

  async logs(logs: Logs) {
      let log = new LogEntity();
      log.module = logs.module;
      log.user_id = logs.user_id;
      log.loan_id = logs.loan_id;
      try{
          this.logRepository.save(log)
          return {"statusCode": 200};
      }catch (error) {
          return {"statusCode": 500, "message": [new InternalServerErrorException(error)['response']['name']], "error": "Bad Request"};
      }
  }

  async addLoanDetails(id, loanDetailsDto: LoanDetails) {
      try{

          await this.loanRepository.update({id:id},{
              financingRequested:loanDetailsDto.financingRequested,
              financingTermRequested:loanDetailsDto.financingTermRequested,
              apr:loanDetailsDto.apr,
              originationFee:loanDetailsDto.originationFee,
              paymentAmount:loanDetailsDto.paymentAmount,
              interestRate:loanDetailsDto.interestRate
          })
          return {"statusCode": 200,message:['Loan Details Saved Successfully!']};
      }catch (error) {
          return {"statusCode": 500, "message": [new InternalServerErrorException(error)['response']['name']], "error": "Bad Request"};
      }
  }
}
