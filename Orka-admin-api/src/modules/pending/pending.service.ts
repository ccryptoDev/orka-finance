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
import { LoanService } from '../loan/loan.service';

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
    private readonly creditReportService:LoanService
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

  async getdetails(id){
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

        const creditReports :any = await this.creditReportService.getReports(id);

        data['equifaxReport'] = creditReports.equifaxReport;

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
      try{
          const rawData = await entityManager.query(`select count(*) as count from tblloan where delete_flag = 'N' and active_flag = 'Y' and status_flag = 'waiting' and `+"id = '"+id+"'");
          const user_id = await entityManager.query(`select "user_id" as user_id from tblloan where delete_flag = 'N' and active_flag = 'Y' and status_flag = 'waiting' and `+"id = '"+id+"'");
          const sendDatamail =  await entityManager.query(`select t3."legalName" as partnerName,t3."ownerFirstName" as applicantFname,t3.email from tblloan t 
          left join tbluser t2 on t2.id =t.user_id 
          left join tblcustomer t3 on t3."loanId" =t.id
          where t.id='${id}'`)
          const sendInstallerData = await entityManager.query(`select t3."legalName",
          (select "firstName"  from tbluser where id=t.ins_user_id)
            as salesrepFname,(select email  from tbluser where id=t.ins_user_id) as sendemail from tblloan t 
          left join tbluser t2 on t2.id =t.user_id 
          left join tblcustomer t3 on t3."loanId" =t.id 
          where t.id='${id}'`)


          const sendDataMainInstaller =  await entityManager.query(`select t2."mainInstallerId" as partnerId  from tblloan t 
          left join tbluser t2 on t2.id =t.user_id 
          where t.id='${id}'`)

          if(sendDataMainInstaller[0]['partnerId']==null){
              const Partnername =  await entityManager.query(`select t2."firstName" as partnerName from tblloan t 
              left join tbluser t2 on t2.id =t.user_id 
              where t.id='${id}'`)

              //console.log('1---',Partnername)
              const data={
              'partnerName':Partnername[0]['partnername'],
              'partnerSalesName':sendInstallerData[0]['salesrepfname'],
              'businessName':sendInstallerData[0]['legalName'],
              }


              if(rawData[0]['count']>0 && user_id.length>0){

              this.mailService.recreditdecisiongenericEmail(sendInstallerData[0]['sendemail'],data)
              }

          }else{
              const Partnername =  await entityManager.query(`select t."firstName" as partnerName from tbluser
                t where t.id ='${sendDataMainInstaller[0]['partnerId']}'`)
                const data={
                  'partnerName':Partnername[0]['partnername'],
                  'partnerSalesName':sendInstallerData[0]['salesrepfname'],
                  'businessName':sendInstallerData[0]['legalName'],
                  }

                  //console.log('1---',Partnername)
                  if(rawData[0]['count']>0 && user_id.length>0){
                  this.mailService.recreditdecisiongenericEmail(sendInstallerData[0]['sendemail'],data)
                  }
          }

          if(rawData[0]['count']>0){
              await entityManager.query(`UPDATE tblloan
              SET status_flag='canceled'::tblloan_status_flag_enum::tblloan_status_flag_enum
              WHERE `+"id = '"+id+"'");
          //console.log(rawData)
          this.mailService.creditOutcomeStandardEmail(sendDatamail[0]['email'])
          //this.mailService.creditoutcomeInstalleremail(sendDataInstallermail[0]['installer'],'denied')
              return {"statusCode": 200 };
          }else{
              return {"statusCode": 500, "message": ['This Loan Id Not Exists'], "error": "Bad Request"};
          }
      }catch (error) {
          return {"statusCode": 500, "message": [new InternalServerErrorException(error)['response']['name']], "error": "Bad Request"};
      }
  }

  async setapproved(id) {
      const entityManager = getManager();
      try{
          const rawData = await entityManager.query(`select count(*) as count from tblloan where delete_flag = 'N' and active_flag = 'Y' and status_flag = 'waiting' and `+"id = '"+id+"'");
          const user_id = await entityManager.query(`select "user_id" as user_id from tblloan where delete_flag = 'N' and active_flag = 'Y' and status_flag = 'waiting' and `+"id = '"+id+"'");
          const sendDatamail =  await entityManager.query(`select t3."legalName" as partnerName,t3."ownerFirstName" as applicantFname,t3.email from tblloan t 
          left join tbluser t2 on t2.id =t.user_id 
          left join tblcustomer t3 on t3."loanId" =t.id
          where t.id='${id}'`)

          const sendInstallerData = await entityManager.query(`select t3."legalName",
          (select "firstName"  from tbluser where id=t.ins_user_id)
            as salesrepFname,(select email  from tbluser where id=t.ins_user_id) as sendemail from tblloan t 
          left join tbluser t2 on t2.id =t.user_id 
          left join tblcustomer t3 on t3."loanId" =t.id 
          where t.id='${id}'`)


          const sendDataMainInstaller =  await entityManager.query(`select t2."mainInstallerId" as partnerId  from tblloan t 
          left join tbluser t2 on t2.id =t.user_id 
          where t.id='${id}'`)

            if(sendDataMainInstaller[0]['partnerId']==null){
                const Partnername =  await entityManager.query(`SELECT t2."firstName" as partnerName, t2."businessName" FROM tblloan t 
                    left join tbluser t2 on t2.id =t.user_id 
                    where t.id='${id}'`
                )
                //console.log('1---',Partnername)
                sendDatamail[0]['partnerBusiness'] = Partnername[0]['businessName'];
                const data={
                'partnerName':Partnername[0]['partnername'],
                'partnerSalesName':sendInstallerData[0]['salesrepfname'],
                'businessName':sendInstallerData[0]['legalName'],
                }



                if(rawData[0]['count']>0 && user_id.length>0){

                this.mailService.recreditdecisiongenericEmail(sendInstallerData[0]['sendemail'],data)
                }
               
            }else{
                const Partnername =  await entityManager.query(`select t."firstName" as partnerName, t2."businessName" from tbluser
                 t where t.id ='${sendDataMainInstaller[0]['partnerId']}'`)
                sendDatamail[0]['partnerBusiness'] = Partnername[0]['businessName'];
                const data={
                    'partnerName':Partnername[0]['partnername'],
                    'partnerSalesName':sendInstallerData[0]['salesrepfname'],
                    'businessName':sendInstallerData[0]['legalName'],
                    }

                  //console.log('1---',Partnername)
                  if(rawData[0]['count']>0 && user_id.length>0){
                  this.mailService.recreditdecisiongenericEmail(sendInstallerData[0]['sendemail'],data)
                  }
          }



          if(rawData[0]['count']>0 && user_id.length>0){
              await entityManager.query(`UPDATE tblloan
              SET status_flag='approved'::tblloan_status_flag_enum::tblloan_status_flag_enum,phase_flag='Project Setup'::tblloan_phase_flag_enum::tblloan_phase_flag_enum
              WHERE `+"id = '"+id+"'");
              await entityManager.query(`UPDATE tbluser
              SET active_flag='Y'::tbluser_active_flag_enum::tbluser_active_flag_enum
              WHERE id='${user_id[0]['user_id']}';`)

               
                //console.log('send data',data)
                this.mailService.creditOutcomeEmail(sendDatamail[0]['email'],sendDatamail[0]['partnerBusiness'],sendDatamail[0]['applicantfname'])
                //console.log(rawData)
               
                //this.mailService.creditoutcomeInstalleremail(sendDataInstallermail[0]['installer'],'approved')
                return {"statusCode": 200 };
            }else{
                return {"statusCode": 500, "message": ['This Loan Id Not Exists'], "error": "Bad Request"};
            }
        }catch (error) {
            return {"statusCode": 500, "message": [new InternalServerErrorException(error)['response']['name']], "error": "Bad Request"};
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
