import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { getManager } from 'typeorm';

@Injectable()
export class OffersService {
    async get(){
        const entityManager = getManager();
        try{
            let offersArray = [];
            offersArray[0] = {
                financier: 'Loanpal Finance',
                loanamount: 99398.00,
                apr: 3.48,
                term: 300,
                monthlyPay: 288.26
            }
            offersArray[1] = {
                financier: 'Loanpal Finance',
                loanamount: 99398.00,
                apr: 2.49,
                term: 300,
                monthlyPay: 335.35
            }
            offersArray[2] = {
                financier: 'Sunlight Finance',
                loanamount: 99398.00,
                apr: 0.99,
                term: 240,
                monthlyPay: 342.13
            }
            return {"statusCode": 200, data:offersArray};
        }catch (error) {
            return {"statusCode": 500, "message": [new InternalServerErrorException(error)['response']['name']], "error": "Bad Request"};
        }

    }
}
