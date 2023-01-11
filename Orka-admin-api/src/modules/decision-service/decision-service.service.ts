import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { getManager, In, Repository } from 'typeorm';

import { Loan } from '../../entities/loan.entity';
import { UserEntity } from '../../entities/users.entity';
import { PartnerProductEntity } from '../../entities/partnerProducts.entity';
import { LoanProdStatus, ProductEntity } from '../../entities/products.entity';
import { CustomerEntity } from '../../entities/customer.entity';
import { Creditreport } from '../../entities/creditReport.entity';
import { LendingLimitEntity } from '../../entities/lendingLimit.entity';
import { PlaidService } from '../plaid/plaid.service';
import { MailService } from '../../mail/mail.service';
import { Flags } from '../../configs/config.enum';
import { LoanOpsChangeStatusDto } from './dto/loanops-change-status.dto';
import { QaLendingDto } from './dto/qa-lending.dto';
import { EquifaxCommercialReportPayload, EquifaxConsumerReportPayload } from '../equifax/equifax.service';
import { ComplyAdvantageReportPayload } from '../../entities/complyAdvantage.entity';
import { MiddeskReportPayload, MiddeskReportTasksStatuses } from 'src/entities/middesk.entity';

export interface Decision {
  situation: Situation;
  ruleResults: RuleResult[];
}
export interface RuleResult {
  RuleId: number;
  Rule: string;
  RuleMessage: string;
  RuleStatus: RuleStatus;
}
export enum Situation {
  Approved = 'approved',
  Declined = 'declined',
  Review = 'review'
}
enum RuleStatus {
  ByPass = 'BYPASS',
  Fail = 'FAIL',
  Pass = 'PASS'
}
interface Rule {
  id: number;
  criteria: number | string | boolean;
  declinedIf: string;
  description: string;
  isNullAllowed?: boolean;
  needReview: boolean;
  partOfResultingMessage: string;
  shouldDecline: boolean;
  valueSource: string;
}
interface RuleSources {
  [key: string]: any;
}

@Injectable()
export class DecisionServiceService {
  constructor(
    @InjectRepository(Loan)
    private readonly loanRepository: Repository<Loan>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(PartnerProductEntity)
    private readonly partnerProductRepository: Repository<PartnerProductEntity>,
    @InjectRepository(ProductEntity)
    private readonly productRepository: Repository<ProductEntity>,
    @InjectRepository(CustomerEntity)
    private readonly customerRepository: Repository<CustomerEntity>,
    @InjectRepository(LendingLimitEntity)
    private readonly lendingLimitRepository: Repository<LendingLimitEntity>,
    private readonly plaidService: PlaidService, 
    private readonly mailService: MailService
  ) {}

  public async setLendingLimitPersonalGuarantor(
    loanId: string,
    consumerReport: EquifaxConsumerReportPayload
  ): Promise<LendingLimitEntity> {
    const loan = await this.loanRepository.findOne({ id: loanId });
    const salesRepUser = await this.userRepository.findOne({ id: loan.salesRepId });
    const partnerNonActivatedProducts = await this.partnerProductRepository.find({
      installerId: salesRepUser.mainInstallerId || salesRepUser.id,
      active_flag: Flags.N
    });
    const products = await this.productRepository.find({ status: LoanProdStatus.active });
    const customer = await this.customerRepository.findOne({ loanId });
    const mpfCheckWOPrepay = products.map((ele) => Number(ele.mpfCheckWOPrepay));
    const annualIncomeStated = Number(customer.ownerAnnualIncome);
    const financingAmountRequested = Number(loan.financingRequested);
    const creditScore = consumerReport.consumers.equifaxUSConsumerCreditReport[0].models?.[0].score || 0;
    const reportAttributes = consumerReport.consumers.equifaxUSConsumerCreditReport[0].attributes?.[0].attributes || [];
    const annualIncomeModeled = Number(reportAttributes.find((attribute) => attribute.identifier === '6028')?.value || 0) * 12;
    const nonOrkaAnnualDebt = Number(reportAttributes.find((attribute) => attribute.identifier === '6031')?.value || 0) * 12;
    const minAvgCashBalance = 6;

    loan.annualIncomeModeled = String(annualIncomeModeled);
    loan.nonOrkaDebt = String(nonOrkaAnnualDebt);
    loan.minMonthlyAverageBankBalance = String(minAvgCashBalance);

    await this.loanRepository.save(loan);

    const personalGuarantorLimitsModeled = this.getIncomeLendingLimit(
      mpfCheckWOPrepay,
      nonOrkaAnnualDebt,
      annualIncomeModeled
    );
    const personalGuarantorLimitsStated = this.getIncomeLendingLimit(
      mpfCheckWOPrepay,
      nonOrkaAnnualDebt,
      annualIncomeStated
    );
    const businessBorrowerLimit = await this.getBusinessBorrowerLendingLimit(loanId, mpfCheckWOPrepay);
    const ficoFlagCheck = (creditScore >= 680 && creditScore <= 699) ? 1 : 0;
    const productIds: number[] = [];
    const productNames: string[] = [];
    const totalFinancingRequestByProduct: number[] = [];
    const statedIncomeVsModeledIncome = (annualIncomeStated > annualIncomeModeled) ? 1 : 0;
    const modeledIncomeVsTotalFinancingRequested: number[] = [];
    const modeledIncomeVsBusinessLendingLimit: number[] = [];
    const requiredToVerifyStatedIncome: number[] = [];
    const lendingLimit: number[] = [];
    const adjLendingLimit: number[] = [];
    const financingApproved: number[] = [];
    const lendingLimitInstances: LendingLimitEntity[] = [];

    products.forEach((product, index) => {
      const { originationFee } = product;
      const totalFinancingRequested = originationFee ?
        financingAmountRequested + (Number(originationFee) * financingAmountRequested / 100) :
        financingAmountRequested;

      totalFinancingRequestByProduct.push(totalFinancingRequested);
      productIds.push(product.productId);
      productNames.push(product.name);

      if (personalGuarantorLimitsModeled[index] < totalFinancingRequested) {
        modeledIncomeVsTotalFinancingRequested.push(1);
      } else {
        modeledIncomeVsTotalFinancingRequested.push(0);
      }

      if (personalGuarantorLimitsModeled[index] < businessBorrowerLimit[index]) {
        modeledIncomeVsBusinessLendingLimit.push(1);
      } else {
        modeledIncomeVsBusinessLendingLimit.push(0);
      }

      if ((statedIncomeVsModeledIncome * ficoFlagCheck * modeledIncomeVsTotalFinancingRequested[index] * modeledIncomeVsBusinessLendingLimit[index]) === 1) {
        requiredToVerifyStatedIncome.push(1);
      } else {
        requiredToVerifyStatedIncome.push(0);
      }

      if (ficoFlagCheck === 0) {
        lendingLimit.push(businessBorrowerLimit[index]);
      } else {
        if (requiredToVerifyStatedIncome[index] === 0) {
          const minOfAll = Math.min(personalGuarantorLimitsModeled[index], businessBorrowerLimit[index]);
          
          lendingLimit.push(minOfAll);
        } else {
          const minOfAll = Math.min(personalGuarantorLimitsStated[index], businessBorrowerLimit[index]);

          lendingLimit.push(minOfAll);
        }
      }

      if (lendingLimit[index] >= 25000 && lendingLimit[index] <= 1000000) {
        adjLendingLimit.push(lendingLimit[index]);
      } else {
        adjLendingLimit.push(0);
      }

      financingApproved.push(
        creditScore < 680 ?
        0 :
        Math.min(adjLendingLimit[index], totalFinancingRequested)
      );

      const lendingLimitInstance = new LendingLimitEntity();

      lendingLimitInstance.loanId = loanId;
      lendingLimitInstance.productId = String(product.productId);
      lendingLimitInstance.personalGuarantorLimitModeled = String(personalGuarantorLimitsModeled[index]);
      lendingLimitInstance.personalGuarantorLimitStated = String(personalGuarantorLimitsStated[index]);
      lendingLimitInstance.businessBorrowerLimit = String(businessBorrowerLimit[index]);
      lendingLimitInstance.totalFinancingRequested = String(totalFinancingRequested);
      lendingLimitInstance.financingAmountRequested = String(financingAmountRequested);
      lendingLimitInstance.lendingLimit = String(lendingLimit[index]);
      lendingLimitInstance.financingApproved = String(financingApproved[index]);
      lendingLimitInstance.adjLendingLimit = String(adjLendingLimit[index]);
      lendingLimitInstance.requiredToVerifyStatedIncome = String(requiredToVerifyStatedIncome[index]);
      lendingLimitInstance.productName = product.name;

      lendingLimitInstances.push(lendingLimitInstance);
    });

    await this.lendingLimitRepository.update({ loanId }, { deleteFlag: Flags.Y });
    await this.lendingLimitRepository.save(lendingLimitInstances);
    await this.lendingLimitRepository.update(
      {
        productId: In(partnerNonActivatedProducts.map((partnerProduct) => String(partnerProduct.productId)))
      },
      {
        partnerActivatedProduct: Flags.N
      }
    );

    return lendingLimitInstances.find((lendingLimit) => lendingLimit.productId === loan.productId);
  }

  public async qaLendingLimit(qaLendingDto: QaLendingDto) {
    const entityManager = getManager();
    const minAvgCashBalance = 6;
    const AnnualDtiThreshold = 60; //percentage common for every thing
    const ficoFlag = qaLendingDto.personalGuarantorFico;
    const financingAmountRequested = qaLendingDto.financingRequested;
    const AnualIncomeModeled = qaLendingDto.personalGuarantorEquifaxModeledIncome;
    const AnualIncomeStated = qaLendingDto.personalGuarantorStatedIncome;
    const NonOrkaAnnualDedt = qaLendingDto.personalGuarantorNonOrkaMonthlyDebtAmount * 12;
    const lowestMonthlyAvgBalance = qaLendingDto.businessLastTwelveMonthsBankBalances;
    const achEnabledFlag = qaLendingDto.achEnabled;
    const products = await entityManager.query(`SELECT * FROM tblproduct WHERE status = 'ACTIVE'`);
    const listOfTheRelevantProductsUsed = []
    const mpfAchWOPrepay = products.map((ele) => Number(ele.mpfAchWOPrepay));
    const mpfCheckWOPrepay = products.map((ele) => Number(ele.mpfCheckWOPrepay));
    const originationFee = products.map((ele) => Number(ele.originationFee));
    const originationFeeAmount = originationFee.map((fee) => fee * financingAmountRequested / 100);

    for (let i = 0; i < products.length; i++) {
      const details = {};

      details["ID"] = Number(products[i].productId);
      details["TermLength"] = Number(products[i].tenorMonths);
      details["OriginationFee"] = Number(products[i].originationFee);
      details["InterestRateAch"] = Number(products[i].achDiscountInterestRate);
      details["InterestRateCheck"] = Number(products[i].interestBaseRate);
      details["OriginationFeeAmount"] = Number(originationFeeAmount[i]);
      details["MonthlyPaymentFactorCheckWithoutPrepayPaymentFactor"] = Number(products[i].mpfCheckWOPrepay);
      details["MonthlyPaymentFactorAchWithoutPrepayPaymentFactor"] = Number(products[i].mpfAchWOPrepay);

      listOfTheRelevantProductsUsed.push(details);
    }

    const totalFinancingRequested = originationFee.map((fee) => (
      fee === 0 ? financingAmountRequested : financingAmountRequested + (fee * financingAmountRequested / 100)
    ));

    // Stated calculation
    const AnnualDebtThresholdStated = AnualIncomeStated * AnnualDtiThreshold / 100;
    const RemainingMonthlyDebtLimitStated = Number(((AnnualDebtThresholdStated - NonOrkaAnnualDedt) / 12).toFixed(2));
    const ResultingLendingLimitByProductStatedDisplay = [];
    const ResultingLendingLimitByProductStated = (achEnabledFlag ? mpfAchWOPrepay : mpfCheckWOPrepay)
      .map((ele) => {
        const finalRes = this.roundDown(String((RemainingMonthlyDebtLimitStated / ele) * 100));

        ResultingLendingLimitByProductStatedDisplay.push(this.changeAmtVal(finalRes));

        return Number(finalRes);
      });
    const pgDtiTestStatedIncome = {
      pgMonthlyDebtThreshold: this.changeAmtVal(this.roundDown(String(AnnualDebtThresholdStated / 12))),
      remainingMonthlyDebitLimit: this.changeAmtVal(this.roundDown(String(RemainingMonthlyDebtLimitStated))),
      resultingLendingLimitByProduct: ResultingLendingLimitByProductStatedDisplay
    };

    // Modeled calculation
    const AnnualDebtThresholdModeled = AnualIncomeModeled * AnnualDtiThreshold / 100;
    const RemainingMonthlyDebtLimitModeled = Number(((AnnualDebtThresholdModeled - NonOrkaAnnualDedt) / 12).toFixed(2));
    const ResultingLendingLimitByProductModeledDisplay = [];
    const ResultingLendingLimitByProductModeled = (achEnabledFlag ? mpfAchWOPrepay : mpfCheckWOPrepay)
      .map((ele) => {
        const finalRes = this.roundDown(String((RemainingMonthlyDebtLimitModeled / ele) * 100));

        ResultingLendingLimitByProductModeledDisplay.push(this.changeAmtVal(finalRes));

        return Number(finalRes);
      });
    const pgDtiTestModeledIncome = {
      pgMonthlyDebtThreshold: this.changeAmtVal(this.roundDown(String(AnnualDebtThresholdModeled / 12))),
      remainingMonthlyDebitLimit: this.changeAmtVal(this.roundDown(String(RemainingMonthlyDebtLimitModeled))),
      resultingLendingLimitByProduct: ResultingLendingLimitByProductModeledDisplay
    };

    // Business lending limit
    const maxMonthlyLoanPayment = Number((lowestMonthlyAvgBalance / minAvgCashBalance).toFixed(2));
    const businessLendingLimitDisplay = [];
    const businessLendingLimit = (achEnabledFlag ? mpfAchWOPrepay : mpfCheckWOPrepay)
      .map((ele) => {
        const finalRes = this.roundDown(String((maxMonthlyLoanPayment / ele) * 100));

        businessLendingLimitDisplay.push(this.changeAmtVal(finalRes));

        return Number(finalRes);
      });
    const businessCashTest = {
      monthlyAvgCashBalance: this.changeAmtVal(this.roundDown(String(lowestMonthlyAvgBalance))),
      monthlyDebtLimitLoanPayment: this.changeAmtVal(this.roundDown(String(maxMonthlyLoanPayment))),
      resultingLendingLimitByProduct: businessLendingLimitDisplay
    };

    //Required to verify stated income
    const StatedIncomeVsModeledIncome = (AnualIncomeStated > AnualIncomeModeled) ? 1 : 0;
    const ModeledIncomeVsTotalFinancingRequested = [];

    for (let i = 0; i < totalFinancingRequested.length; i++) {
      if (ResultingLendingLimitByProductModeled[i] < totalFinancingRequested[i]) {
        ModeledIncomeVsTotalFinancingRequested.push(1);
      } else {
        ModeledIncomeVsTotalFinancingRequested.push(0);
      }
    }

    const ModeledIncomeVsBusinessLendingLimit = [];

    for (let i = 0; i < businessLendingLimit.length; i++) {
      if (ResultingLendingLimitByProductModeled[i] < businessLendingLimit[i]) {
        ModeledIncomeVsBusinessLendingLimit.push(1);
      } else {
        ModeledIncomeVsBusinessLendingLimit.push(0);
      }
    }

    const ficoFlagCheck = (ficoFlag >= 680 && ficoFlag <= 699) ? 1 : 0;
    const pgDtiFlag680to699 = (ficoFlag >= 680 && ficoFlag <= 699) ? true : false;
    const requiredToVerifyStatedIncome = [];

    for (let i = 0; i < businessLendingLimit.length; i++) {
      if ((StatedIncomeVsModeledIncome * ficoFlagCheck * ModeledIncomeVsTotalFinancingRequested[i] * ModeledIncomeVsBusinessLendingLimit[i]) === 1) {
        requiredToVerifyStatedIncome.push(1);
      } else {
        requiredToVerifyStatedIncome.push(0);
      }
    }

    // Lendint limit totalFinancingRequested[i]
    const lendingLimit = [];
    const lendingLimitDisplay = [];

    for (let i = 0; i < totalFinancingRequested.length; i++) {
      if (ficoFlagCheck == 0) {
        lendingLimit.push(businessLendingLimit[i]);
        lendingLimitDisplay.push(this.changeAmtVal(String(businessLendingLimit[i])));
      }
      else {
        if (requiredToVerifyStatedIncome[i] == 0) {
          const minOfAll = Math.min(ResultingLendingLimitByProductModeled[i], businessLendingLimit[i]);
          
          lendingLimit.push(minOfAll);
          lendingLimitDisplay.push(this.changeAmtVal(String(minOfAll)));
        } else {
          const minOfAll = Math.min(ResultingLendingLimitByProductStated[i], businessLendingLimit[i]);
          
          lendingLimit.push(minOfAll);
          lendingLimitDisplay.push(this.changeAmtVal(String(minOfAll)));
        }
      }
    }

    // Adj lendint limit
    const adjLendingLimitDisplay = [];
    const adjLendingLimit = lendingLimit.map((item) => {
      if (item >= 25000 && item <= 1000000) {
        adjLendingLimitDisplay.push(this.changeAmtVal(String(item)));
        
        return item;
      } else {
        adjLendingLimitDisplay.push(0);

        return 0;
      }
    });

    // Financing approved
    const financingApproved = [];
    const financingApprovedDisplay = [];

    for (let i = 0; i < totalFinancingRequested.length; i++) {
      const minOfAll = ficoFlag < 680 ? 0 : Math.min(adjLendingLimit[i], totalFinancingRequested[i]);

      financingApproved.push(minOfAll);
      financingApprovedDisplay.push(this.changeAmtVal(String(minOfAll)));
    }

    // Borrower down payment
    const borrowerDownPayment = [];
    const borrowerDownPaymentDisplay = [];

    for (let i = 0; i < financingApproved.length; i++) {
      if (financingApproved[i] !== 0) {
        const finalRes = this.roundDown(String(totalFinancingRequested[i] - financingApproved[i]));

        borrowerDownPayment.push(Number(finalRes));
        borrowerDownPaymentDisplay.push(this.changeAmtVal(String(finalRes)));
      } else {
        borrowerDownPayment.push(0);
        borrowerDownPaymentDisplay.push(0);
      }
    }

    const byProduct = {
      requiredToVerifyStatedIncome,
      lendingLimit: lendingLimitDisplay,
      adjLendingLimit: adjLendingLimitDisplay,
      financingApproved: financingApprovedDisplay,
      borrowerDownPayment: borrowerDownPaymentDisplay
    };

    return {
      originationFeeAmount,
      totalFinancingRequested,
      pgDtiFlag680to699,
      achEnabledFlag,
      pgDtiTestStatedIncome,
      pgDtiTestModeledIncome,
      businessCashTest,
      byProduct,
      listOfTheRelevantProductsUsed
    };
  }

  public async getLoanInfo(loanId) {
      const entityManager = getManager();
      const productsLending = await entityManager.query(
        `
          select
            "financingApproved",
            "productName",
            "requiredToVerifyStatedIncome",
            "personalGuarantorLimitModeled",
            "personalGuarantorLimitStated",
            "businessBorrowerLimit",
            "lendingLimit",
            "adjLendingLimit",
            "financingApproved"
          from
            tbllendinglimit
          where
            "loanId" = $1 and "partnerActivatedProduct" = 'Y' and "deleteFlag" = 'N'
        `,
        [loanId]
      );
      const financingTab = await entityManager.query(
        `
          select
            "financingRequested",
            "financingTermRequested",
            "originationFee",
            "productId",
            "interestRate",
            "incomeVerified",
            "incomeVerifiedAmount",
            "ownershipConfirmed",
            "taxDocumentsVerified"
          from
            tblloan
          where
            id  = $1 and delete_flag = 'N'
        `,
        [loanId]
      );
      const installer_id = await entityManager.query(
        `
          select
            ins_user_id,
            "incomeVerified",
            "ownershipConfirmed",
            "taxDocumentsVerified"
          from
            tblloan t
          where
            id = $1 and delete_flag = 'N'
        `,
        [loanId]
      );
      const loanProducts = await entityManager.query(
        `
          select
            t2."productId",
            t2.name,
            t2."type" ,
            t2."tenorMonths",
            t2."tenorYears",
            t2."interestBaseRate",
            t2."achDiscount",
            t2."achDiscountInterestRate",
            t2."dealerFee",
            t2."originationFee",
            t2.prepayment_flag,
            t2.prepayment,
            t2."prepaymentMonth",
            t2.downpayment,
            t2."mpfAchWItcPrepay",
            t2."mpfAchWOPrepay",
            t2."mpfCheckWItcPrepay",
            t2."mpfCheckWOPrepay"
          from
            tblpartnerproduct t1 
          join
            tblproduct t2 on t1."productId" = t2."productId"
          where
            t1."installerId" = $1 and t1.active_flag ='Y' and t2.status ='ACTIVE'
        `,
        [installer_id[0]['ins_user_id']]
      );
      const financialQuestions = await entityManager.query(
        `
          select
            "lifeCycleStage",
            "expectedRevGrowth",
            "growthDrivers",
            "profitabilityGrowth",
            "liabilities",
            "challenges",
            "otherReason",
            "ownershipType"
          from
            tblcustomer
          where
            "loanId" = $1
        `,
        [loanId]
      );
      let products = await entityManager.query(`
        select
          "productId",
          name
        from
          tblproduct
        where
          status = 'ACTIVE'
      `);

      products = products.filter((product) => (product.productId == financingTab[0]['productId']));
      financingTab[0]['productName'] = (products.length > 0) ? products[0]['name'] : '';

      return {
        "statusCode": 200,
        productsLending,
        financingTab,
        financialQuestions,
        loanProducts,
        installer_id
      };
  }

  public async loanopschangestatus(loanOpsChangeStatusDto:LoanOpsChangeStatusDto) {
      
    const entityManager = getManager();

    try {
        
        if(loanOpsChangeStatusDto.moduleName=='incomeverify'){
            const update_product = await entityManager.query(`update  tblloan  set "incomeVerified"='${loanOpsChangeStatusDto.status}',"incomeVerifiedAmount"='${loanOpsChangeStatusDto.incomeVerifiedAmount}' where id ='${loanOpsChangeStatusDto.loanID}'`);

            return {
                statusCode: 200,
                message: "LoanID Status changed",
            }
        }else if(loanOpsChangeStatusDto.moduleName=='ownershipConfirmed'){
            const update_product = await entityManager.query(`update  tblloan  set "ownershipConfirmed"='${loanOpsChangeStatusDto.status}' where id ='${loanOpsChangeStatusDto.loanID}'`);

            return {
                statusCode: 200,
                message: "LoanID Status changed",
            }
        }else if(loanOpsChangeStatusDto.moduleName=='taxDocumentsVerified'){
            const update_product = await entityManager.query(`update  tblloan  set "taxDocumentsVerified"='${loanOpsChangeStatusDto.status}' where id ='${loanOpsChangeStatusDto.loanID}'`);

            return {
                statusCode: 200,
                message: "LoanID Status changed",
            }
        }  else if(loanOpsChangeStatusDto.moduleName=='requestedInformations'){
                          const update_product = await entityManager.query(`update  tblloan  set "requestedInformations"='${loanOpsChangeStatusDto.status}' where id ='${loanOpsChangeStatusDto.loanID}'`);
          
                        return {
                             statusCode: 200,
                              message: "LoanID Status changed",
                          }
                      } 
        else{
            return {
                statusCode: 200,
                message: "LoanID Status Error",
            }
        }
        
    } catch (error) {
        console.log(error);
        return { "statusCode": 500, "message": [new InternalServerErrorException(error)['response']['name']], "error": "Bad Request" };
    }
  }

  public async sendRequestInfomationEmail(loanId) {
    const entityManager = getManager();
    try {
        const customerData:any = await entityManager.query(`SELECT email from tblcustomer where "loanId" = '${loanId}';`);
        if(customerData.length>0){
            let email:any = customerData[0]['email'];
            let loanData = await entityManager.query(`select "requestedInformations" from tblloan where id  = '${loanId}' and delete_flag = 'N'`);
            const requestedInfoString = loanData[0]['requestedInformations'];
            if(requestedInfoString) {
                const requestedData = JSON.parse(requestedInfoString);
                let requestedDocuments = [];
                for (const key of Object.keys(requestedData)) {
                   if(requestedData[key]['status']){
                    requestedDocuments.push(`${requestedData[key]['text']}`)
                   }
                    
                }
                await this.mailService.requestLoanOpsInformation(email, requestedDocuments);
                return {
                    statusCode: 200,
                    message: "Email sent",
                }
            }
            
        }
    } catch(ex){
        console.log(ex);
        return { "statusCode": 500, "message": [new InternalServerErrorException(ex)['response']['name']], "error": "Bad Request" };
    }
    
  }

  public getDecision(sources: RuleSources): Decision {
    let situation = Situation.Approved;
    const rules: Rule[] = [
      {
        id: 1,
        criteria: 699,
        declinedIf: 'lt',
        description: 'FICO is 700 or over',
        isNullAllowed: false,
        needReview: false,
        partOfResultingMessage: 'FICO is',
        shouldDecline: false,
        valueSource: 'equifaxConsumerReport'
      },
      {
        id: 2,
        criteria: 680,
        declinedIf: 'lt',
        description: 'FICO is between 680-699',
        isNullAllowed: false,
        needReview: false,
        partOfResultingMessage: 'FICO is',
        shouldDecline: true,
        valueSource: 'equifaxConsumerReport'
      },
      {
        id: 3,
        criteria: 59,
        declinedIf: 'gt',
        description: 'Modeled DTI is 60% or over',
        isNullAllowed: false,
        needReview: false,
        partOfResultingMessage: 'Modeled DTI is',
        shouldDecline: true,
        valueSource: 'equifaxConsumerReport'
      },
      {
        id: 4,
        criteria: 0,
        declinedIf: 'gt',
        description: 'Adverse Media returns a hit',
        isNullAllowed: true,
        needReview: true,
        partOfResultingMessage: 'Number of adverse media hits is',
        shouldDecline: false,
        valueSource: 'complyAdvantageReport'
      },
      {
        id: 5,
        criteria: 0,
        declinedIf: 'gt',
        description: 'AML check flags applicant',
        isNullAllowed: true,
        needReview: true,
        partOfResultingMessage: 'Number of AML checks is',
        shouldDecline: false,
        valueSource: 'complyAdvantageReport'
      },
      {
        id: 6,
        criteria: 0,
        declinedIf: 'gt',
        description: 'OFAC check returns a hit',
        isNullAllowed: true,
        needReview: true,
        partOfResultingMessage: 'Number of OFAC hits is',
        shouldDecline: false,
        valueSource: 'complyAdvantageReport'
      },
      {
        id: 7,
        criteria: 540,
        declinedIf: 'lt',
        description: 'Business Credit Score (CIDS) is less than 540',
        isNullAllowed: false,
        needReview: false,
        partOfResultingMessage: 'Business Credit Score (CIDS) is',
        shouldDecline: true,
        valueSource: 'equifaxCommercialReport'
      },
      {
        id: 8,
        criteria: 3,
        declinedIf: 'lt',
        description: 'Time in business based in inception year is less than 3 Years',
        isNullAllowed: false,
        needReview: false,
        partOfResultingMessage: 'Time in business based in inception year (years) is',
        shouldDecline: true,
        valueSource: 'equifaxCommercialReport'
      },
      {
        id: 9,
        criteria: null,
        declinedIf: 'eq',
        description: 'Business Credit Score (CIDS) is not null',
        needReview: true,
        partOfResultingMessage: 'Business Credit Score (CIDS) is',
        shouldDecline: false,
        valueSource: 'equifaxCommercialReport'
      },
      {
        id: 10,
        criteria: 3,
        declinedIf: 'lt',
        description: 'BCIR indicates a Bankruptcy in past 2 years',
        isNullAllowed: true,
        needReview: false,
        partOfResultingMessage: 'Time since last bankruptcy (years) is',
        shouldDecline: true,
        valueSource: 'equifaxCommercialReport'
      },
      {
        id: 11,
        criteria: 3,
        declinedIf: 'lt',
        description: 'BCIR indicates judgments/liens in past 2 years',
        isNullAllowed: true,
        needReview: false,
        partOfResultingMessage: 'Time since last judgment/lien (years) is',
        shouldDecline: true,
        valueSource: 'equifaxCommercialReport'
      },
      {
        id: 12,
        criteria: 0,
        declinedIf: 'eq',
        description: 'Certificate of Good Standing is not present',
        isNullAllowed: true,
        needReview: true,
        partOfResultingMessage: 'Is Certificate of Good Standing present?',
        shouldDecline: false,
        valueSource: 'middeskReport'
      },
      {
        id: 13,
        criteria: false,
        declinedIf: 'eq',
        description: 'Business is not a US-based/owned business',
        isNullAllowed: true,
        needReview: false,
        partOfResultingMessage: 'Is business a US-based/owned business?',
        shouldDecline: true,
        valueSource: 'middeskReport'
      },
      {
        id: 14,
        criteria: false,
        declinedIf: 'eq',
        description: 'No personal guarantors\' name is present',
        isNullAllowed: true,
        needReview: true,
        partOfResultingMessage: 'Is personal guarantor name present?',
        shouldDecline: false,
        valueSource: 'middeskReport'
      },
      {
        id: 15,
        criteria: 0,
        declinedIf: 'eq',
        description: 'OFAC check returns a hit',
        isNullAllowed: true,
        needReview: true,
        partOfResultingMessage: 'Did OFAC check return a hit?',
        shouldDecline: false,
        valueSource: 'middeskReport'
      },
      {
        id: 16,
        criteria: false,
        declinedIf: 'eq',
        description: 'Business legal name doesn\'t match what was listed in credit app',
        isNullAllowed: true,
        needReview: true,
        partOfResultingMessage: 'Does business legal name match what was listed in credit app?',
        shouldDecline: false,
        valueSource: 'middeskReport'
      },
      {
        id: 17,
        criteria: false,
        declinedIf: 'eq',
        description: 'Business address doesn\'t match what was listed in credit app',
        isNullAllowed: true,
        needReview: true,
        partOfResultingMessage: 'Does business address match what was listed in credit app?',
        shouldDecline: false,
        valueSource: 'middeskReport'
      },
      {
        id: 18,
        criteria: 0,
        declinedIf: 'eq',
        description: 'Financing approved is greater than 0',
        isNullAllowed: true,
        needReview: false,
        partOfResultingMessage: 'Financing approved is',
        shouldDecline: true,
        valueSource: 'lendingLimit'
      }
    ];
    const ruleMethodsToGetValueMap = new Map<number, Function>([
      [1, this.getConsumerCreditScore],
      [2, this.getConsumerCreditScore],
      [3, this.getModeledDti],
      [4, this.getNumberOfAdverseMediaHits],
      [5, this.getNumberOfAmlHits],
      [6, this.getNumberOfOfacHits],
      [7, this.getBusinessCreditScore],
      [8, this.getBusinessTimeInYears],
      [9, this.getBusinessCreditScore],
      [10, this.getTimeSinceLastBankruptcyInYears],
      [11, this.getTimeSinceLastJudgmentOrLienInYears],
      [12, this.isSomeCertificateOfGoodStandingPresent],
      [13, this.isBusinessUsBased],
      [14, this.isPersonalGuarantorNamePresent],
      [15, this.doesOfacCheckReturnHit],
      [16, this.doesBusinessLegalNameMatchWhatWasStated],
      [17, this.doesBusinessAddressMatchWhatWasStated],
      [18, this.getFinancingApproved]
    ]);
    const ruleResults = rules.map((rule) => {
      const valueToBeChecked = ruleMethodsToGetValueMap.get(rule.id)(sources[rule.valueSource]);
      const passed = this.getRuleResult(rule, valueToBeChecked);
      const ruleMessage = `${rule.partOfResultingMessage} ${valueToBeChecked === undefined ? null : valueToBeChecked}`;
      let ruleStatus = passed ? RuleStatus.Pass : RuleStatus.Fail;

      // Implement a bypass logic when new rules need to be bypassed
      if ((rule.id === 2 || rule.id === 3) && this.getConsumerCreditScore(sources['equifaxConsumerReport']) > 699) {
        ruleStatus = RuleStatus.ByPass;
      }

      if (ruleStatus === RuleStatus.Fail) {
        if (situation !== Situation.Declined && rule.needReview) {
          situation = Situation.Review;
        } else if (rule.shouldDecline) {
          situation = Situation.Declined;
        }
      }

      return {
        RuleId: rule.id,
        Rule: rule.description,
        RuleMessage: ruleMessage,
        RuleStatus: ruleStatus 
      };
    });

    return { situation, ruleResults }
  }

  private getIncomeLendingLimit(
    mpfCheckWOPrepay: number[],
    nonOrkaAnnualDedt: number,
    anualIncome: number
  ): number[] {
    const annualDtiThresholdPercentage = 60;
    const annualDebtThreshold = anualIncome * annualDtiThresholdPercentage / 100;
    const remainingMonthlyDebtLimit = Number(((annualDebtThreshold - nonOrkaAnnualDedt) / 12).toFixed(2));
    const result = mpfCheckWOPrepay.map((ele) => {
      const finalRes = this.roundDown(String((remainingMonthlyDebtLimit / ele) * 100));
      
      return Number(finalRes);
    });

    return result;
  }

  private async getBusinessBorrowerLendingLimit(loanId: string, mpfCheckWOPrepay: number[]) {
    const minAvgCashBalance = 6;
    const res = await this.plaidService.getAssetsDisplay(loanId);
    const lowestMonthlyAvgBalance = ['development', 'staging', 'preprod'].includes(process.env.APP_ENV) ? -(res.minBalance) : res.minBalance; // Needed because Plaid sandbox always returns the same mocked data which leads to a financing approved of 0
    const maxMonthlyLoanPayment = Number((lowestMonthlyAvgBalance / minAvgCashBalance).toFixed(2));
    const result = mpfCheckWOPrepay.map((ele) => {
      const finalRes = this.roundDown(String((maxMonthlyLoanPayment / ele) * 100));
      
      return Number(finalRes);
    });

    return result;
  }

  private roundDown(value: string): string {
    let pointPlace: string;
    let finalNumber: string;
    const arr = value.split('.');

    if (arr.length == 1) {
      finalNumber = arr[0] + '.' + '00';
    } else if (arr[1].length == 1) {
      pointPlace = arr[1] + '0';
      finalNumber = arr[0] + '.' + pointPlace;
    } else if (arr[1].length == 2) {
      pointPlace = arr[1];
      finalNumber = arr[0] + '.' + pointPlace;
    } else {
      pointPlace = arr[1].slice(0, 2);
      finalNumber = arr[0] + '.' + pointPlace;
    }

    return finalNumber;
  }
  
  private changeAmtVal(value) {
    const splitNumber = value.split('.');
    const integerPortion = splitNumber[0];
    const decimalPortion = splitNumber[1];
    const formattedIntegerPortion = integerPortion.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

    return formattedIntegerPortion + (decimalPortion ? ('.' + decimalPortion) : '');
  }

  private getConsumerCreditScore(equifaxConsumerReport: EquifaxConsumerReportPayload): number {
    const creditScore = equifaxConsumerReport.consumers.equifaxUSConsumerCreditReport[0].models?.find((model) => model.type === 'FICO')?.score;

    return creditScore || null;
  }

  private getModeledDti(equifaxConsumerReport: EquifaxConsumerReportPayload): number {
    const reportAttributes = equifaxConsumerReport.consumers.equifaxUSConsumerCreditReport[0].attributes?.[0].attributes || [];
    const monthlyModeledIncome = reportAttributes.find((attribute) => attribute.identifier === '6028')?.value;
    const monthlyModeledDebt = reportAttributes.find((attribute) => attribute.identifier === '6031')?.value;
    const dti = monthlyModeledIncome && monthlyModeledDebt ? Number(monthlyModeledDebt) / (Number(monthlyModeledIncome)) : undefined;

    return dti ? Number((dti * 100).toFixed()) : dti;
  }

  private getNumberOfAdverseMediaHits(complyAdvantageReport: ComplyAdvantageReportPayload): number {
    const adverseMediaHit = complyAdvantageReport.content.data.hits[0]?.doc.sources.filter((source) => source === 'complyadvantage-adverse-media');

    return adverseMediaHit?.length || 0;
  }

  private getNumberOfAmlHits(complyAdvantageReport: ComplyAdvantageReportPayload): number {
    const amlTypes = complyAdvantageReport.content.data.hits[0]?.doc.types;

    return amlTypes?.length || 0;
  }

  private getNumberOfOfacHits(complyAdvantageReport: ComplyAdvantageReportPayload): number {
    const ofacHit = complyAdvantageReport.content.data.hits[0]?.doc.sources.filter((source) => source === 'ofac-sdn-list');

    return ofacHit?.length || 0;
  }

  private getBusinessCreditScore(equifaxCommercialReport: EquifaxCommercialReportPayload): number {
    const creditScore = equifaxCommercialReport.EfxTransmit.CommercialCreditReport[0].Folder.DecisionTools?.ScoreData[0]?.score;

    return creditScore ? Number(creditScore) : null;
  }

  private getBusinessTimeInYears(equifaxCommercialReport: EquifaxCommercialReportPayload): number {
    const yearsInBusiness = equifaxCommercialReport.EfxTransmit.CommercialCreditReport[0].Folder.FirmographicsTrait?.[0].CurrentFirm?.YearsInBusiness;

    return yearsInBusiness;
  }

  private getTimeSinceLastBankruptcyInYears(equifaxCommercialReport: EquifaxCommercialReportPayload): number {
    const lastBankruptcyDate = equifaxCommercialReport.EfxTransmit.CommercialCreditReport[0].Folder.ReportAttributes?.PublicRecordsSummary?.RecentBankruptcyDate;
    const lastBankruptcyYear = lastBankruptcyDate ? new Date(lastBankruptcyDate).getUTCFullYear() : null;
    const currentYear = new Date().getUTCFullYear();
    const numberOfYearsSinceLastBankruptcy = lastBankruptcyYear ? (currentYear - lastBankruptcyYear) : undefined;

    return numberOfYearsSinceLastBankruptcy;
  }

  private getTimeSinceLastJudgmentOrLienInYears(equifaxCommercialReport: EquifaxCommercialReportPayload): number {
    const publicRecordsSummary = equifaxCommercialReport.EfxTransmit.CommercialCreditReport[0].Folder.ReportAttributes?.PublicRecordsSummary;
    const lastJudgmentYear = publicRecordsSummary?.RecentJudgmentDate ? new Date(publicRecordsSummary.RecentJudgmentDate).getUTCFullYear() : null;
    const lastLienYear = publicRecordsSummary?.RecentLienDate ? new Date(publicRecordsSummary.RecentLienDate).getUTCFullYear() : null;
    const currentYear = new Date().getUTCFullYear();
    const numberOfYearsSinceLastJudgment = lastJudgmentYear ? (currentYear - lastJudgmentYear) : undefined;
    const numberOfYearsSinceLastLien = lastLienYear ? (currentYear - lastLienYear) : undefined;

    return numberOfYearsSinceLastJudgment || numberOfYearsSinceLastLien;
  }

  private isSomeCertificateOfGoodStandingPresent(middeskReport: MiddeskReportPayload): boolean {
    const certificateOfGoodStandingKeys = ['sos_match', 'sos_active', 'sos_domestic'];
    const isSomeCertificateOfGoodStandingPresent = middeskReport.review.tasks.some((task) => (
      certificateOfGoodStandingKeys.includes(task.key) &&
      task.status === MiddeskReportTasksStatuses.Success
    ));

    return isSomeCertificateOfGoodStandingPresent;
  }

  private isBusinessUsBased(middeskReport: MiddeskReportPayload): boolean {
    const isBusinessUsBased = middeskReport.review.tasks.some((task) => (
      task.key === 'address_deliverability' &&
      task.status === MiddeskReportTasksStatuses.Success
    ));

    return isBusinessUsBased;
  }

  private isPersonalGuarantorNamePresent(middeskReport: MiddeskReportPayload): boolean {
    const isPersonalGuarantorNamePresent = middeskReport.review.tasks.some((task) => (
      task.key === 'person_verification' &&
      task.status === MiddeskReportTasksStatuses.Success
    ));

    return isPersonalGuarantorNamePresent;
  }

  private doesOfacCheckReturnHit(middeskReport: MiddeskReportPayload): boolean {
    const isOfacCheckHit = middeskReport.review.tasks.some((task) => (
      task.key === 'watchlist' &&
      task.status !== MiddeskReportTasksStatuses.Success
    ));

    return isOfacCheckHit;
  }

  private doesBusinessLegalNameMatchWhatWasStated(middeskReport: MiddeskReportPayload): boolean {
    const isBusinessLegalNameValid = middeskReport.review.tasks.some((task) => (
      task.key === 'name' &&
      task.status === MiddeskReportTasksStatuses.Success
    ));

    return isBusinessLegalNameValid;
  }

  private doesBusinessAddressMatchWhatWasStated(middeskReport: MiddeskReportPayload): boolean {
    const isBusinessAddressValid = middeskReport.review.tasks.some((task) => (
      task.key === 'address_verification' &&
      MiddeskReportTasksStatuses.Success
    ));

    return isBusinessAddressValid;
  }

  private getFinancingApproved(lendingLimit: LendingLimitEntity): number {
    return Number(lendingLimit.financingApproved);
  }

  private getRuleResult(rule: Rule, valueToBeChecked: number | string): boolean {
    let passed = true;

    if (valueToBeChecked !== undefined || !rule.isNullAllowed) {
      switch (rule.declinedIf) {
        case 'eq':
          passed = valueToBeChecked !== rule.criteria;
          break;
        case 'lt':
          passed = valueToBeChecked >= rule.criteria;
          break;
        case 'gt':
          passed = valueToBeChecked <= rule.criteria;
          break;
        default:
          throw new InternalServerErrorException({
            statusCode: 500,
            message: `${rule.declinedIf} is not a supported rule operator`
          });
      }
    }

    return passed;
  }
}
