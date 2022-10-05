import { Injectable,InternalServerErrorException  } from '@nestjs/common';
import {ActiveInactiveDto} from './dto/activeInactive.dto'
import { getManager } from 'typeorm';
import {ProductEntity,LoanProdStatus} from 'src/entities/products.entity'
import {LogEntity} from 'src/entities/log.entity'
import {Installer} from 'src/entities/installer.entity'
import {PartnerProductEntity} from 'src/entities/partnerProducts.entity'
import { UserEntity} from '../../entities/users.entity';
import { ProductRepository } from 'src/repository/products.repository';
import { PartnerProductRepository } from 'src/repository/partnerProduct.repository'; 
import { LogRepository} from '../../repository/log.repository';
import { UserRepository} from '../../repository/users.repository';
import { InstallerRepository } from 'src/repository/installer.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { Flags } from 'src/configs/config.enum';
import { LogsService } from 'src/common/logs/logs.service';
import {ProductLogRepository} from 'src/repository/productLog.repository';
import { AddLoanProductsDto } from './dto/add.dto';
import { EditLoanProductsDto } from './dto/edit.dto';
import { ProductActiveInactiveDto } from './dto/productactiveinactive.dto';
import { setFlagsFromString } from 'v8';


@Injectable()
export class LoanproductsService {
  constructor(
    @InjectRepository(ProductRepository) private readonly loanProductRepository:ProductRepository,
    @InjectRepository(InstallerRepository) private readonly installerRepository:InstallerRepository,
    @InjectRepository(PartnerProductRepository) private readonly partnerLoanProductRepository:PartnerProductRepository,
    @InjectRepository(ProductLogRepository) private readonly productLogRepository:ProductLogRepository,
    @InjectRepository(ProductRepository) private readonly productsRepositary:ProductRepository,
    private readonly logsService: LogsService,
  ){}

  async activateDeactivate(activeInactiveDto:ActiveInactiveDto)
  {
      try {

          let installer: any = await this.installerRepository.find({select:['businessName'],where:{user_id:activeInactiveDto.installerId}})
          //For Activating a product
          if(activeInactiveDto.status=='Y')
          {
              //check whether the same product exists or not. If yes update will happen else new entry will be done
              let product:any = await this.partnerLoanProductRepository.find({select:['productId','active_flag'],where:{installerId:activeInactiveDto.installerId, productId:activeInactiveDto.productId}})
              if(product.length>0)
              {
                  let productInfo:any = await this.partnerLoanProductRepository.update({productId:activeInactiveDto.productId,installerId:activeInactiveDto.installerId},{active_flag:Flags.Y})
                  let message = `Product ${activeInactiveDto.productId} is Activated for ${installer[0].businessName}`
                  this.logsService.productLog(activeInactiveDto.installerId,activeInactiveDto.userId,message)
                  return {
                      statusCode: 200,
                      message: "Product Activated",
                  }
              }
              else{
                  const newProduct = new PartnerProductEntity();
                  
                  newProduct.installerId = activeInactiveDto.installerId;
                  newProduct.productId = activeInactiveDto.productId;
                  newProduct.active_flag = Flags.Y;
                  
                  this.partnerLoanProductRepository.save(newProduct);
                  
                  let message = `Product ${activeInactiveDto.productId} is Activated for ${installer[0].businessName}`
                  this.logsService.productLog(activeInactiveDto.installerId,activeInactiveDto.userId,message)

                  return {
                      statusCode: 200,
                      message: "Product Activated",
                  }


              }
          }
          else if(activeInactiveDto.status=='N')//for deactivating the product
          {
              // if the product assigned already we will update to deactivate else error message will be sent
              let product:any = await this.partnerLoanProductRepository.find({select:['productId','active_flag'],where:{installerId:activeInactiveDto.installerId, productId:activeInactiveDto.productId}})
              if(product.length>0)
              {
                  let productInfo:any = await this.partnerLoanProductRepository.update({productId:activeInactiveDto.productId,installerId:activeInactiveDto.installerId},{active_flag:Flags.N})
                  let message = `Product ${activeInactiveDto.productId} is Deactivated for ${installer[0].businessName}`
                  this.logsService.productLog(activeInactiveDto.installerId,activeInactiveDto.userId,message)
                  return {
                      statusCode: 200,
                      message: "Product Deactivated",
                  }
              }
              else{
                  return {
                      statusCode: 200,
                      message: "Enable the product to Deactivate",
                  }


              }
          }
          
      } catch (error) {
          console.log(error);
          return { "statusCode": 500, "message": [new InternalServerErrorException(error)['response']['name']], "error": "Bad Request" };
      }
  }

  async productactivateDeactivate(productActiveInactiveDto:ProductActiveInactiveDto)
  {
      const entityManager = getManager();
      try {
          
          if(productActiveInactiveDto.status=='ACTIVE'){
              const update_product = await entityManager.query(`update  tblproduct  set status='ACTIVE' where "productId" =${productActiveInactiveDto.productId}`);

              return {
                  statusCode: 200,
                  message: "Product Activated",
              }
          }else if(productActiveInactiveDto.status=='INACTIVE'){
              const update_product = await entityManager.query(`update  tblproduct  set status='INACTIVE' where "productId" =${productActiveInactiveDto.productId}`);

              return {
                  statusCode: 200,
                  message: "Product Deactivated",
              }
          }else{
              return {
                  statusCode: 200,
                  message: "Product Updated Error",
              }
          }
          
      } catch (error) {
          console.log(error);
          return { "statusCode": 500, "message": [new InternalServerErrorException(error)['response']['name']], "error": "Bad Request" };
      }
  }

  async add(addLoanProductsDto: AddLoanProductsDto) {
    try {
      const loanproducts = new ProductEntity

      loanproducts.name = addLoanProductsDto.name;
      loanproducts.type = addLoanProductsDto.type;
      loanproducts.tenorMonths = addLoanProductsDto.tenorMonths;
      loanproducts.tenorYears = addLoanProductsDto.tenorYears;
      loanproducts.interestBaseRate = addLoanProductsDto.interestBaseRate;
      loanproducts.achDiscount = addLoanProductsDto.achDiscount;
      loanproducts.achDiscountInterestRate = addLoanProductsDto.achDiscountInterestRate;
      loanproducts.dealerFee = addLoanProductsDto.dealerFee;
      loanproducts.originationFee = addLoanProductsDto.originationFee;
      loanproducts.prepayment = addLoanProductsDto.prepayment;
      loanproducts.prepaymentMonth = addLoanProductsDto.prepaymentMonth;
      loanproducts.downpayment = addLoanProductsDto.downpayment;
      loanproducts.mpfAchWItcPrepay = addLoanProductsDto.mpfAchWItcPrepay;
      loanproducts.mpfAchWOPrepay = addLoanProductsDto.mpfAchWOPrepay;
      loanproducts.mpfCheckWItcPrepay = addLoanProductsDto.mpfCheckWItcPrepay;
      loanproducts.mpfCheckWOPrepay = addLoanProductsDto.mpfCheckWOPrepay;
      loanproducts.flexReamPrepayAmount  = addLoanProductsDto.flexReamPrepayAmount
      loanproducts.flexReamPrepayPercentofPrincipal  = addLoanProductsDto.flexReamPrepayPercentofPrincipal
      loanproducts.flexReamMaxAnnualFrequency  = addLoanProductsDto.flexReamMaxAnnualFrequency
      loanproducts.phase = addLoanProductsDto.phase;
      loanproducts.startDate = addLoanProductsDto.startDate;
      loanproducts.endDate = addLoanProductsDto.endDate;

      this.productsRepositary.save(loanproducts);

      return {
        statusCode: 200,
        message: "Loan Products Saved",
      };
    } catch (error) {
      console.log(error);

      return { "statusCode": 500, "message": [new InternalServerErrorException(error)['response']['name']], "error": "Bad Request" };      
    }
  }

  async get(){
      const entityManager = getManager();
      try{
          const rawData = await entityManager.query(`select * from tblproduct order by "createdAt" desc `);
          console.log(rawData)
          return {"statusCode": 200, data:rawData };
      }catch (error) {
          return {"statusCode": 500, "message": [new InternalServerErrorException(error)['response']['name']], "error": "Bad Request"};
      }

  }

  async getProductsIdlist(pid){
      try{
          let products:any = await this.loanProductRepository.find({where:{productId:pid}});
          return {
              statusCode:200,
              data:products
          }

      }catch (error) {
          return {"statusCode": 500, "message": [new InternalServerErrorException(error)['response']['name']], "error": "Bad Request"};
      }
  }

  async getProducts(installerId)
  {
      try{
          let products:any = await this.loanProductRepository.find({where:{status:LoanProdStatus.active}});
          let activeProducts:any = await this.partnerLoanProductRepository.find({select:['productId'],where:{installerId:installerId,active_flag:Flags.Y}})
          let productDetails:[];

          for(let i=0;i<products.length;i++)
          {
              let flag=true
              for(let j=0;j<activeProducts.length;j++)
              {
                  if(products[i].productId==activeProducts[j].productId)
                  {
                      products[i]['partnerStatus']='Y';
                      flag=false
                  }
              }
              if(flag)
                  products[i]['partnerStatus']='N'

          }
          return {
              statusCode:200,
              data:products
          }
      }
      catch(error)
      {
          console.log(error);
          return { "statusCode": 500, "message": [new InternalServerErrorException(error)['response']['name']], "error": "Bad Request" };
      }
  }

  async putEditDetails(editLoanProductsDto: EditLoanProductsDto) {
    try {
      const loanproductsInfo: any = await this.productsRepositary.update(
        { productId: editLoanProductsDto.productId },
        {
          name:editLoanProductsDto.name,
          type:editLoanProductsDto.type,
          tenorMonths:editLoanProductsDto.tenorMonths,
          tenorYears:editLoanProductsDto.tenorYears,
          interestBaseRate:editLoanProductsDto.interestBaseRate,
          achDiscount:editLoanProductsDto.achDiscount,
          achDiscountInterestRate:editLoanProductsDto.achDiscountInterestRate,
          dealerFee:editLoanProductsDto.dealerFee,
          originationFee:editLoanProductsDto.originationFee,
          prepayment:editLoanProductsDto.prepayment,
          prepaymentMonth:editLoanProductsDto.prepaymentMonth,
          downpayment:editLoanProductsDto.downpayment,
          mpfAchWItcPrepay:editLoanProductsDto.mpfAchWItcPrepay,
          mpfAchWOPrepay:editLoanProductsDto.mpfAchWOPrepay,
          mpfCheckWItcPrepay:editLoanProductsDto.mpfCheckWItcPrepay,
          mpfCheckWOPrepay:editLoanProductsDto.mpfCheckWOPrepay,
          flexReamPrepayAmount:editLoanProductsDto.flexReamPrepayAmount,
          flexReamPrepayPercentofPrincipal:editLoanProductsDto.flexReamPrepayPercentofPrincipal,
          flexReamMaxAnnualFrequency:editLoanProductsDto.flexReamMaxAnnualFrequency,
          phase:editLoanProductsDto.phase,
          startDate:editLoanProductsDto.startDate,
          endDate:editLoanProductsDto.endDate
        }
      );

      return {
        statusCode: 200,
        message: "Loan Products updated",
        data: [loanproductsInfo]
      };
    } catch (error) {
      console.log(error);

      return { "statusCode": 500, "message": [new InternalServerErrorException(error)['response']['name']], "error": "Bad Request" };
    }
  }

  async getLogs(installerId){
      try{
          let entityManager = getManager();
          let logs:any = await entityManager.query(`select CONCAT ('LOG_',t.id) as id,t.installer_id, t.activity , concat(t2.email,' - ',INITCAP(r."name"::text)) as user, t."createdAt" as createdAt from tblproductlog t  join tbluser t2 on t2.id = t.user_id join tblroles r on r.id = t2.role where t.installer_id  = '${installerId}' order by t."createdAt" desc;` )
          return {
              statusCode:200,
              data:logs
          }
      }
      catch(error)
      {
          console.log(error);
          return { "statusCode": 500, "message": ["Invalid UUID"], "error": "Bad Request" };
      }
  }
}
