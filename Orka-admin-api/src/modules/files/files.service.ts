import { Injectable,InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUploadDto } from './dto/create-upload.dto';
import { FilesRepository } from '../../repository/files.repository';
import { FilesEntity } from '../../entities/files.entity';
import {LoanRepository} from '../../repository/loan.repository';

export enum Flags {
  Y = 'Y'
}


@Injectable()
export class FilesService {
    constructor(
        @InjectRepository(FilesRepository) private readonly filesRepository: FilesRepository,
        @InjectRepository(LoanRepository) private readonly loanRepository: LoanRepository,
      ){
    
      }
    
      async save(files,createUploadDto: CreateUploadDto) {
        let filedata = [];
        for (let i = 0; i < files.length; i++) {
          let file:FilesEntity = new FilesEntity();
          file.originalname = files[i].originalname;
          file.filename = files[i].filename;
          file.services = 'admin/upload';
          file.link_id = createUploadDto.loan_id;
          filedata.push(file)
        }
        try{
          await this.filesRepository.save(filedata);
          await this.loanRepository.update({id: createUploadDto.loan_id}, { active_flag: Flags.Y });
          return { "statusCode": 200, "Loan_ID": createUploadDto.loan_id}
    
        } catch (error) {
          return { "statusCode": 500, "message": [new InternalServerErrorException(error)['response']['name']], "error": "Bad Request" };
        }
      }
    }