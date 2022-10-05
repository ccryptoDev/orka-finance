import { Injectable,InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { getManager, Repository } from 'typeorm'

import { OpportunityDto } from './dto/opportunity.dto';
import { CustomerRepository } from '../../repository/customer.repository';;
import { LoanRepository } from '../../repository/loan.repository';
import { CreateMilestoneDto } from './dto/createmilestone.dto';
import { Milestone } from '../../repository/milestone.repository';
import { MilestoneEntity } from '../../entities/milestone.entity';
import { ProductEntity } from '../../entities/products.entity';
import { FinancingContractInvitationTemplateData, MailService } from '../mail/mail.service';
import { LogsService } from 'src/common/log/logs.service';

@Injectable()
export class OpportunityService {
  constructor(
    @InjectRepository(Milestone) private readonly MilestoneRepository: Milestone,
    @InjectRepository(CustomerRepository) private readonly customerRepository: CustomerRepository,
    @InjectRepository(LoanRepository) private readonly loanRepository: LoanRepository,
    @InjectRepository(ProductEntity) private readonly productRepository: Repository<ProductEntity>,
    private readonly mailService: MailService,
    private readonly logsService: LogsService,
  ) {}

  public async getLoanProductsDetails(id:string)
  {
      try {
          const entityManager = getManager();
          let loanProducts = await entityManager.query(`select t2."productId", t2.name, t2."type" , t2."tenorMonths", t2."tenorYears", t2."interestBaseRate", t2."achDiscount", t2."achDiscountInterestRate", t2."dealerFee", t2."originationFee",t2.prepayment_flag, t2.prepayment, t2."prepaymentMonth", t2.downpayment, t2."mpfAchWItcPrepay",t2."mpfAchWOPrepay", t2."mpfCheckWItcPrepay", t2."mpfCheckWOPrepay"  from tblpartnerproduct t1 join tblproduct t2 on t1."productId"  = t2."productId" where t1."installerId" ='${id}' and t1.active_flag ='Y' and t2.status ='ACTIVE'`)
          return {
              statusCode:200,
              loanProducts
          }
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
  
  public  async getLoanDetails(id:string)
    {
        try {
            const entityManager = getManager();
            let customerFinanceDetails = await entityManager.query(`select t1.phase_flag ,t1.status_flag , t2."legalName", t2."ownerFirstName",t2."ownerLastName", t2.email,t2."city",t2."state",t2."zipCode", t2."businessPhone", t2."businessAddress", t1.phase_flag,  t1.status_flag, t1."financingRequested", t1."financingTermRequested",t2."loanProductID",t1.ref_no, t1."apr" from tblloan t1 join tblcustomer t2 on t1.id=t2."loanId" where t2."loanId"='${id}'`)
            let siteProjectDetails = await entityManager.query(`select "city","state","zipCode","businessInstallAddress","businessInstallCity","businessInstallState","businessInstallZipCode","businessInstallLat","businessInstallLng","siteType","electricCompany","avgUtilPerMonth","avgConsumptionPerMonth","arraySize","panelManufacturer","inverterNamePlateCapacity","inverterManufacturer","batteryCapacity","batteryManufacturer", "mountType", "estGenerationRate","estGeneration","nonSolarEquipmentWork","nonSolarProjectCost","totalProjectCost" from tblcustomer where "loanId"='${id}'`)
            let activity = await entityManager.query(`select CONCAT ('LOG_',t.id) as id, t.module as module, concat(t3.email,' - ',INITCAP(t4."name"::text)) as user, t."createdAt" as createdAt from tbllog t join tblloan t2 on t.loan_id = t2.id left join tbluser t3 on t3.id = t.user_id left join tblroles t4 on t4.id = t3."role" where t.loan_id='${id}'`)
            let batteryManufaturer = await entityManager.query(`select value from tbldropdown where mainfield = 'batteryManufacturer'`);
            let inverterManufacturer = await entityManager.query(`select value from tbldropdown where mainfield = 'inverterManufacturer'`);
            let mountType = await entityManager.query(`select value from tbldropdown where mainfield = 'mountType'`);
            let panelManufacturer = await entityManager.query(`select value from tbldropdown where mainfield = 'panelManufacturer'`)
            let loanProducts = await entityManager.query(`select t2."productId", t2.name, t2."type" , t2."tenorMonths", t2."tenorYears", t2."interestBaseRate", t2."achDiscount", t2."achDiscountInterestRate", t2."dealerFee", t2."originationFee",t2.prepayment_flag, t2.prepayment, t2."prepaymentMonth", t2.downpayment, t2."mpfAchWItcPrepay",t2."mpfAchWOPrepay", t2."mpfCheckWItcPrepay", t2."mpfCheckWOPrepay"  from tblpartnerproduct t1 join tblproduct t2 on t1."productId"  = t2."productId" where t1."installerId" ='${id}' and t1.active_flag ='Y' and t2.status ='ACTIVE'`)
            let contractReviewComments = await entityManager.query(`select comments, "updatedAt" from tblsalescontractreview WHERE loanid='${id}' AND status='needadditionalinfo'`)
            let milestoneReviewComments = await entityManager.query(`select comments,milestone,status from tblmilestone WHERE loanid='${id}'`)

            let selectedProduct = await entityManager.query(`select t2."productId", t2.name, t2."type" , t2."tenorMonths", t2."tenorYears", t2."interestBaseRate", 
            t2."achDiscount", t2."achDiscountInterestRate", t2."dealerFee", t2."originationFee",
            t2.prepayment_flag, t2.prepayment, t2."prepaymentMonth", t2.downpayment,
            t2."mpfAchWItcPrepay",t2."mpfAchWOPrepay", t2."mpfCheckWItcPrepay", 
            t2."mpfCheckWOPrepay", lm."financingApproved"  
            from tblloan tln join tblproduct t2 on CAST(tln."productId"  as int) = t2."productId"
            join tbllendinglimit lm on lm."loanId"=tln.id AND lm."productId"=tln."productId" where tln.id='${id}' `)
            
            return {
                statusCode:200,
                customerFinanceDetails,
                siteProjectDetails,
                batteryManufaturer,
                inverterManufacturer,
                mountType,
                panelManufacturer,
                activity,
                loanProducts,
                contractReviewComments,
                milestoneReviewComments,
                selectedProduct
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
  

  public async putDetails(id: string, opportunityDto: OpportunityDto) {
    try {
      let product: ProductEntity;
      let loanFee: string;
    
      await this.loanRepository.update(
        { id },
        {
          financingRequested: opportunityDto.financingRequested,
          financingTermRequested: opportunityDto.financingTermRequested
        }
      );
      await this.customerRepository.update(
        { loanId: id },
        {
          legalName: opportunityDto.legalName,
          ownerFirstName: opportunityDto.ownerFirstName,
          ownerLastName: opportunityDto.ownerLastName,
          email: opportunityDto.email,
          businessPhone: opportunityDto.businessPhone,
          businessAddress: opportunityDto.businessAddress,
          city: opportunityDto.city,
          state: opportunityDto.state,
          zipCode: opportunityDto.zipcode,
          businessInstallAddress: opportunityDto.businessInstallAddress,
          businessInstallCity: opportunityDto.businessInstallCity,
          businessInstallState: opportunityDto.businessInstallState,
          businessInstallZipCode: opportunityDto.businessInstallZipCode,
          siteType: opportunityDto.siteType,
          electricCompany: opportunityDto.electricCompany,
          avgUtilPerMonth: opportunityDto.avgUtilPerMonth,
          avgConsumptionPerMonth: opportunityDto.avgConsumptionPerMonth,
          arraySize: opportunityDto.arraySize,
          panelManufacturer: opportunityDto.panelManufacturer,
          inverterNamePlateCapacity: opportunityDto.inverterNamePlateCapacity,
          inverterManufacturer: opportunityDto.inverterManufacturer,
          batteryCapacity: opportunityDto.batteryCapacity,
          batteryManufacturer: opportunityDto.batteryManufacturer,
          mountType: opportunityDto.mountType,
          estGenerationRate: opportunityDto.estGenerationRate,
          estGeneration: opportunityDto.estGeneration,
          nonSolarEquipmentWork: opportunityDto.nonSolarEquipmentWork,
          nonSolarProjectCost: opportunityDto.nonSolarProjectCost,
          totalProjectCost: opportunityDto.totalProjectCost,
          businessInstallLat: opportunityDto.lat,
          businessInstallLng: opportunityDto.lng,
          loanProductID: opportunityDto.productID
        }
      );

      if (opportunityDto.productID) {
        product = await this.productRepository.findOne({ productId: Number(opportunityDto.productID) });
        loanFee = String(Number(product.originationFee) * Number(opportunityDto.financingRequested) / 100);

        await this.loanRepository.update(
          { id },
          {
            productId: opportunityDto.productID,
            originationFee: loanFee,
            interestRate: product.interestBaseRate
          }
        );
      }

      return{
        statusCode: 200,
        message: ['Changes Saved']
      };
    } catch (error) {
      let resp = new InternalServerErrorException(error).getResponse();

      if (Object.keys(resp).includes('name')) {
        resp = Object.values(resp)[Object.keys(resp).indexOf('name')];
      }

      return {
        statusCode: 500,
        message: [resp],
        error: 'Bad Request'
      };
    }
  }

  public async addmilestone(createMilestone : CreateMilestoneDto){
      try{

          let milestone = new MilestoneEntity();
          let entityManager = getManager();
  
          milestone.loanid = createMilestone.loanid;
          milestone.ref_no = createMilestone.ref_no;
          milestone.milestone = createMilestone.milestone;

          let reviewData:any = await entityManager.query(`select * from tblmilestone
          where loanid = '${createMilestone.loanid}' AND milestone ='${createMilestone.milestone}'` )

          if(reviewData!=null && reviewData.length > 0){// CHECK WHETHER RECORDS IN TABLE
              const milestonereviewdataup: any = await this.MilestoneRepository.update({loanid: createMilestone.loanid},
                  {
                      loanid : createMilestone.loanid,
                      milestone : createMilestone.milestone,
                  }
              )

              const user: any = await this.loanRepository.find({
                  select: ['user_id'],
                  where: { id: createMilestone.loanid },
                  });
      
      
                  // await this.logsService.log(
                  // createMilestone.loanid,
                  // user[0].user_id,
                  // 'Milestone Updated'
                  // );
      
                  return {
                  statusCode: 200,
                  message: "Milestone Updated",
                  milestonereviewdataup
                  }
          }else{
          
              let milestonedata = await this.MilestoneRepository.save(milestone)

              const user: any = await this.loanRepository.find({
                  select: ['user_id'],
                  where: { id: createMilestone.loanid },
                  });
      
      
                  // await this.logsService.log(
                  // createMilestone.loanid,
                  // user[0].user_id,
                  // 'Milestone created'
                  // );
      
                  return {
                  statusCode: 200,
                  message: "Milestone created",
                  milestonedata
                  }
          }
  
          
        }
        catch(error)
        {
            console.log(error);
            return { "statusCode": 500, "message": ["Invalid UUID"], "error": "Bad Request" };
        }

  }

  public async putDetailscomments(loanid){
      // let cur_date = new Date().toLocaleDateString();
      // let cur_date = new Date().toLocaleDateString();
      let cur_date = new Date().toLocaleDateString();
      // let date_for = (cur_date.format("DD-MM-YYYY h:mm:ss"));
      let entityManager = getManager();
      try{
      const updateComment = await entityManager.query(`UPDATE tblsalescontractreview SET comments='',"updatedAt" = '${cur_date}' WHERE loanid='${loanid}'`)
      return {
          statusCode: 200,
          message: "comments updated",
          
      };
      
  }
      catch(error)
      {
          console.log(error);
          return { "statusCode": 500, "message": ["Invalid UUID"], "error": "Bad Request" };
      }
  }

  public async sendFinancingContractMail(loanId: string): Promise<void> {
    const loan = await this.loanRepository.findOne({ id: loanId });

    if (!loan) {
      throw new NotFoundException({
        statusCode: 404,
        message: 'Loan not found'
      });
    }

    const customer = await this.customerRepository.findOne({ loanId });
    const templateData: FinancingContractInvitationTemplateData = {
      businessName: customer.legalName,
      firstName: customer.ownerFirstName,
      financingContract: `${process.env.OrkaUrl}borrower`
    };

    await this.mailService.financingContractMail(customer.email, templateData);
  }
}
