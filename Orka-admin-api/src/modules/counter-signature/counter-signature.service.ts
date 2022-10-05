import { Injectable,InternalServerErrorException } from '@nestjs/common';
import { LogsService } from 'src/common/logs/logs.service';
import { getManager } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateCounterSignatureDto } from './dto/create-counter-signature.dto';
import { UpdateCounterSignatureDto } from './dto/update-counter-signature.dto';
import { LoanRepository } from 'src/repository/loan.repository';
import { MailService } from 'src/mail/mail.service';


@Injectable()
export class CounterSignatureService {
  constructor(
    @InjectRepository(LoanRepository)
    private readonly loanRepository: LoanRepository,
    private readonly logsService: LogsService,
    private readonly mailService: MailService,
    ){}


    async get(){
      const entityManager = getManager();
      try{
          const rawData = await entityManager.query(`select t5."loanId" as loanid,t3.ref_no as appid,t5."legalName" as borrower,
          CONCAT(t5."ownerFirstName", ' ', t5."ownerLastName") AS ownerFullname,t5."owner2Address" as owneraddress,
          t5."businessAddress",t5."batteryManufacturer",t5."inverterManufacturer",
          t5."batteryManufacturer",CONCAT(t4."firstName" , ' ', t4."lastName") AS installer,
          t3."salesRep" as salesrep,t."createdAt" as datesubmitted
          from tblloanagreement  t 
          join tblcustomer t5 on cast(t5."loanId" as varchar) =t."loanId"  
          join tblloan t3  on cast(t3.id as varchar) =t."loanId"  
          join tbluser t4 on t4.id =t3.user_id 
          where t."envelopeStatus" ='MAIN_CUSTOMER_PG_1_SIGNED' ORDER BY t."updatedAt" desc`);
          return {"statusCode": 200, data:rawData };
      }catch (error) {
          return {"statusCode": 500, "message": [new InternalServerErrorException(error)['response']['name']], "error": "Bad Request"};
      }
    }

    async getCompleted(){
      const entityManager = getManager();
      try{
          const rawData = await entityManager.query(`select t5."loanId" as loanid,t3.ref_no as appid,t5."legalName" as borrower,
          CONCAT(t5."ownerFirstName", ' ', t5."ownerLastName") AS ownerFullname,
          CONCAT(t4."firstName" , ' ', t4."lastName") AS installer,
          t3."salesRep" as salesrep,t."createdAt" as datesubmitted,t."updatedAt" as datecountered
          from tblloanagreement  t 
          join tblcustomer t5 on cast(t5."loanId" as varchar) =t."loanId"  
          join tblloan t3  on cast(t3.id as varchar) =t."loanId"  
          join tbluser t4 on t4.id =t3.user_id 
          where t."envelopeStatus" ='CEO_SIGNED' ORDER BY t."updatedAt" desc`);

          console.log(rawData)
          return {"statusCode": 200, data:rawData };
      }catch (error) {
          return {"statusCode": 500, "message": [new InternalServerErrorException(error)['response']['name']], "error": "Bad Request"};
      }
    }
}
