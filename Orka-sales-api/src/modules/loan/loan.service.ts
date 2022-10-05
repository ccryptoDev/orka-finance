import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { getManager } from 'typeorm';

@Injectable()
export class LoanService {
  async getLoanDetails(id) {
    const entityManager = getManager();
    try {
      const rawData = await entityManager.query(
        `select count(*) as count from tblloan where delete_flag = 'N' and active_flag = 'Y' and status_flag = 'waiting' and id = '${id}'`,
      );
      if (rawData[0].count > 0) {
        const data = {
          loan: await entityManager.query(
            `select * from tblcustomer where loan_id = '${id}'`,
          ),
        };
        return { statusCode: 200, data };
      }
      return {
        statusCode: 500,
        message: ['This Loan Id Not Exists'],
        error: 'Bad Request',
      };
    } catch (error) {
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

  async getLoanStatus(id) {
    const entityManager = getManager();
    try {
      const rawData = await entityManager.query(
        `select status_flag from tblloan where id = '${id}'`,
      );
      const message = rawData[0].status_flag;
      let sorryMessage;
      if (message === 'canceled') {
        const logMessage = await entityManager.query(
          `select module from tbllog where loan_id = '${id}'`,
        );
        sorryMessage = logMessage[logMessage.length - 1].module;
        console.log(sorryMessage);
        sorryMessage = sorryMessage.split('\n')[0];
        console.log(sorryMessage);
      }
      return {
        statusCode: 200,
        message,
        sorryMessage: [sorryMessage],
      };
    } catch (error) {
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
