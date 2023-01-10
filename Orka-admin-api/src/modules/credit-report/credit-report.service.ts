import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Creditreport, ReportType } from '../../entities/creditReport.entity';
import { CustomerEntity } from '../../entities/customer.entity';
import {
  EquifaxCommercialReportPayload,
  EquifaxConsumerReportPayload,
  EquifaxService
} from '../equifax/equifax.service';
import { AddressHelper } from '../../common/helpers/address.helper';
import { RuleResult } from '../decision-service/decision-service.service';

interface CreateCreditReportDTO {
  loanId: string;
  reportType: ReportType;
  report: EquifaxConsumerReportPayload | EquifaxCommercialReportPayload;
  ruleResults: RuleResult[];
}

@Injectable()
export class CreditReportService {
  constructor(
    @InjectRepository(Creditreport) private readonly creditReportRepository: Repository<Creditreport>,
    private readonly equifaxService: EquifaxService,
    private readonly addressHelper: AddressHelper
  ) {}

  public async create(createCreditReportDto: CreateCreditReportDTO): Promise<Creditreport> {
    const { loanId, reportType, report, ruleResults } = createCreditReportDto;
    let creditReport = await this.creditReportRepository.findOne({
      loan_id: loanId,
      reportType
    });

    if (!creditReport) {
      const creditScore = reportType === ReportType.Consumer ?
        this.getPersonaGuarantorCreditScore(report as EquifaxConsumerReportPayload) :
        this.getBusinessCreditScore(report as EquifaxCommercialReportPayload);
      
      creditReport = new Creditreport();
      creditReport.loan_id = loanId;
      creditReport.reportType = reportType;
      creditReport.report = JSON.stringify({
        creditScore,
        equaifax: report,
        Rules: ruleResults
      });
  
      await this.creditReportRepository.save(creditReport);
    }

    return creditReport;
  }

  public async getByLoanId(loanId: string): Promise<Creditreport[]> {
    const creditReports = await this.creditReportRepository.find({ loan_id: loanId });

    return creditReports;
  } 

  public async getConsumerReport(customer: CustomerEntity): Promise<EquifaxConsumerReportPayload> {
    let ownerStreet = '';
    let ownerHouseNumber = '';

    if (customer.ownerAddress) {
      ownerStreet = customer.ownerAddress.split(",")[0].trim(),
      ownerHouseNumber = customer.ownerAddress.split(",")[0].split(" ")[0].trim()
    }

    const equifaxReport = await this.equifaxService.getConsumerReport({
      firstName: customer.ownerFirstName,
      lastName: customer.ownerLastName,
      socialSecurityNumber: customer.ownerSSN,
      birthDate: customer.ownerDOB,
      city: customer.ownerCity,
      state: customer.ownerState,
      zipCode: customer.ownerZipCode,
      houseNumber: ownerHouseNumber,
      streetName: ownerStreet,
      phone: customer.ownerPhone
    });

    return equifaxReport;
  }

  public async getCommercialReport(customer: CustomerEntity): Promise<EquifaxCommercialReportPayload> {
    const equifaxReport = await this.equifaxService.getCommercialReport({
      businessAddress: customer.businessAddress,
      businessCity: customer.city,
      businessLegalName: customer.legalName,
      businessState: this.addressHelper.getState(customer.zipCode),
      businessZipCode: customer.zipCode
    });

    return equifaxReport;
  }

  private getPersonaGuarantorCreditScore(equifaxReport: EquifaxConsumerReportPayload): number {
    const creditScore = equifaxReport.consumers.equifaxUSConsumerCreditReport[0].models?.find((model) => model.type === 'FICO')?.score;

    return creditScore || null;
  }

  private getBusinessCreditScore(equifaxReport: EquifaxCommercialReportPayload): number {
    const creditScore = equifaxReport.EfxTransmit.CommercialCreditReport[0].Folder.DecisionTools?.ScoreData[0]?.score;

    return creditScore ? Number(creditScore) : null;
  }
}
