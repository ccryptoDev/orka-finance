import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CertificateOfGoodStandingDto } from './dto/certificate-of-good-standing.dto';
import { FilesRepository } from '../../repository/files.repository';
import { FilesEntity } from '../../entities/files.entity';
import { LoanRepository } from '../../repository/loan.repository';
import { LogRepository } from '../../repository/log.repository';
import { LogEntity } from '../../entities/log.entity';
import { getManager } from 'typeorm';
import { Flags, PhaseFlag } from '../../configs/config.enum';
import { CustomerRepository } from '../../repository/customer.repository';
import { LogsService } from '../../common/logs/logs.service';
@Injectable()
export class CertificateOfGoodStandingService {
  constructor(
    @InjectRepository(FilesRepository)
    private readonly filesRepository: FilesRepository,
    @InjectRepository(LoanRepository)
    private readonly loanRepository: LoanRepository,
    @InjectRepository(LogRepository)
    private readonly logRepository: LogRepository,
    @InjectRepository(CustomerRepository)
    private readonly customerRepository: CustomerRepository,
    private readonly logService: LogsService,
  ) {}

  async update(certificateOfGoodStandingDto: CertificateOfGoodStandingDto, ip) {
    const entityManager = getManager();
    await this.customerRepository.update(
      { loanId: certificateOfGoodStandingDto.loanId },
      {
        pgno: 5,
      },
    );

    const raw = await entityManager.query(
      `update tblloan set active_flag='Y'::tblloan_active_flag_enum::tblloan_active_flag_enum, phase_flag ='Underwriting'::tblloan_phase_flag_enum::tblloan_phase_flag_enum where id='${certificateOfGoodStandingDto.loanId}'`,
    );

    const data: any = await this.customerRepository.find({
      select: ['id', 'loanId'],
      where: { loanId: certificateOfGoodStandingDto.loanId },
    });

    // console.log(data[0].id,data[0].loanId)
    const message = 'Application submitted succesfully:' + ip;
    await this.logService.log(data[0].id, data[0].loanId, message);

    return { statusCode: 200, Loan_ID: certificateOfGoodStandingDto.loanId };
  }

  async save(
    files,
    certificateOfGoodStandingDto: CertificateOfGoodStandingDto,
    ip,
  ) {
    const filedata = files.map(i => {
      const file: FilesEntity = new FilesEntity();
      file.originalname = i.originalname;
      file.filename = i.filename;
      file.services = 'certificateOfGoodStanding/upload';
      file.linkId = certificateOfGoodStandingDto.loanId;
      return file;
    });
    try {
      await this.filesRepository.save(filedata);
      const entityManager = getManager();
      const rawData = await entityManager.query(
        `select id from tblcustomer where "loanId" = '${certificateOfGoodStandingDto.loanId}'`,
      );

      let message = 'Certificate Of Good Standing: Files Uploaded:' + ip;
      await this.logService.log(
        rawData[0].id,
        certificateOfGoodStandingDto.loanId,
        message,
      );

      message = 'Application submitted succesfully:' + ip;
      await this.logService.log(
        rawData[0].id,
        certificateOfGoodStandingDto.loanId,
        message,
      );

      // await this.loanRepository.update({id: certificateOfGoodStandingDto.loanId}, {activeFlag: Flags.Y});
      await this.customerRepository.update(
        { loanId: certificateOfGoodStandingDto.loanId },
        {
          pgno: 5,
        },
      );
      const raw = await entityManager.query(
        `update tblloan set active_flag='Y'::tblloan_active_flag_enum::tblloan_active_flag_enum, phase_flag ='Underwriting'::tblloan_phase_flag_enum::tblloan_phase_flag_enum where id='${certificateOfGoodStandingDto.loanId}'`,
      );
      // await this.loanRepository.update(
      //   { id: certificateOfGoodStandingDto.loanId },
      //   {active_flag:Flags.Y}
      // );
      // await this.loanRepository.update(
      //   {id: certificateOfGoodStandingDto.loanId},
      //   {phase_flag:PhaseFlag.underwriting}
      // )
      return { statusCode: 200, Loan_ID: certificateOfGoodStandingDto.loanId };
    } catch (error) {
      let resp = new InternalServerErrorException(error).getResponse();
      if (Object.keys(resp).includes('name'))
        resp = Object.values(resp)[Object.keys(resp).indexOf('name')];

      console.log(resp);

      return {
        statusCode: 500,
        message: [resp],
        error: 'Bad Request',
      };
    }
  }
}
