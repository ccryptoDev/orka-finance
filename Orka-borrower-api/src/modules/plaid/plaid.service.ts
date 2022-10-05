
import { Injectable,BadRequestException,InternalServerErrorException } from '@nestjs/common';
import { CustomerRepository } from '../../repository/customer.repository';
import { InjectRepository } from '@nestjs/typeorm';
@Injectable()
export class PlaidService {
    constructor(@InjectRepository(CustomerRepository) private readonly customerRepository: CustomerRepository){

    }
    async savetoken(id,access_token){
        try {
        //this.customerRepository.update({loanId: id}, { plaid_access_token: access_token }); to be updated in orka
        return {"statusCode": 200}    
    }catch (error) {
            console.log(error)
            return {"statusCode": 500, "message": [new InternalServerErrorException(error)['response']['name']], "error": "Bad Request"};
          }
    }
}
