import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUploadDto } from './dto/create-upload.dto';
import { FilesRepository } from '../../repository/files.repository';
import { FilesEntity } from '../../entities/files.entity';
import { LoanRepository } from '../../repository/loan.repository';
import { LogRepository } from '../../repository/log.repository';
import { LogEntity } from '../../entities/log.entity';
import { getManager } from 'typeorm';
import { Flags } from '../../configs/config.enum';

@Injectable()
export class UploadsService {
  constructor(
    @InjectRepository(FilesRepository)
    private readonly filesRepository: FilesRepository,
    @InjectRepository(LoanRepository)
    private readonly loanRepository: LoanRepository,
    @InjectRepository(LogRepository)
    private readonly logRepository: LogRepository,
  ) {}
  //dc upload
  async save(files, createUploadDto: CreateUploadDto) {
    const filedata = files.map(i => {
      const file: FilesEntity = new FilesEntity();
      file.originalname = i.originalname;
      file.filename = i.filename;
      file.services = 'sales/upload';
      file.linkId = createUploadDto.loanId;
      return file;
    });
    try {
      await this.filesRepository.save(filedata);
      const entityManager = getManager();
      const rawData = await entityManager.query(
        `select user_id from tblloan where id = '${createUploadDto.loanId}'`,
      );
      const log = new LogEntity();
      log.loan_id = createUploadDto.loanId;
      log.user_id = rawData[0].user_id;
      log.module = 'Sales: Files Uploaded';
      await this.logRepository.save(log);
      await this.loanRepository.update(
        { id: createUploadDto.loanId },
        { active_flag: Flags.Y },
      );
      return { statusCode: 200, Loan_ID: createUploadDto.loanId };
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
