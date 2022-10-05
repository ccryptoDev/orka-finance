import { Injectable,InternalServerErrorException } from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { LoanRepository } from '../../repository/loan.repository';
import {Flags,StatusFlags} from '../../configs/config.enum'
import { getManager } from 'typeorm';

@Injectable()//check 
export class DashboardService {
    constructor( @InjectRepository(LoanRepository) private readonly loanRepository: LoanRepository) {
       
    }

    async get(){
        const entityManager = getManager();
        let data:any = {};
        try{
            //Incomplete Application --> delete_flag=N active_flag=N status_flag=waiting
            const rawData1 = await entityManager.query(`select count(*) as count from tblloan where delete_flag = 'N' and active_flag ='N' and status_flag = 'waiting'`);
            data.incomplete_application = rawData1[0]['count'];

            //Pending Applications ---> delete_flag=N active_flag=Y status_flag=waiting (After submitting Credti app)
            const rawData2 = await entityManager.query(`select count(*) as count from tblloan where delete_flag = 'N' and active_flag ='Y' and status_flag = 'waiting'`);
            data.waiting_application = rawData2[0]['count'];
    
            //Approved Application ---> delete_flag=N active_flag=Y status_flag=approved
            const rawData3 = await entityManager.query(`select count(*) as count from tblloan where delete_flag = 'N' and active_flag ='Y' and status_flag = 'approved'`);
            data.approved_application = rawData3[0]['count'];
            
            //Denied Application ---> delete_flag=N active_flag=Y status_flag=cancelled
            const rawData4 = await entityManager.query(`select count(*) as count from tblloan where delete_flag = 'N' and status_flag = 'canceled'`);
            data.canceled_application = rawData4[0]['count'];
            
        
        return {"statusCode": 200, data:data };    
    } catch (error) {
            console.log(error)
            return {"statusCode": 500, "message": [new InternalServerErrorException(error)['response']['name']], "error": "Bad Request"};
        }
    }
}
