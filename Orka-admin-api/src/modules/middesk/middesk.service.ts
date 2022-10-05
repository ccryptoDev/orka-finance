import { HttpService } from '@nestjs/axios';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { getManager } from 'typeorm';

export interface MiddeskCreationDTO {
  name: string;
  addresses: {
    address_line1: string;
    address_line2?: string;
    city?: string;
    state?: string;
    postal_code?: string;
    full_address?: string;
  }[];
  people?: {
    name: string;
    first_name?: string;
    last_name?: string;
    dob?: string;
    ssn?: string;
    address_line1?: string;
    address_line2?: string;
    city?: string;
    state?: string;
    postal_code?: string;
    phone_number?: string;
    email?: string;
    device_session_id?: string;
  }[];
  phone_numbers?: {
    phone_number: string;
  }[];
  tin?: {
    tin: string;
  }
}

@Injectable()
export class MiddeskService {
  constructor(private readonly httpService: HttpService) {}

  public async create(middeskCreationDto: MiddeskCreationDTO, loanId: string) {
    const entityManager = getManager();
    let url = process.env.middeskurl;
    let middeskkey = process.env.middeskkey;
    
    try {
      const rawData = await entityManager.query(
        `
          SELECT
            "ownerFirstName" || ' ' || "ownerLastName" as name
          FROM
            tblcustomer
          WHERE
            "loanId" = $1
        `,
        [loanId]
      );

      middeskCreationDto['people'] = rawData;
      
      const config = {
        headers: {
          'Content-type': 'application/json',
          Accept: 'application/json',
          Authorization: 'Bearer ' + middeskkey
        }
      };
      const res = await this.httpService
        .post(url + 'businesses', middeskCreationDto, config)
        .toPromise();
      let id = res.data.id;
      
      if (id == '' && id == null) {
        for (let z = 0; z < 5; z++) {
          await this.timeout(5000); //  Product Not ready from plaid

          let res = await this.httpService
            .post(url + 'businesses', middeskCreationDto, config)
            .toPromise();

          id = res.data.id;

          if (id != '') {
            break;
          }
        }
      }
      
      const middeskIdCount = await entityManager.query(
        `
          SELECT
            COUNT(loan_id)
          FROM
            tblmiddesk
          WHERE
            delete_flag='N' AND loan_id = $1
        `,
        [loanId]
      );

      if (middeskIdCount[0].count != 0) {
        await entityManager.query(
          `
            UPDATE
              tblmiddesk
            SET
              delete_flag = 'Y'
            WHERE
              loan_id = $1
          `,
          [loanId]
        );
      }

      await entityManager.query(
        `
          INSERT INTO
            tblmiddesk (loan_id, middesk_id)
          VALUES
            ($1, $2)
        `,
        [loanId, id]
      );

      return true;
    } catch (error) {
      console.log(error);

      throw new InternalServerErrorException(error);
    }
  }

  public async get(loanId: string) {
    try {
      const entityManager = getManager();
      const url = process.env.middeskurl;
      const middeskkey = process.env.middeskkey;
      const [middesk] = await entityManager.query(
        `
          SELECT
            middesk_id,
            report
          FROM
            tblmiddesk
          WHERE
            loan_id = $1 AND delete_flag = 'N'
        `,
        [loanId]
      );
  
      if (middesk) {
        if (middesk.report) {
          return { status: true, data: middesk.report };
        } else {
          const config = {
            headers: {
              'Content-type': 'application/json',
              Accept: 'application/json',
              Authorization: 'Bearer ' + middeskkey
            }
          };
          const res = await this.httpService
            .get(url + 'businesses/' + middesk['middesk_id'], config)
            .toPromise();
          const data = JSON.stringify(res.data);
  
          if (data) {
            await entityManager.query(
              `
                UPDATE
                  tblmiddesk
                SET
                  report = $1
                WHERE
                  loan_id = $2 AND delete_flag = 'N'
              `,
              [data, loanId]
            );
          }
  
          return { status: true, data: data };
        }
      } else {
        return { status: false, data: null }
      }
    } catch (error) {
      console.log(error);

      return { status: false };
    }
}

  private async timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
