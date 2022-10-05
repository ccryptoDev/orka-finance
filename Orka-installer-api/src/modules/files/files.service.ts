import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FilesRepository } from '../../repository/files.repository';
import { FilesEntity } from '../../entities/files.entity';
import { LoanRepository } from '../../repository/loan.repository';
import { FilesDto } from './files.dto';
import { getManager } from 'typeorm';
export enum Flags {
  Y = 'Y'
}

@Injectable()
export class FilesService {
  constructor(
    @InjectRepository(FilesRepository) private readonly filesRepository: FilesRepository
  ) { }

  async getAll(link_id) {
    try {
      const rawData = await this.filesRepository.find({
        select: ['services', 'originalname', 'filename', 'createdAt', 'updatedAt'],
        where: { link_id: link_id }
      })
      return {
        statusCode: 200,
        fileData: rawData
      };
    } catch (error) {
      return { "statusCode": 500, "message": [new InternalServerErrorException(error)['response']['name']], "error": error };
    }
  }

  async save(files, filesDto: FilesDto) {
    let filedata = [];
    if (typeof (filesDto.services) != 'string') {
      for (let i = 0; i < files.length; i++) {
        let file: FilesEntity = new FilesEntity();
        file.originalname = files[i].originalname;
        file.filename = files[i].filename;
        file.services = filesDto.services[i];
        file.link_id = filesDto.link_id
        filedata.push(file)
      }
    } else {
      for (let i = 0; i < files.length; i++) {
        let file: FilesEntity = new FilesEntity();
        file.originalname = files[i].originalname;
        file.filename = files[i].filename;
        file.services = filesDto.services;
        file.link_id = filesDto.link_id
        filedata.push(file)
      }
    };
    try {
      await this.filesRepository.save(filedata);
      return { statusCode: 200, Loan_ID: filesDto.link_id };
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

  // async save(files, filesDto: FilesDto) {
  //   console.log({ files })
  //   const filedata = files.map((item, index) => {
  //     const file: FilesEntity = new FilesEntity();
  //     file.originalname = item.originalname;
  //     file.filename = item.filename;
  //     file.services = filesDto.services[index];
  //     file.link_id = filesDto.link_id;
  //     file.documentType = '';
  //     return file;
  //   });
  //   console.log(filedata);
  //   try {
  //     await this.filesRepository.save(filedata);
  //     return { statusCode: 200, Loan_ID: filesDto.link_id };
  //   } catch (error) {

  //     console.log(filedata)
  //     console.log(error)
  //     let resp = new InternalServerErrorException(error).getResponse();
  //     if (Object.keys(resp).includes('name'))
  //       resp = Object.values(resp)[Object.keys(resp).indexOf('name')];
  //     return {
  //       statusCode: 500,
  //       message: [resp],
  //       error: 'Bad Request',
  //     };
  //   }
  // }

  async replace(fname, files, filesDto: FilesDto) {
    let filedata = [];
    let filename;
    let fileoriginalname;
    let cur_date = new Date().toLocaleDateString();
    const entityManager = getManager();
    for (let i = 0; i < files.length; i++) {
      let file: FilesEntity = new FilesEntity();
      filename = files[i].filename;
      fileoriginalname = files[i].originalname;
    }
    try {
      const query = `update tblfiles set filename ='${filename}', originalname = '${fileoriginalname}', "updatedAt"='NOW()' where services ='salescontract/uploadDocuments' and filename = 'Development/orka/${fname}' AND link_id='${filesDto.link_id}'`;
      const data = await entityManager.query(query)
      
      return { "statusCode": 200, data: data };
    } catch (error) {
      return { "statusCode": 500, "message": [new InternalServerErrorException(error)['response']['name']], "error": "Bad Request" };
    }
  }

}
