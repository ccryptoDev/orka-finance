import { Injectable,InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUploadDto } from './dto/create-upload.dto';
import { FilesRepository } from '../../repository/files.repository';
import { FilesEntity } from '../../entities/files.entity';
import {LoanRepository} from '../../repository/loan.repository';
import { getManager, Like } from 'typeorm';
import { LogEntity } from 'src/entities/log.entity';
import { LogRepository } from 'src/repository/log.repository';

export enum Flags {
  Y = 'Y'
}




@Injectable()
export class UploadsService {
  constructor(
    @InjectRepository(FilesRepository) private readonly filesRepository: FilesRepository,
    @InjectRepository(LoanRepository) private readonly loanRepository: LoanRepository,
    @InjectRepository(LogRepository) private readonly logRepository: LogRepository,
  ){

  }

  async getAll(link_id){
    try {
      const rawData = await this.filesRepository.find({
        select:['id','services','originalname','filename','documentType','createdAt','updatedAt'],
        where:
        [
          {
            link_id:link_id,
            delete_flag:'N',
            services: Like('%businessVerification/%')
          },
          {
            link_id:link_id,
            delete_flag:'N',
            services: Like('%borrower/%')
          }
        ]
      })
      return {
        statusCode:200,
        fileData:rawData
      };
    } catch (error) {
      return { "statusCode": 500, "message": [new InternalServerErrorException(error)['response']['name']], "error": error };
    }
  }
  // async saveOLD(files,createUploadDto: CreateUploadDto) {    
  //   let filedata = [];
  //   for (let i = 0; i < files.length; i++) {      
  //     let file:FilesEntity = new FilesEntity();
  //     file.originalname = files[i].originalname;
  //     file.filename = files[i].filename;
  //     file.services = 'borrower/upload';
  //     file.documentType = createUploadDto.documentTypes[i];
  //     file.link_id = createUploadDto.loan_id;
  //     filedata.push(file)
  //   }
  //   try{
  //     await this.filesRepository.save(filedata);
  //     await this.loanRepository.update({id: createUploadDto.loan_id}, { active_flag: Flags.Y });
  //     return { "statusCode": 200, "Loan_ID": createUploadDto.loan_id}

  //   } catch (error) {
  //     console.log(error)
  //     return { "statusCode": 500, "message": [new InternalServerErrorException(error)['response']['name']], "error": "Bad Request" };
  //   }
  // }

  async deleteFiles(id: string) {
    const entityManager = getManager();
    try {
      const data = await entityManager.query(
        `update tblfiles set delete_flag ='Y' where id ='${id}'`,
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

  async save(files, createUploadDto: CreateUploadDto) {
    //console.log(files)
    const filedata = files.map(i => {
      const file: FilesEntity = new FilesEntity();
      file.originalname = i.originalname;
      file.filename = i.filename;
      file.services = 'borrower/documentCenter/otherDocuments';
      file.link_id = createUploadDto.loan_id;
      file.documentType =createUploadDto.documentType;
      return file;
    });
    //console.log(filedata);
    try {
      await this.filesRepository.save(filedata);
      // const entityManager = getManager();
      // const rawData = await entityManager.query(
      //   `select user_id from tblloan where id = '${createUploadDto.loan_id}'`,
      // );
      // const log = new LogEntity();
      // log.loan_id = createUploadDto.loan_id;
      // log.user_id = rawData[0].user_id;
      // log.module = 'Sales: Files Uploaded';
      // await this.logRepository.save(log);
      // await this.loanRepository.update(
      //   { id: createUploadDto.loan_id },
      //   { active_flag: Flags.Y },
      // );
      return { statusCode: 200, Loan_ID: createUploadDto.loan_id };
    } catch (error) {

      console.log(filedata)
      console.log(error)
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
