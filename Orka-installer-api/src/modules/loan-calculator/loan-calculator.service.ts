import { Injectable,InternalServerErrorException } from '@nestjs/common';
import { CustomerRepository } from 'src/repository/customer.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, getManager } from 'typeorm';

@Injectable()
export class LoanCalculatorService {
    constructor(){}

    async getLoanProducts(id:string)
    {
        try{
            const entityManager = getManager();
            let loanProducts = await entityManager.query(`select t2."productId", t2.name, t2."type" , t2."tenorMonths", t2."tenorYears", t2."interestBaseRate", t2."achDiscount", t2."achDiscountInterestRate", t2."dealerFee", t2."originationFee",t2.prepayment_flag, t2.prepayment, t2."prepaymentMonth", t2.downpayment, t2."mpfAchWItcPrepay",t2."mpfAchWOPrepay", t2."mpfCheckWItcPrepay", t2."mpfCheckWOPrepay"  from tblpartnerproduct t1 join tblproduct t2 on t1."productId"  = t2."productId" where t1."installerId" ='${id}' and t1.active_flag ='Y' and t2.status ='ACTIVE'`)
            return{
                statusCode:200,
                loanProducts
            }
        }
        catch(error)
        {
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

