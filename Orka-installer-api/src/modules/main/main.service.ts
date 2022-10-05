import { MainFilterDto } from './dto/main-filter.dto';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CustomerRepository } from 'src/repository/customer.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, getManager } from 'typeorm';
import { LoanRepository } from 'src/repository/loan.repository';

@Injectable()//
export class MainService {
    constructor(
        @InjectRepository(CustomerRepository) private readonly customerRepository:CustomerRepository,
        @InjectRepository(LoanRepository) private readonly loanRepository:LoanRepository
    ){}

    //old partner portal
    async getApplicationsList(id){
        const entityManager = getManager();
        try{            
            let data = {}  
            data['uploadcount'] = 0;
            data['verfiycount'] = 0;
            data['milestonecount'] = 0;
            let loanid = []
            let count = await entityManager.query(`select  count(*), l.id, ii.status from tblloan l left join tblinstallinginfo ii on ii.loan_id = l.id where l.status_flag='approved' and l.ins_user_id='${id}' and l.delete_flag='N' and (ii.status is null or ii.status = 'documentsUploaded' or ii.status = 'verifiedAndApproved' or ii.status = 'milestone1Completed' or ii.status = 'milestone2Completed' or ii.status = 'milestone3Completed' ) group by l.id, ii.status`)
            for(let i = 0; i<count.length; i++){
                loanid.push(`'${count[i]['id']}'`)
                if(!count[i]['status']){
                    data['uploadcount'] = data['uploadcount']+1
                }else if(count[i]['status']=='documentsUploaded'){
                    data['verfiycount'] = data['verfiycount']+1
                }else if(count[i]['status']=='verifiedAndApproved' || count[i]['status']=='milestone1Completed' || count[i]['status']=='milestone2Completed' || count[i]['status']=='milestone3Completed'){
                    data['milestonecount'] = data['milestonecount']+1
                }
            }
            if(loanid.length>0){
                data['applicationsList'] = await entityManager.query(`select l.ref_no  as loan_ref, l.id as loan_id, c.ref_no as app_ref, c."firstName" as firstName, c."lastName" as lastName, c.email as email , c."createdAt" as createdAt from tblloan l join tblcustomer c on l.id = c.loan_id where l.status_flag='approved' and l.ins_user_id='${id}' and l.delete_flag='N' and l.id in (${loanid.join(',')}) order by l."createdAt" desc`) 
            }else{
                data['applicationsList'] = []
            }
                     
            return {"statusCode": 200, data:data };            
        }catch(error){
            return {"statusCode": 500, "message": [new InternalServerErrorException(error)['response']['name']], "error": "Bad Request"};
        }
    }

    async getAllApplicants(id:string)
    {
        const entityManager = getManager();
        try{
            let data = await entityManager.query(`select t1.ref_no as id, t1.id as loanId ,
            t2."legalName" as customer,t1."salesRep" as salesRep,t2."ownerFirstName" as contact,
            CONCAT(t2."ownerFirstName", ' ', t2."ownerLastName") AS ownerFullname,t2."city",
            (current_date - t2."createdAt"::date) as cur_date,(current_date - t2."updatedAt" ::date) as up_date,
            t2."state", t2."distance", t2."createdAt", t2."updatedAt" as lastUpdate,t1.phase_flag from 
            tblcustomer t2 join tblloan t1 on t1.id=t2."loanId" join tbluser t3 on t3.id=t1.ins_user_id where 
            t1.ins_user_id = '${id}'
            order by t1.ref_no desc`)

                let uniqueStates = await entityManager.query(`select distinct t2."state" from 
                tblcustomer t2 join tblloan t1 on t1.id=t2."loanId" where 
                t1.ins_user_id = '${id}'`)
                let uniqueSalesRep = await entityManager.query(`select distinct "salesRep" as salesrep from tblloan where ins_user_id = '${id}'`)
        
        if(data.length>0)
        {
            return {
                statusCode:200,
                message:["Success"],
                data,
                uniqueStates,
                uniqueSalesRep
            }
        }
        else{
            return {
                statusCode:200,
                message:["No Customer Found"]
            }
        }
        }

        catch(error)
        {
            console.log(error);
            return {
                statusCode:500,
                message:"Internal Server Error"
            }
        }
    }


    //dependency of getFilter
    getJumpValue(mainFilterDto:MainFilterDto):number{
        if(mainFilterDto.state && mainFilterDto.phase && mainFilterDto.salesRep) return 7;
        else if(mainFilterDto.phase && mainFilterDto.salesRep) return 6;
        else if(mainFilterDto.state && mainFilterDto.salesRep) return 5;
        else if(mainFilterDto.state && mainFilterDto.phase) return 4;
        else if(mainFilterDto.salesRep) return 3;
        else if(mainFilterDto.phase) return 2;
        else if(mainFilterDto.state) return 1;
        else return 0;
    }


    async getFilter(id:string,mainFilterDto:MainFilterDto){

        try {
            //common querry to a variable
        let querry = `select t1.ref_no as id, t1.id as loanId ,t2."legalName" as customer,t1."salesRep" as salesRep,t2."ownerFirstName" as contact, t2."city",
        (current_date - t2."createdAt"::date) as cur_date,(current_date - t2."updatedAt" ::date) as up_date,t2."state", t2."distance", t2."createdAt", t2."updatedAt" as lastUpdate,t1.phase_flag from 
        tblcustomer t2 join tblloan t1 on t1.id=t2."loanId" join tbluser t3 on t3.id=t1.ins_user_id where t1.ins_user_id = '${id}' `
        
        const entityManager = getManager();
        //selecting the filter case and switching to it
        let data:any;
        let jump = this.getJumpValue(mainFilterDto);
        switch(jump){
            case 1: data= await entityManager.query(querry+`and t2.state = '${mainFilterDto.state}' order by t1.ref_no asc`);
                    break;
            case 2: data= await entityManager.query(querry+`and t1.phase_flag = '${mainFilterDto.phase}' order by t1.ref_no asc`);
                    break;
            case 3: data= await entityManager.query(querry+`and t1."salesRep" = '${mainFilterDto.salesRep}' order by t1.ref_no asc`);
                    break;
            case 4: data= await entityManager.query(querry+`and t2.state = '${mainFilterDto.state}' and t1.phase_flag = '${mainFilterDto.phase}' order by t1.ref_no asc`);
                    break;
            case 5: data= await entityManager.query(querry+`and t2.state = '${mainFilterDto.state}' and t1."salesRep" = '${mainFilterDto.salesRep}' order by t1.ref_no asc`);
                    break;
            case 6: data= await entityManager.query(querry+`and t1.phase_flag = '${mainFilterDto.phase}' and t1."salesRep" = '${mainFilterDto.salesRep}' order by t1.ref_no asc`);
                    break;
            case 7: data= await entityManager.query(querry+`and t2.state = '${mainFilterDto.state}' and t1.phase_flag = '${mainFilterDto.phase}' and t1."salesRep" = '${mainFilterDto.salesRep}' order by t1.ref_no asc`);
                    break;
            default: return this.getAllApplicants(id);
        }
        return{
            statusCode:200,
            message:["Success"],
            data,

        }
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
}
