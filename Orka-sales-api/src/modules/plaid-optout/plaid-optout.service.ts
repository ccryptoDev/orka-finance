import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LogsService } from 'src/common/logs/logs.service';
import { FilesEntity } from 'src/entities/files.entity';
import { CustomerRepository } from 'src/repository/customer.repository';
import { FilesRepository } from 'src/repository/files.repository';
import { LoanRepository } from 'src/repository/loan.repository';
import { getManager } from 'typeorm';
import { PlaidOptoutFormDto } from './dto/plaid-optout.dto';

@Injectable()
export class PlaidOptoutService {
  constructor(
    @InjectRepository(CustomerRepository)
    private readonly customerRepository: CustomerRepository,
    @InjectRepository(FilesRepository)
    private readonly filesRepository: FilesRepository,
    @InjectRepository(LoanRepository)
    private readonly loanRepository: LoanRepository,
    private readonly logService: LogsService,
  ) {}

  async getDetails(id: string) {
    const entityManager = getManager();
    try {
      const data = await entityManager.query(
        `select originalname,filename from tblfiles where link_id = '${id}' and delete_flag='N' and services='bankStatements/upload'`,
      );
      return { statusCode: 200, data: data };
    } catch (err) {
      console.log(err);
      return {
        statusCode: 500,
        message: [new InternalServerErrorException(err)['response']['name']],
        error: 'Bad Request',
      };
    }
  }

  async deleteFiles(filename: string) {
    const entityManager = getManager();
    try {
      const data = await entityManager.query(
        `update tblfiles set delete_flag ='Y' where filename ='Development/orka/${filename}'`,
      );
      return { statusCode: 200, data: data };
    } catch (err) {
      console.log(err);
      return {
        statusCode: 500,
        message: [new InternalServerErrorException(err)['response']['name']],
        error: 'Bad Request',
      };
    }
  }

  async save(files, plaidOptoutFormDto: PlaidOptoutFormDto, ip: string) {
    const data: any = await this.customerRepository.find({
      select: ['id', 'loanId'],
      where: { loanId: plaidOptoutFormDto.loanId },
    });
    const filedata = files.map(i => {
      const file: FilesEntity = new FilesEntity();
      file.originalname = i.originalname;
      file.filename = i.filename;
      file.services = 'bankStatements/upload';
      file.linkId = data[0].loanId;
      return file;
    });
    try {
      await this.filesRepository.save(filedata);
      const user: any = await this.loanRepository.find({
        select: ['user_id'],
        where: { id: plaidOptoutFormDto.loanId },
      });
      await this.logService.log(
        data[0].loanId,
        user[0].user_id,
        'Plaid Opt Out Bank Statements submitted IP:' + ip,
      );

      return { statusCode: 200, id: data[0].id, loanId: data[0].loanId };
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
