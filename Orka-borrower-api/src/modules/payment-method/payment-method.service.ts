import { Injectable,InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserBankAccount, Flags } from 'src/entities/userBankAccount.entity';
import { UserDebitCard } from 'src/entities/userDebitCard.entity';
import { CustomerRepository } from 'src/repository/customer.repository';
import { UserBankAccountRepository } from 'src/repository/userBankAccounts.repository';
import { UserDebitCardRepository } from 'src/repository/userDebitCard.repository';
import { getManager } from 'typeorm';
import { bankAddDto } from './dto/bankAdd.dto';
import { debitCardAddDto } from './dto/debitCardAdd.dto';


@Injectable()
export class PaymentMethodService {
    constructor(
        @InjectRepository(UserDebitCardRepository) private readonly userDebitCardRepository:UserDebitCardRepository,
        @InjectRepository(UserBankAccountRepository) private readonly userBankAccountRepository:UserBankAccountRepository,
        @InjectRepository(CustomerRepository) private readonly customerRepository:CustomerRepository       

        ){}

    async debitCardAdd(debitCardAddDto:debitCardAddDto){
        try{
            let userDebitCard =  new UserDebitCard();
            userDebitCard.fullName = debitCardAddDto.fullName;
            userDebitCard.cardNumber = debitCardAddDto.cardNumber;
            userDebitCard.expires = debitCardAddDto.expires;
            userDebitCard.csc = debitCardAddDto.csc;
            userDebitCard.billingAddress = debitCardAddDto.billingAddress;
            userDebitCard.user_id = debitCardAddDto.user_id;

            console.log('userDebitCard', userDebitCard);
            

            await this.userDebitCardRepository.save(userDebitCard)
            return {"statusCode": 200}
        }catch(error){
            return {"statusCode": 500, "message": [new InternalServerErrorException(error)['response']['name']], "error": "Bad Request"};
        }
    }

    async bankAdd(bankAddDto:bankAddDto){
        // try{
        //     let userBankAccount =  new UserBankAccount();
        //     userBankAccount.bankName = bankAddDto.bankName;
        //     userBankAccount.holderName = bankAddDto.holderName;
        //     userBankAccount.routingNumber = bankAddDto.routingNumber;
        //     userBankAccount.accountNumber = bankAddDto.accountNumber;
        //     userBankAccount.user_id = bankAddDto.user_id;

        //     console.log('userBankAccount', userBankAccount);
            

        //     await this.userBankAccountRepository.save(userBankAccount)
        //     return {"statusCode": 200}
        // }catch(error){
        //     return {"statusCode": 500, "message": [new InternalServerErrorException(error)['response']['name']], "error": "Bad Request"};
        // }
    }

    async getBankCardDetails(id){
        const entityManager = getManager();
        try{
            let data = {}
            data['bankDetails'] = await this.userBankAccountRepository.find({where: {user_id:id, delete_flag: 'N'}, order:{createdAt: 'DESC'}})
            data['cardDetails'] = await this.userDebitCardRepository.find({where: {user_id:id, delete_flag: 'N'}, order:{createdAt: 'DESC'}})
            data['user_details'] = await this.customerRepository.findOne({select:[],where:{id:id}});//need to update properly
            return {"statusCode": 200, data:data };            
        }catch(error){
            return {"statusCode": 500, "message": [new InternalServerErrorException(error)['response']['name']], "error": "Bad Request"};
        }
    }

    async bankChoose(userId,bankUpdateDto){
        // try{
        //     await this.userBankAccountRepository.update({user_id: userId},{active_flag: Flags.N})
        //     await this.userBankAccountRepository.update({id: bankUpdateDto.bank_id},{active_flag: Flags.Y})
        //     return {"statusCode": 200 };            
        // }catch(error){
        //     return {"statusCode": 500, "message": [new InternalServerErrorException(error)['response']['name']], "error": "Bad Request"};
        // }
    }

    async cardChoose(userId,debitCardUpdateDto){
        try{
            await this.userDebitCardRepository.update({user_id: userId},{active_flag: Flags.N})
            await this.userDebitCardRepository.update({id: debitCardUpdateDto.card_id},{active_flag: Flags.Y})
            return {"statusCode": 200 };            
        }catch(error){
            return {"statusCode": 500, "message": [new InternalServerErrorException(error)['response']['name']], "error": "Bad Request"};
        }
    }

    async toggleAutoPay(userId,toggleValue){
        try{
            //await this.customerRepository.update({id: userId},{autoPayment: (toggleValue.value?Flags.Y:Flags.N)})
            return {"statusCode": 200 };            
        }catch(error){
            return {"statusCode": 500, "message": [new InternalServerErrorException(error)['response']['name']], "error": "Bad Request"};
        }
    }
}
