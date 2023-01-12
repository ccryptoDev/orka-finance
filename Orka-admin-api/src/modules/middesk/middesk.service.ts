import { HttpService } from '@nestjs/axios';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { setTimeout } from 'timers';
import { Repository } from 'typeorm';
import { AddressHelper } from '../../common/helpers/address.helper';
import { CustomerEntity } from '../../entities/customer.entity';

import { MiddeskReport, MiddeskReportPayload } from '../../entities/middesk.entity';
import { RuleResult } from '../decision-service/decision-service.service';

interface CreateMiddeskDTO {
  loanId: string;
  report: MiddeskReportPayload;
  ruleResults: RuleResult[];
}

@Injectable()
export class MiddeskService {
  constructor(
    @InjectRepository(MiddeskReport)
    private readonly middeskRepository: Repository<MiddeskReport>,
    private readonly addressHelper: AddressHelper,
    private readonly httpService: HttpService
  ) {}

  public async create(createMiddeskDto: CreateMiddeskDTO): Promise<MiddeskReport> {
    const { loanId, report, ruleResults } = createMiddeskDto;
    let middesk = await this.middeskRepository.findOne({ loan_id: loanId });

    if (!middesk) {
      middesk = new MiddeskReport();
      middesk.loan_id = loanId;
      middesk.middesk_id = report.id;
      middesk.report = JSON.stringify({ middesk: report, Rules: ruleResults });

      await this.middeskRepository.save(middesk);
    }

    return middesk;
  }

  public async getReport(customer: CustomerEntity): Promise<MiddeskReportPayload> {
    const middeskRequestPayload = {
      addresses: [
        {
          address_line1: customer.businessAddress,
          city: customer.city,
          postal_code: customer.zipCode,
          state: this.addressHelper.getState(customer.zipCode),
        }
      ],
      name: customer.legalName,
      people: [
        {
          name: customer.ownerFirstName
        }
      ],
      phone_numbers: [
        {
          phone_number: customer.businessPhone
        }
      ],
      tin: {
        tin: customer.taxId
      }
    };
    const { data }: { data: MiddeskReportPayload } = await this.httpService.post(
      `${process.env.middeskurl}/businesses`,
      middeskRequestPayload,
      {
        headers: {
          Authorization: `Bearer ${process.env.middeskkey}`
        }
      }
    ).toPromise();
    const updatedMiddeskReport = await this.findReport(data.id);

    return updatedMiddeskReport;
  }

  public async findByLoanId(loanId: string): Promise<MiddeskReport> {
    const middesk = await this.middeskRepository.findOne({ loan_id: loanId });

    if (!middesk) {
      throw new NotFoundException({ status: 404, message: 'No Middesk report found for the given loan ID' });
    }

    return middesk;
  }

  private async findReport(reportId: string): Promise<MiddeskReportPayload> {
    let data: MiddeskReportPayload;
    let currentReportStatus = '';

    while (currentReportStatus !== 'in_review') {
      await new Promise(resolve => setTimeout(resolve, 3000));

      const response = await this.httpService.get(
        `${process.env.middeskurl}/businesses/${reportId}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.middeskkey}`
          }
        }
      ).toPromise();
  
      data = response.data;
      currentReportStatus = data.status;
    }

    return data;
  }
}
