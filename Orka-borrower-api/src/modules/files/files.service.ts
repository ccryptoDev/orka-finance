import { Injectable,InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FilesRepository } from '../../repository/files.repository';
import { FilesEntity } from '../../entities/files.entity';
import {LoanRepository} from '../../repository/loan.repository';
import { FilesDto } from './files.dto';
import { getManager } from 'typeorm';
export enum Flags {
  Y = 'Y'
}

@Injectable()
export class FilesService {
  constructor(
    @InjectRepository(FilesRepository) private readonly filesRepository: FilesRepository
  ){}

    async getAll(link_id){
      try {
        const rawData = await this.filesRepository.find({
          select:['services','originalname','filename','createdAt','updatedAt'],
          where:{link_id:link_id}
        })
        return {
          statusCode:200,
          fileData:rawData
        };
      } catch (error) {
        return { "statusCode": 500, "message": [new InternalServerErrorException(error)['response']['name']], "error": error };
      }
    }

  async save(files,filesDto:FilesDto) {    
    let filedata = [];
    for (let i = 0; i < files.length; i++) {      
      let file:FilesEntity = new FilesEntity();
      file.originalname = files[i].originalname;
      file.filename = files[i].filename;
      file.services = filesDto.services;
      file.link_id = filesDto.link_id
      filedata.push(file)
    }
    try{
      await this.filesRepository.save(filedata);
      let data = {};
      data['files'] = await this.filesRepository.find({where:{link_id: filesDto.link_id, delete_flag: 'N'}})
      return { "statusCode": 200, data: data}
    } catch (error) {
      console.log(error)
      return { "statusCode": 500, "message": [new InternalServerErrorException(error)['response']['name']], "error": "Bad Request" };
    }
  }

  async replace(fname, files,filesDto:FilesDto) {    
    let filedata = [];
    let filename;
    let fileoriginalname;
    const entityManager = getManager();
    for (let i = 0; i < files.length; i++) {      
      let file:FilesEntity = new FilesEntity();
      filename = files[i].filename;
      fileoriginalname = files[i].originalname;
    }
    try{
      const data = await entityManager.query(`update tblfiles set filename ='${filename}', originalname = '${fileoriginalname}' where services ='salescontract/uploadDocuments' and filename = 'Development/orka/${fname}'`)
      return {"statusCode": 200, data:data };
    } catch (error) {
      return { "statusCode": 500, "message": [new InternalServerErrorException(error)['response']['name']], "error": "Bad Request" };
    }
  }

}
