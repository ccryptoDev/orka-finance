import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { getManager } from 'typeorm';

import { LogsService } from '../../common/logs/logs.service';
import { InstallerRepository } from '../../repository/installer.repository';
import { CreateSalesContractreviewDto } from './dto/create-sales-contractreview.dto';
import { UpdateSalesContractreviewDto } from './dto/update-sales-contractreview.dto';
import { Flags,ContractReviewStatus, StatusFlags, PhaseFlag } from '../../configs/config.enum';
import { MailService } from '../../mail/mail.service';
import { SalesContractReview } from '../../repository/salesContractReview.repositiry';
import {SalesContractReviewEntity} from '../../entities/salesContractReview.entity'
import { LoanRepository } from '../../repository/loan.repository';
import { CustomerRepository } from '../../repository/customer.repository';

@Injectable()
export class SalesContractreviewService {
  constructor(
    @InjectRepository(SalesContractReview) private readonly SalesContractReviewRepositary: SalesContractReview,
    @InjectRepository(LoanRepository) private readonly loanRepository: LoanRepository,
    @InjectRepository(InstallerRepository) private readonly installerRepository: InstallerRepository,
    @InjectRepository(CustomerRepository) private readonly customerRepository: CustomerRepository,
    private readonly logsService: LogsService,
    private readonly mailService: MailService,
  ) {}
  
  async getLoanDetails()
  {
      try {
          const entityManager = getManager();
          let allLoandeatils = await entityManager.query(`select t5."loanId" as loanid,t3.ref_no as appid,t5."legalName" as borrower,
          CONCAT(t5."ownerFirstName", ' ', t5."ownerLastName") AS ownerFullname,t5."owner2Address" as owneraddress,
          t5."businessAddress",t5."batteryManufacturer",t5."inverterManufacturer",
          t5."batteryManufacturer",CONCAT(t4."firstName" , ' ', t4."lastName") AS installer,
          t.filename as filepath,t.originalname as filename,t."updatedAt" as datesubmitted,t3."salesRep" as salesrep
          from tblfiles t 
          join tblcustomer t5 on t5."loanId" =t.link_id 
          join tblloan t3  on t3.id =t.link_id 
          join tbluser t4 on t4.id =t3.user_id 
          where t.services ='salescontract/uploadDocuments' and t3.phase_flag ='Project Setup' ORDER BY t."updatedAt" desc`)


          let completeallLoandeatils = await entityManager.query(`select t5."loanId" as loanid,t3.ref_no as appid,t5."legalName" as borrower,
          CONCAT(t5."ownerFirstName", ' ', t5."ownerLastName") AS ownerFullname,t5."owner2Address" as owneraddress,
          t5."businessAddress",t5."batteryManufacturer",t5."inverterManufacturer",
          t5."batteryManufacturer",CONCAT(t4."firstName" , ' ', t4."lastName") AS installer,
          t.filename as filepath,t.originalname as filename,t."updatedAt" as datesubmitted,t6.status,t3."salesRep" as salesrep
          from tblfiles t 
          join tblcustomer t5 on t5."loanId" =t.link_id 
          join tblloan t3  on t3.id =t.link_id 
          join tbluser t4 on t4.id =t3.user_id 
            left join tblsalescontractreview t6 on t6.loanid = CAST(t5."loanId" as varchar)
          where t.services ='salescontract/uploadDocuments' and t3.phase_flag ='Project Setup' and t6.status ='approved' ORDER BY t."updatedAt" desc`)
          return {
              statusCode:200,
              allLoandeatils,
              completeallLoandeatils, 
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

  async getReview(loanid){
      try{
          let entityManager = getManager();
          let reviewData:any = await entityManager.query(`select * from tblsalescontractreview  where loanid = '${loanid}' AND status='needadditionalinfo' order by "updatedAt" desc;` )
          let reviewLogData:any = await entityManager.query(`select * from tbllog  where loan_id = '${loanid}' and "module" like '%Sales Contract Review%' order by "updatedAt" desc;` )
          let needLoandeatils = await entityManager.query(`select t5."loanId" as loanid,t3.ref_no as appid,t5."legalName" as borrower,
          CONCAT(t5."ownerFirstName", ' ', t5."ownerLastName") AS ownerFullname,t5."owner2Address" as owneraddress,
          t5."businessAddress",t5."batteryManufacturer",t5."inverterManufacturer",
          t5."batteryManufacturer",CONCAT(t4."firstName" , ' ', t4."lastName") AS installer,
          t.filename as filepath,t.originalname as filename,t."updatedAt" as datesubmitted,t6.status,
          t4.ref_no as userRefno,t4.id as userId,t4."mainInstallerId",t3."salesRep" as salesrep
          from tblfiles t 
          join tblcustomer t5 on t5."loanId" =t.link_id 
          join tblloan t3  on t3.id =t.link_id 
          join tbluser t4 on t4.id =t3.user_id 
           left join tblsalescontractreview t6 on t6.loanid = CAST(t5."loanId" as varchar)
          where t.services ='salescontract/uploadDocuments' and t3.phase_flag ='Project Setup' and t6.status ='needadditionalinfo' and t3.id='${loanid}'`)
          let mainLoandeatils = await entityManager.query(`select t5."loanId" as loanid,t3.ref_no as appid,t5."legalName" as borrower,
          CONCAT(t5."ownerFirstName", ' ', t5."ownerLastName") AS ownerFullname,t5."owner2Address" as owneraddress,
          t5."businessAddress",t5."batteryManufacturer",t5."inverterManufacturer",
          t5."batteryManufacturer",CONCAT(t4."firstName" , ' ', t4."lastName") AS installer,
          t.filename as filepath,t.originalname as filename,t."updatedAt" as datesubmitted,t6.status,
          t4.ref_no as userRefno,t4.id as userId,t4."mainInstallerId",t3.ins_user_id,t3."salesRep" as salesrep
          from tblfiles t 
          join tblcustomer t5 on t5."loanId" =t.link_id 
          join tblloan t3  on t3.id =t.link_id 
          join tbluser t4 on t4.id =t3.user_id 
           left join tblsalescontractreview t6 on t6.loanid = CAST(t5."loanId" as varchar)
          where t.services ='salescontract/uploadDocuments' and t3.phase_flag ='Project Setup' and t3.id='${loanid}'`)
         
          //console.log('res',mainLoandeatils)
          let getSendemail =await entityManager.query(`select * from tbluser t where t.id='${mainLoandeatils[0].ins_user_id}'`)
          return {
              statusCode:200,
              data:reviewData,
              reviewLogData,
              needLoandeatils,
              mainLoandeatils,
              getSendemail
          }
      }
      catch(error)
      {
          console.log(error);
          return { "statusCode": 500, "message": ["Invalid UUID"], "error": "Bad Request" };
      }
  }
   
  async addcomments(createsalescontract: CreateSalesContractreviewDto){
      try{

        let salesContractReview = new SalesContractReviewEntity();

        let entityManager = getManager();

        let reviewData:any = await entityManager.query(`select * from tblsalescontractreview  where loanid = '${createsalescontract.loanid}' order by "updatedAt" desc;` )

        salesContractReview.loanid = createsalescontract.loanid
        salesContractReview.comments = createsalescontract.comments

        if(reviewData!=null && reviewData.length > 0){// CHECK WHETHER RECORDS IN TABLE
          //let salescontractreviewdata = await this.SalesContractReviewRepositary.save(salesContractReview)


          const salescontractreviewdataup: any = await this.SalesContractReviewRepositary.update({loanid: createsalescontract.loanid},
            {
                loanid : createsalescontract.loanid,
                comments : createsalescontract.comments,
            }
          )

          const user: any = await this.loanRepository.find({
            select: ['user_id'],
            where: { id: createsalescontract.loanid },
          });


          await this.logsService.log(
            createsalescontract.loanid,
            user[0].user_id,
            'Sales Contract Review Comments Submitted'
          );

          let email =createsalescontract.sendemail
          const data: any ={
             username :createsalescontract.sendname,
             link:process.env.OrkaUrl+'partner',
             message:createsalescontract.comments
           }
   
           this.mailService.requestInfoContractEmail(email,data);

          return {
            statusCode: 200,
            message: "Sales Contract Review Comments Updated",
            salescontractreviewdataup
          }

        

        }else{
          let salescontractreviewdata = await this.SalesContractReviewRepositary.save(salesContractReview);
          const user: any = await this.loanRepository.find({
            select: ['user_id'],
            where: { id: createsalescontract.loanid },
          });


          await this.logsService.log(
            createsalescontract.loanid,
            user[0].user_id,
            'Sales Contract Review Comments Created'
          );

          let email =createsalescontract.sendemail
          const data: any ={
             username :createsalescontract.sendname,
             link:process.env.OrkaUrl+'partner',
             message:createsalescontract.comments
           }
   
           this.mailService.requestInfoContractEmail(email,data);

          return {
            statusCode: 200,
            message: "Sales Contract Review Comments Created",
            salescontractreviewdata
          }

         
        }

        

      }
      catch(error)
      {
          console.log(error);
          return { "statusCode": 500, "message": ["Invalid UUID"], "error": "Bad Request" };
      }

  }

  async putEditDetails(updateSalesContractreviewDto: UpdateSalesContractreviewDto) {
    try {
      const entityManager = getManager();
      const salesContractReview = new SalesContractReviewEntity();
      const reviewData = await entityManager.query(`select * from tblsalescontractreview  where loanid = '${updateSalesContractreviewDto.loanid}' order by "updatedAt" desc;` )
    
      if (updateSalesContractreviewDto.businessborrower == 'Y') {
        salesContractReview.businessborrower = Flags.Y;
      } else {
        salesContractReview.businessborrower =  Flags.N;
      }		

      if (updateSalesContractreviewDto.businessowner == 'Y') {
        salesContractReview.businessowner = Flags.Y;
      } else {
        salesContractReview.businessowner = Flags.N;
      }		

      if (updateSalesContractreviewDto.projectsiteaddress == 'Y') {
        salesContractReview.projectsiteaddress = Flags.Y;
      } else {
        salesContractReview.projectsiteaddress = Flags.N;
      }

      if (updateSalesContractreviewDto.loanamount == 'Y') {
        salesContractReview.loanamount = Flags.Y;
      } else {
        salesContractReview.loanamount = Flags.N;
      }		

      if (updateSalesContractreviewDto.modulemanufacturer == 'Y') {
        salesContractReview.modulemanufacturer = Flags.Y;
      } else {
        salesContractReview.modulemanufacturer = Flags.N;
      }

      if (updateSalesContractreviewDto.invertermanufacturer == 'Y') {
        salesContractReview.invertermanufacturer = Flags.Y;
      } else {
        salesContractReview.invertermanufacturer = Flags.N;
      }

      if (updateSalesContractreviewDto.batterymanufacturer == 'Y') {
        salesContractReview.batterymanufacturer = Flags.Y;
      } else {
        salesContractReview.batterymanufacturer = Flags.N;
      }		

      if (updateSalesContractreviewDto.signaturecheck == 'Y') {
        salesContractReview.signaturecheck = Flags.Y;
      } else {
        salesContractReview.signaturecheck = Flags.N;
      }

      if (updateSalesContractreviewDto.status == 'approved') {
        salesContractReview.status = ContractReviewStatus.approved;
      } else {
        salesContractReview.status =  ContractReviewStatus.needadditionalinfo
      }

      if (reviewData?.length > 0) {
        await this.SalesContractReviewRepositary.update(
          { loanid: updateSalesContractreviewDto.loanid },
          {
            loanid: updateSalesContractreviewDto.loanid,
            businessborrower: salesContractReview.businessborrower,
            businessowner: salesContractReview.businessowner,
            projectsiteaddress: salesContractReview.projectsiteaddress,
            loanamount: salesContractReview.loanamount,
            modulemanufacturer: salesContractReview.modulemanufacturer,
            invertermanufacturer: salesContractReview.invertermanufacturer,
            batterymanufacturer: salesContractReview.batterymanufacturer,
            signaturecheck: salesContractReview.signaturecheck,
            status: salesContractReview.status
          }
        );
        await entityManager.query(
          `
            UPDATE
              tblloan
            SET
              status_flag = 'approved'::tblloan_status_flag_enum::tblloan_status_flag_enum,
              phase_flag = 'Construction'::tblloan_phase_flag_enum::tblloan_phase_flag_enum
            WHERE
              id = $1  
          `,
          [updateSalesContractreviewDto.loanid]
        );
        const user = await this.loanRepository.find({
          select: ['user_id'],
          where: { id: updateSalesContractreviewDto.loanid },
        });

        await this.logsService.log(
          updateSalesContractreviewDto.loanid,
          user[0].user_id,
          'Sales Contract Review updated'
        );

        return {
          statusCode: 200,
          message: "Sales Contract Review updated",
          data: salesContractReview
        }
      } else {
        salesContractReview.loanid = updateSalesContractreviewDto.loanid;

        await this.SalesContractReviewRepositary.save(salesContractReview);

        const loan = await this.loanRepository.findOne({ id: updateSalesContractreviewDto.loanid });

        loan.statusFlag = StatusFlags.approved;
        loan.phaseFlag = PhaseFlag.construction; // Need to check with the client if this is true since at this point the orka CEO hasn't countersigned the contract yet

        await this.loanRepository.save(loan);

        const installer = await this.installerRepository.findOne({ user_id: loan.insUserId });
        const customer = await this.customerRepository.findOne({ loanId: loan.id });
  
        await this.logsService.log(
          updateSalesContractreviewDto.loanid,
          loan.user_id,
          'Sales Contract Review Created'
        );
        await this.mailService.orkaCeofinancingContractMail({
          installerName: installer.businessName,
          customerBusinessName: customer.legalName
        });
        
        return {
          statusCode: 200,
          message: "Sales Contract Review Created",
          data: salesContractReview
        }
      }
    } catch(error) {
      console.log(error);

      return {
        "statusCode": 500,
        "message": [new InternalServerErrorException(error)['response']['name']],
        "error": "Bad Request"
      };
    }
  }

  async getcompleteloanDetails()
    {
        try {
            const entityManager = getManager();
            let allLoandeatils = await entityManager.query(`select t5."loanId" as loanid,t3.ref_no as appid,t5."legalName" as borrower,
            CONCAT(t5."ownerFirstName", ' ', t5."ownerLastName") AS ownerFullname,t5."owner2Address" as owneraddress,
            t5."businessAddress",t5."batteryManufacturer",t5."inverterManufacturer",
            t5."batteryManufacturer",CONCAT(t4."firstName" , ' ', t4."lastName") AS installer,
            t.filename as filepath,t.originalname as filename,t6."updatedAt" as dateapproved,t6."createdAt" as datesubmitted,
            t6.status,t3."salesRep" as salesrep
            from tblfiles t 
            join tblcustomer t5 on t5."loanId" =t.link_id 
            join tblloan t3  on t3.id =t.link_id 
            join tbluser t4 on t4.id =t3.user_id 
            left join tblsalescontractreview t6 on t6.loanid = CAST(t5."loanId" as varchar)
            where t.services ='salescontract/uploadDocuments' and t6.status ='approved' ORDER BY t6."updatedAt" desc`)
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
