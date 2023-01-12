import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { getManager, Repository } from 'typeorm';

import { CustomerEntity } from 'src/entities/customer.entity';
import { PlaidService } from '../plaid/plaid.service';
import { CreditReportService } from '../credit-report/credit-report.service';
import { ReportType } from '../../entities/creditReport.entity'
import { MiddeskService } from '../middesk/middesk.service';
import { ComplyAdvantageService } from '../comply-advantage/comply-advantage.service';
import { Decision, DecisionServiceService, RuleResult, Situation } from '../decision-service/decision-service.service';
import { MailService } from '../../mail/mail.service';

@Injectable()
export class LoanService {
  constructor(
    @InjectRepository(CustomerEntity) private readonly customerRepository: Repository<CustomerEntity>,
    private readonly plaidService: PlaidService,
    private readonly creditReportService: CreditReportService,
    private readonly middeskService: MiddeskService,
    private readonly complyAdvantageService: ComplyAdvantageService,
    private readonly decisionService: DecisionServiceService,
    private readonly mailService: MailService
  ) {}

  public async getDecisions(loanId: string): Promise<Decision> {
    await this.plaidService.getAssets(loanId);

    const customer = await this.customerRepository.findOne({ loanId });
    const equifaxConsumerReport = await this.creditReportService.getConsumerReport(customer);
    const equifaxCommercialReport = await this.creditReportService.getCommercialReport(customer);
    const complyAdvantageReport = await this.complyAdvantageService.getReport(customer);
    const middeskReport = await this.middeskService.getReport(customer);
    const lendingLimit = await this.decisionService.setLendingLimitPersonalGuarantor(loanId, equifaxConsumerReport);
    const decision = this.decisionService.getDecision({
      equifaxConsumerReport,
      equifaxCommercialReport,
      complyAdvantageReport,
      middeskReport,
      lendingLimit
    });

    await this.creditReportService.create({
      loanId,
      reportType: ReportType.Consumer,
      report: equifaxConsumerReport,
      ruleResults: this.filterRuleResults(decision.ruleResults, [1, 2, 3]) // Equifax Consumer rules
    });
    await this.creditReportService.create({
      loanId,
      reportType: ReportType.Commercial,
      report: equifaxCommercialReport,
      ruleResults: this.filterRuleResults(decision.ruleResults, [7, 8, 9, 10, 11]) // Equifax Commercial rules
    });
    await this.complyAdvantageService.create({
      loanId,
      report: complyAdvantageReport,
      ruleResults: this.filterRuleResults(decision.ruleResults, [4, 5, 6]) // Comply Advantage rules
    });
    await this.middeskService.create({
      loanId,
      report: middeskReport,
      ruleResults: this.filterRuleResults(decision.ruleResults, [12, 13, 14, 15, 16, 17]) // Middesk rules
    });

    return decision;
  }

  private filterRuleResults(ruleResults: RuleResult[], ruleIdsToBeFiltered: number[]): RuleResult[] {
    return ruleResults.filter((ruleResult) => ruleIdsToBeFiltered.includes(ruleResult.RuleId));
  }
}
