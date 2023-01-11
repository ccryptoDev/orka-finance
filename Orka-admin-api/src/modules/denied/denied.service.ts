import { Injectable,InternalServerErrorException } from '@nestjs/common';
import { getManager } from 'typeorm';

import { CreditReportService } from '../credit-report/credit-report.service';

@Injectable()
export class DeniedService {
  constructor(
    private readonly creditReportService: CreditReportService
  ) {}

  async get(){
      const entityManager = getManager();
      try{
          const rawData = await entityManager.query(`select t.id as loan_id, t.user_id as user_id, t.ref_no as loan_ref, t2.email as email,
          t2.ref_no as user_ref, t2."firstName" as firstName, t2."lastName" as lastName,t3."legalName" as businessName
          from tblloan t 
          join tbluser t2 on t2.id = t.user_id
          join tblcustomer t3 on t3."loanId" =t.id 
          where t.delete_flag = 'N' 
          and t.active_flag = 'Y' and t.status_flag = 'canceled' order by t."createdAt" desc`);
          //console.log(rawData)
          return {"statusCode": 200, data:rawData };
      }catch (error) {
          return {"statusCode": 500, "message": [new InternalServerErrorException(error)['response']['name']], "error": "Bad Request"};
      }

  }

  async getdetails(id){
      const entityManager = getManager();
      try{
          
          const rawData = await entityManager.query(`select count(*) as count from tblloan where delete_flag = 'N' and status_flag = 'canceled' and `+"id = '"+id+"'");
          if(rawData[0]['count']>0){
              let data = {}
              data['answers'] = await entityManager.query("select t.answer as answer, t2.question as question from tblanswer t join tblquestion t2 on t2.id= t.question_id where loan_id = '"+id+"'")
              data['from_details'] = await entityManager.query(`select t.id as loan_id, t.user_id as user_id, t.ref_no as loan_ref, t2.email as email,
              t2.ref_no as user_ref, t2."firstName" as firstName, t2."lastName" as lastName,t3."legalName" as businessName,t3.*
              from tblloan t 
              join tbluser t2 on t2.id = t.user_id
              join tblcustomer t3 on t3."loanId" =t.id 
              where t.id='${id}' and  t.delete_flag = 'N' 
              and t.active_flag = 'Y' and t.status_flag = 'canceled' order by t."createdAt" desc`)
              data['CoApplicant'] = [];
              data['files'] = await entityManager.query(`select originalname,filename from tblfiles where link_id = '${id}' and delete_flag='N'`)
              data['paymentScheduleDetails'] = await entityManager.query(`select * from tblpaymentschedule where loan_id = '${id}'  order by "scheduleDate" asc`)
              data["loanDetails"] = await entityManager.query(`select t."financingRequested", t."financingTermRequested",t."status_flag" , t.apr, t2."interestBaseRate" , 
              t."originationFee", t."paymentAmount", t2.*
                      from tblloan t 
                      left join tblproduct t2 on CAST(t2."productId"  as varchar) =t."productId" 
                      where t.id ='${id}' and  t.delete_flag ='N'`)                
              data['equifaxReport'] = await this.creditReportService.getByLoanId(id);
              
              return {"statusCode": 200, data:data };
          }else{
              return {"statusCode": 500, "message": ['This Loan Id Not Exists'], "error": "Bad Request"};
          }
      }catch(error){
          return {"statusCode": 500, "message": [new InternalServerErrorException(error)['response']['name']], "error": "Bad Request"};
      }
  }

  async setpending(id){
      const entityManager = getManager();
      try{
          const rawData = await entityManager.query(`select count(*) as count from tblloan where delete_flag = 'N' and active_flag = 'Y' and (status_flag = 'canceled' or status_flag = 'approved') and `+"id = '"+id+"'");
          if(rawData[0]['count']>0){
          await entityManager.query(`UPDATE tblloan
          SET status_flag='waiting'::tblloan_status_flag_enum::tblloan_status_flag_enum,phase_flag='Underwriting'::tblloan_phase_flag_enum::tblloan_phase_flag_enum
          WHERE `+"id = '"+id+"'");
          //console.log(rawData)
          return {"statusCode": 200 };
      }else{
          return {"statusCode": 500, "message": ['This Loan Id Not Exists'], "error": "Bad Request"};
      }
      }catch (error) {
          return {"statusCode": 500, "message": [new InternalServerErrorException(error)['response']['name']], "error": "Bad Request"};
      }

  }

  async setdelete(id){
      const entityManager = getManager();
      try{
          const rawData = await entityManager.query(`select count(*) as count from tblloan where (delete_flag = 'N' and active_flag = 'Y' and status_flag = 'canceled') or (delete_flag = 'N' and active_flag = 'N' and status_flag = 'waiting') and `+"id = '"+id+"'");
          if(rawData[0]['count']>0){
          await entityManager.query(`UPDATE tblloan
          SET delete_flag='Y'::tblloan_delete_flag_enum::tblloan_delete_flag_enum
          WHERE `+"id = '"+id+"'");
          //console.log(rawData)
          return {"statusCode": 200 };
      }else{
          return {"statusCode": 500, "message": ['This Loan Id Not Exists'], "error": "Bad Request"};
      }
      }catch (error) {
          return {"statusCode": 500, "message": [new InternalServerErrorException(error)['response']['name']], "error": "Bad Request"};
      }

  }
}
