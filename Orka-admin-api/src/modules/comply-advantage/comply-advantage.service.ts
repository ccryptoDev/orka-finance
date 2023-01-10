import { HttpService } from '@nestjs/axios';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { ComplyAdvantageReport, ComplyAdvantageReportPayload } from '../../entities/complyAdvantage.entity';
import { CustomerEntity } from '../../entities/customer.entity';
import { ComplyAdvantageReportRepository } from '../../repository/complyAdvantage.repository';
import { RuleResult } from '../decision-service/decision-service.service';

interface CreateComplyAdvantageDTO {
  loanId: string;
  report: ComplyAdvantageReportPayload;
  ruleResults: RuleResult[];
}

@Injectable()
export class ComplyAdvantageService {
  constructor(
    @InjectRepository(ComplyAdvantageReportRepository)
    private readonly complyAdvantageReportRepository: ComplyAdvantageReportRepository,
    private httpService: HttpService
  ) {}

  public async create(createComplyAdvantageDto: CreateComplyAdvantageDTO): Promise<ComplyAdvantageReport> {
    const { loanId, report, ruleResults } = createComplyAdvantageDto;
    let complyAdvantage = await this.complyAdvantageReportRepository.findOne({ loan_id: loanId });

    if (!complyAdvantage) {
      complyAdvantage = new ComplyAdvantageReport();
      complyAdvantage.loan_id = loanId;
      complyAdvantage.report = JSON.stringify({ complyAdvantage: report, Rules: ruleResults });

      await this.complyAdvantageReportRepository.save(complyAdvantage);
    }

    return complyAdvantage;
  }

  public async findByLoanId(loanId: string): Promise<ComplyAdvantageReport> {
    const middesk = await this.complyAdvantageReportRepository.findOne({ loan_id: loanId });

    if (!middesk) {
      throw new NotFoundException({ status: 404, message: 'No Comply Advantage report found for the given loan ID' });
    }

    return middesk;
  }

  public async getReport(customer: CustomerEntity): Promise<ComplyAdvantageReportPayload> {
    const complyAdvantageRequestPayload = {
      exact_match: true,
      filters: {
        birth_year: customer.ownerDOB.split('-')[0]
      },
      search_term: {
        first_name: customer.ownerFirstName,
        last_name: customer.ownerLastName
      },
      share_url: 1
    };
    const { data }: { data: ComplyAdvantageReportPayload } = await this.httpService.post(
      `${process.env.ComplyAdvantageUrl}`,
      complyAdvantageRequestPayload,
      {
        headers: {
          Authorization: `Token ${process.env.ComplyAdvantageKey}`
        }
      }
    ).toPromise();

    return data;
  }
}
