import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { getManager } from 'typeorm';

import { ComplyAdvantageReport } from '../../entities/complyAdvantage.entity';
import { ComplyAdvantageReportRepository } from '../../repository/complyAdvantage.repository';

@Injectable()
export class ComplyAdvantageService {
  constructor(
    @InjectRepository(ComplyAdvantageReportRepository)
    private readonly complyAdvantageReportRepository: ComplyAdvantageReportRepository,
    private httpService: HttpService
  ) {}

  async getReport(loanId: string) {
    const entityManager = getManager();
    const URL = process.env.ComplyAdvantageUrl + process.env.ComplyAdvantageKey;
    const checkReport = await entityManager.query(
      `
        SELECT
          report
        FROM
          tblcomplyadvantage
        WHERE
          loan_id = $1 AND delete_flag = 'N'
      `,
      [loanId]
    );

    if (checkReport.length != 0) {
      return { status: true, data: checkReport[0].report }
    }

    try {
      const [customer] = await entityManager.query(
        `
          SELECT
            "ownerFirstName",
            "ownerLastName",
            "ownerDOB"
          FROM
            tblcustomer
          WHERE
            "loanId" = $1
        `,
        [loanId]
      );

      if (customer) {
        const headers = { 'Content-Type': 'application/json' };
        const body = {
          search_term: {},
          filters: {},
          share_url: 1,
          exact_match: true
        };

        if (customer.ownerFirstName) {
          body["search_term"]["first_name"] = customer.ownerFirstName;
        }

        if (customer.ownerLastName) {
          body["search_term"]["last_name"] = customer.ownerLastName;
        }

        if (customer.ownerDOB) {
          body["filters"]["birth_year"] = customer.ownerDOB.split('-')[0];
        }

        const res = await this.httpService.post(URL, body, { headers: headers }).toPromise();
        const data = JSON.stringify(res.data);
        
        if (data) {
          const complyAdvantageReport = new ComplyAdvantageReport();
          
          complyAdvantageReport.loan_id = loanId;
          complyAdvantageReport.report = data;

          await this.complyAdvantageReportRepository.save(complyAdvantageReport)
        }

        return { status: true, data: data }
      } else {
        return { status: false };
      }
    } catch (error) {
      console.log({ error });

      return { status: false }
    }
  }
}
