import { Injectable,InternalServerErrorException } from '@nestjs/common';
import { LogsService } from 'src/common/logs/logs.service';
import { LogEntity} from 'src/entities/log.entity'
import { FilesRepository } from 'src/repository/files.repository'; 
import { Milestone } from 'src/repository/milestone.repository';
import { getManager } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateMilestoneDto } from './dto/create-milestone.dto';
import { UpdateMilestoneDto } from './dto/update-milestone.dto';
import { MilestoneEntity} from 'src/entities/milestone.entity'
import { LoanRepository } from 'src/repository/loan.repository';
import { MailService } from 'src/mail/mail.service';


@Injectable()
export class MilestoneService {
  constructor(
    @InjectRepository(Milestone) private readonly MilestoneRepository:Milestone,
    @InjectRepository(LoanRepository)
    private readonly loanRepository: LoanRepository,
    private readonly logsService: LogsService,
    private readonly mailService: MailService,
    ){}

  async get(){
    const entityManager = getManager();
    try{
        const rawData = await entityManager.query(`select * from tblfiles t  where t.services in ('Construction','Equipment','Commercial Operation')`);
        return {"statusCode": 200, data:rawData };
    }catch (error) {
        return {"statusCode": 500, "message": [new InternalServerErrorException(error)['response']['name']], "error": "Bad Request"};
    }
  }
  async getMilestListoneDetails(id){
     
      let condition  = id.split('$');
      console.log(condition[1])


      if(condition[1]=='Equipment'){
        try{
            const entityManager = getManager();
             const rawData = await entityManager.query(`select * from tblfiles t 
             where t.services in ('Equipment','Equipment/Permit') AND t.link_id='${condition[0]}'`);

             let allLoandeatils = await entityManager.query(`select t.id as mileid,t3."salesRep" as salesrep,t3.ins_user_id from tblmilestone t 
            join tblcustomer t5 on CAST(t5."loanId"  as varchar) =t.loanid  
            join tblloan t3  on CAST(t3.id  as varchar) =t.loanid 
            join tbluser t4 on t4.id =t3.user_id
            where t.milestone in ('Equipment','Equipment/Permit') AND t.loanid='${condition[0]}' ORDER BY t."updatedAt" desc`)

            let getSendemail =await entityManager.query(`select * from tbluser t where t.id='${allLoandeatils[0].ins_user_id}'`)
            let reviewLogData:any = await entityManager.query(`select * from tbllog  where loan_id = '${condition[0]}' and "module" like '%Milestone Updated%' order by "updatedAt" desc;` )


            return {"statusCode": 200, data:rawData,allLoandeatils,getSendemail,reviewLogData };
        }catch (error) {
            console.log(error)
            let resp = new InternalServerErrorException(error).getResponse();
            if (Object.keys(resp).includes('name'))
                resp = Object.values(resp)[Object.keys(resp).indexOf('name')];
            return {
                statusCode: 500,
                message: [resp],
                error: 'Bad Request',
            };

        }
      }else if(condition[1]=='Construction'){
        try{
            const entityManager = getManager();
            const rawData = await entityManager.query(`select * from tblfiles t 
             where services='Construction' AND t.link_id='${condition[0]}'`);

             let allLoandeatils = await entityManager.query(`select t.id as mileid,t3."salesRep" as salesrep,t3.ins_user_id from tblmilestone t 
             join tblcustomer t5 on CAST(t5."loanId"  as varchar) =t.loanid  
             join tblloan t3  on CAST(t3.id  as varchar) =t.loanid 
             join tbluser t4 on t4.id =t3.user_id
             where t.milestone in ('Construction') AND t.loanid='${condition[0]}' ORDER BY t."updatedAt" desc`)

             let getSendemail =await entityManager.query(`select * from tbluser t where t.id='${allLoandeatils[0].ins_user_id}'`)
             let reviewLogData:any = await entityManager.query(`select * from tbllog  where loan_id = '${condition[0]}' and "module" like '%Milestone Updated%' order by "updatedAt" desc;` )

            return {"statusCode": 200, data:rawData,allLoandeatils,getSendemail,reviewLogData };
        }catch (error) {
            console.log(error)
            let resp = new InternalServerErrorException(error).getResponse();
            if (Object.keys(resp).includes('name'))
                resp = Object.values(resp)[Object.keys(resp).indexOf('name')];
            return {
                statusCode: 500,
                message: [resp],
                error: 'Bad Request',
            };
        }
      }else{
        try{
            const entityManager = getManager();
            const rawData = await entityManager.query(`select * from tblfiles t 
             where services='Commercial Operation' AND t.link_id='${condition[0]}' `);

             let allLoandeatils = await entityManager.query(`select t.id as mileid,t3."salesRep" as salesrep,t3.ins_user_id
             from tblmilestone t 
             join tblcustomer t5 on CAST(t5."loanId"  as varchar) =t.loanid  
             join tblloan t3  on CAST(t3.id  as varchar) =t.loanid 
             join tbluser t4 on t4.id =t3.user_id
             where t.milestone in ('PTO') AND t.loanid='${condition[0]}' ORDER BY t."updatedAt" desc`)

             let getSendemail =await entityManager.query(`select * from tbluser t where t.id='${allLoandeatils[0].ins_user_id}'`)
             let reviewLogData:any = await entityManager.query(`select * from tbllog  where loan_id = '${condition[0]}' and "module" like '%Milestone Updated%' order by "updatedAt" desc;` )

            return {"statusCode": 200, data:rawData,allLoandeatils,getSendemail,reviewLogData};
        }catch (error) {
            console.log(error)
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
      
    }


    async getMilestoneDetails()
    {
        try {
            const entityManager = getManager();
            let allLoandeatils = await entityManager.query(`select t.status as milestatus,t.id  as milestoneid,t5."loanId" as loanid,t3.ref_no as appid,t5."legalName" as borrower,
            CONCAT(t5."ownerFirstName", ' ', t5."ownerLastName") AS ownerFullname,t5."owner2Address" as owneraddress,t3."salesRep" as salesrep,t3.ins_user_id,
            CONCAT(t4."firstName" , ' ', t4."lastName") AS installer,t.milestone,t."updatedAt" as dateapproved,t."createdAt" as datesubmitted from tblmilestone t 
            join tblcustomer t5 on CAST(t5."loanId"  as varchar) =t.loanid  
            join tblloan t3  on CAST(t3.id  as varchar) =t.loanid 
            join tbluser t4 on t4.id =t3.user_id
            where t.milestone in ('Equipment','Construction','PTO') ORDER BY t."updatedAt" desc`)
            return {
                statusCode:200,
                allLoandeatils
            }
        } catch (error) {
            console.log(error)
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

  async updatestatus(updateMilestone : UpdateMilestoneDto){
    const milestonedata: any = await this.MilestoneRepository.update({id: updateMilestone.id},
        {
            loanid : updateMilestone.loanid,
            comments : updateMilestone.comments,
            status:'Approved',
           
        }
    )
    const user: any = await this.loanRepository.find({
        select: ['user_id'],
        where: { id: updateMilestone.loanid },
        });


        await this.logsService.log(
        updateMilestone.loanid,
        user[0].user_id,
        'Milestone Approved'
        );

        return {
            statusCode: 200,
            message: "Milestone Approved",
            milestonedata
            }
  }

    async addcomments(updateMilestone : UpdateMilestoneDto){
        const milestonedata: any = await this.MilestoneRepository.update({id: updateMilestone.id},
            {
                loanid : updateMilestone.loanid,
                comments : updateMilestone.comments,
                status:'NeedInfo',
               
            }
            
          )
          const user: any = await this.loanRepository.find({
            select: ['user_id'],
            where: { id: updateMilestone.loanid },
            });


            await this.logsService.log(
            updateMilestone.loanid,
            user[0].user_id,
            'Milestone Updated'
            );

            const data: any ={
                username :updateMilestone.sendname,
                link:process.env.OrkaUrl+'partner',
                message:updateMilestone.comments,
                milestone:updateMilestone.milestone,
                businessname:updateMilestone.businessname,
              }
//console.log('---',data)
            this.mailService.requestInfoMilestoneEmail(updateMilestone.sendemail,data);
            return {
                statusCode: 200,
                message: "Milestone Updtated",
                milestonedata
                }

    }
    async getcompleteMilestoneDetails()
    {
        try {
            const entityManager = getManager();
            let allLoandeatils = await entityManager.query(`select t.id  as milestoneid,t5."loanId" as loanid,t3.ref_no as appid,t5."legalName" as borrower,
            CONCAT(t5."ownerFirstName", ' ', t5."ownerLastName") AS ownerFullname,t5."owner2Address" as owneraddress,t3."salesRep" as salesrep,
            CONCAT(t4."firstName" , ' ', t4."lastName") AS installer,t.milestone,t."updatedAt" as dateapproved,t."createdAt" as datesubmitted from tblmilestone t 
            join tblcustomer t5 on CAST(t5."loanId"  as varchar) =t.loanid  
            join tblloan t3  on CAST(t3.id  as varchar) =t.loanid 
            join tbluser t4 on t4.id =t3.user_id
            where t.status='Approved' ORDER BY t."updatedAt" desc`)
            return {
                statusCode:200,
                allLoandeatils
            }
        } catch (error) {
            console.log(error)
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
}
