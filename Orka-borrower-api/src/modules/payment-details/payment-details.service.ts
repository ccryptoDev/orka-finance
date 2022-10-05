import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CustomerRepository } from 'src/repository/customer.repository';
import { PaymentScheduleRepository } from 'src/repository/paymentSchedule.repository';
import { getManager } from 'typeorm';


@Injectable()
export class PaymentDetailsService {

    constructor(
        @InjectRepository(PaymentScheduleRepository) private readonly paymentScheduleRepository:PaymentScheduleRepository,
        @InjectRepository(CustomerRepository) private readonly customerRepository:CustomerRepository       
    ){}

    async getPaymentDetails(id){        
        // const entityManager = getManager();
        try{            
            let data = {}
            data['payment_details'] = await this.paymentScheduleRepository.find({where:{loan_id:id, status_flag:'PAID'}, order:{scheduleDate: 'DESC'}});
            data['next_schedule'] = await this.paymentScheduleRepository.findOne({where:{loan_id:id, status_flag:'UNPAID'}, order:{scheduleDate: 'ASC'}});
            //data['user_details'] = await this.customerRepository.findOne({select:['autoPayment'],where:{loanId:id}});
            //change for orka
            data['paymentScheduleDetails'] = await this.paymentScheduleRepository.find({where:{loan_id:id}, order:{scheduleDate: 'ASC'}});
            return {"statusCode": 200, data:data };            
        }catch(error){
            return {"statusCode": 500, "message": [new InternalServerErrorException(error)['response']['name']], "error": "Bad Request"};
        }
    }
}
