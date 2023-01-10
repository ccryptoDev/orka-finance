import { Injectable,InternalServerErrorException } from '@nestjs/common';
import { getManager } from 'typeorm';
import { CreditReportService } from '../credit-report/credit-report.service';

@Injectable()
export class ApprovedService {
    constructor(
        private readonly creditReportService: CreditReportService){}
    async get(){
        const entityManager = getManager();
        try{
            const rawData = await entityManager.query(` select t.id as loan_id, t.user_id as user_id, t.ref_no as loan_ref, t2.email as email,
            t2.ref_no as user_ref, t2."firstName" as firstName, t2."lastName" as lastName,t3."legalName" as businessName
            from tblloan t 
            join tbluser t2 on t2.id = t.user_id
            join tblcustomer t3 on t3."loanId" =t.id 
            where t.delete_flag = 'N' 
            and t.active_flag = 'Y' and t.status_flag = 'approved' order by t."createdAt" desc`);
            //console.log(rawData)
            return {"statusCode": 200, data:rawData };
        }catch (error) {
            return {"statusCode": 500, "message": [new InternalServerErrorException(error)['response']['name']], "error": "Bad Request"};
        }

    }

    async getdetails(id){
        const entityManager = getManager();
        try{
            
            const rawData = await entityManager.query(`select count(*) as count from tblloan where delete_flag = 'N' and active_flag = 'Y' and status_flag = 'approved' and `+"id = '"+id+"'");
            console.log(id,"here i got data",rawData);
            if(rawData[0]['count']>0){
                let data = {}
                data['answers'] = await entityManager.query("select t.answer as answer, t2.question as question from tblanswer t join tblquestion t2 on t2.id= t.question_id where loan_id = '"+id+"'")
                data['from_details'] = await entityManager.query(`select t.id as loan_id, t.user_id as user_id, t.ref_no as loan_ref, t2.email as email,
                t2.ref_no as user_ref, t2."firstName" as firstName, t2."lastName" as lastName,t3."legalName" as businessName,t3.*
                from tblloan t 
                join tbluser t2 on t2.id = t.user_id
                join tblcustomer t3 on t3."loanId" =t.id 
                where t.id='${id}' and  t.delete_flag = 'N' 
                and t.active_flag = 'Y' and t.status_flag = 'approved' order by t."createdAt" desc`)
                data['CoApplicant'] = [];
                data['files'] = await entityManager.query(`select originalname,filename from tblfiles where link_id = '${id}' and delete_flag='N'`)
                data['paymentScheduleDetails'] = await entityManager.query(`select * from tblpaymentschedule where loan_id = '${id}'  order by "scheduleDate" asc`)
                data['paymentTransaction'] = await entityManager.query(`select * from tblpaymentschedule where loan_id = '${id}' and status_flag='PAID' order by "scheduleDate" asc`)
                data['remainingPayments'] = await entityManager.query(`select * from tblpaymentschedule where loan_id = '${id}' and status_flag='UNPAID' order by "scheduleDate" asc`)
                data['fundedTransactions'] = await entityManager.query(`select * from tblpaymentmanagement where loan_id = '${id}' and status='PAID' order by "createdAt" asc`)
                data['fundedPercentage'] = await entityManager.query(`select sum("fundedPercentage") as fundedPercentage from tblpaymentmanagement where loan_id = '${id}' and status='PAID'`)
                data["userConsentDoc"] = await entityManager.query(`select ucon.id,ucon."loanId",ucon."filePath",ucon."fileKey",conm.name from tbluserconsent ucon join tblconsentmaster conm on conm."fileKey" = ucon."fileKey"
                where "loanId" = '${id}'`)
                data["loanDetails"] = await entityManager.query(`select t."financingRequested", t."financingTermRequested", t.apr, t2."interestBaseRate" ,t."status_flag", t."originationFee", t."paymentAmount",t2.*
                from tblloan t left join tblproduct t2 on CAST(t2."productId"  as varchar) =t."productId" 
                where t.id ='${id}' and  t.delete_flag ='N'`)                
                data['equifaxReport'] = await this.creditReportService.getByLoanId(id);
                
                
                return {"statusCode": 200, data:data };
            }else{
                return {"statusCode": 500, "message": ['This Loan Id Not Exists'], "error": "Bad Request"};
            }
        }catch(error){
            console.log(error)
            return {"statusCode": 500, "message": [new InternalServerErrorException(error)['response']['name']], "error": error};
        }
    }


    async getlogs(id){
        const entityManager = getManager();
        try{
            const rawData = await entityManager.query(`select CONCAT ('LOG_',t.id) as id, t.module as module, concat(t2.email,' - ',INITCAP(r."name"::text)) as user, t."createdAt" as createdAt from tbllog t join tbluser t2 on t2.id = t.user_id join tblroles r on r.id = t2.role where t.loan_id = '${id}' order by t."createdAt" desc;`);
            //console.log(rawData)
            return {"statusCode": 200, data:rawData };
        }catch (error) {
            return {"statusCode": 500, "message": [new InternalServerErrorException(error)['response']['name']], "error": "Bad Request"};
        }

    }

    
}
