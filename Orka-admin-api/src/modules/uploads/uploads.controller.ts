import {
  Controller,
  Post,
  UploadedFiles,
  UseInterceptors,
  Body,
  UseGuards,
  Param,
  HttpStatus,
  HttpCode,
  Get
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { UploadsService } from './uploads.service';
import { CreateUploadDto } from './dto/create-upload.dto';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RolesGuard } from '../../guards/roles.guard';
import { SetMetadata } from '@nestjs/common';
import { extname } from "path";
import { S3 } from 'aws-sdk';
import { Logger } from '@nestjs/common';
import { FilesDto } from './dto/files.dto';

export const Roles = (...roles: string[]) => SetMetadata('role', roles);

export const imageFileFilter = (req, file, callback) => {
  if (!file.originalname.match(/\.(jpg|jpeg|png|pdf)$/)) {
    return callback({"statusCode": 400, "message": "Only jpg,jpeg,png,pdf are allowed!","error": "Bad Request"}, false);
    //return callback(new Error('Only jpg,jpeg,png,pdf are allowed!'), false);
  }
  callback(null, true);
};

@ApiTags('Uploads')
@ApiBearerAuth()
@Roles('admin')
@UseGuards(AuthGuard('jwt'),RolesGuard)

@Controller('uploads')
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}
  

  @Post()
  @UseInterceptors(
    FilesInterceptor('files[]', 20, {
      fileFilter: imageFileFilter,
    }),
  )
  async uploadMultipleFiles(@UploadedFiles() files, @Body() createUploadDto: CreateUploadDto) {
    const response = [];
    files.forEach(file => {     
      
      const name = file.originalname.split('.')[0];
      const fileExtName = extname(file.originalname);
      const randomName = Array(4)
        .fill(null)
        .map(() => Math.round(Math.random() * 16).toString(16))
        .join('');
        
      file.filename = `${process.env.AWS_FOLDER_NAME}${name}-${randomName}${fileExtName}`
      const fileReponse = {
        originalname: file.originalname,
        filename: file.filename,
        DocumentType: file.documentType
      };

      const bucketS3 = process.env.STAGING_URL;
      this.uploadS3(file.buffer, bucketS3, file.filename);
      response.push(fileReponse);
    });
    return this.uploadsService.save(response,createUploadDto);
  }


  @Get('allFiles/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all files of Partner' })
  async getAllFiles(
    @Param('id') link_id: string) {
    return this.uploadsService.getAll(link_id)
  }

  @Post('/replace/:fname')
  @ApiOperation({ summary: "Replace single/multiple Files" })
  @UseInterceptors(
    FilesInterceptor('files[]', 20, {
      fileFilter: imageFileFilter,
    }),
  )
  async replaceMultipleFiles(@Param('fname') fname: string, @UploadedFiles() files, @Body() filesDto: FilesDto) {
    const response = [];
    files.forEach(file => {

      const name = file.originalname.split('.')[0];
      const fileExtName = extname(file.originalname);
      const randomName = Array(4)
        .fill(null)
        .map(() => Math.round(Math.random() * 16).toString(16))
        .join('');

      file.filename = `${process.env.AWS_FOLDER_NAME}${name}-${randomName}${fileExtName}`
      const fileReponse = {
        originalname: file.originalname,
        filename: file.filename,
        DocumentType: file.documentType
      };

      const bucketS3 = process.env.STAGING_URL;
      this.uploadS3(file.buffer, bucketS3, file.filename);
      response.push(fileReponse);
    });
    return this.uploadsService.replace(fname, response, filesDto);
  }

  async uploadS3(file, bucket, name) {
    const s3 = this.getS3();
    const params = {
        Bucket: bucket,
        Key: String(name),
        Body: file,
    };
    return new Promise((resolve, reject) => {
        s3.upload(params, (err, data) => {
        if (err) {
            Logger.error(err);
            reject(err.message);
        }
        resolve(data);
        });
    });
  }

  getS3() {
    return new S3({
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    });
  }
  
}
