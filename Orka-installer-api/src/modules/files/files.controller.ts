import {
  Controller,
  Post,
  UploadedFiles,
  UseInterceptors,
  Body,
  Get,
  Param,
  HttpStatus, HttpCode,
  Res
} from '@nestjs/common';
import { Response } from 'express';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { S3 } from 'aws-sdk';
import { FilesService } from './files.service';
import { extname } from "path";
import { FilesInterceptor } from '@nestjs/platform-express';
import { Logger } from '@nestjs/common';
import { FilesDto } from './files.dto'
export const imageFileFilter = (req, file, callback) => {
  if (!file.originalname.match(/\.(jpg|jpeg|png|pdf)$/)) {
    return callback({ "statusCode": 400, "message": "Only jpg,jpeg,png,pdf are allowed!", "error": "Bad Request" }, false);
    //return callback(new Error('Only jpg,jpeg,png,pdf are allowed!'), false);
  }
  callback(null, true);
};
@ApiTags('File Mangement')
@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) { }


  @Get('/download/:name')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Download Files" })
  async getdetails(
    @Param('name') name: string,
    @Res() res: Response
  ) {
    const s3 = this.getS3();
    const bucketS3 = process.env.STAGING_URL;
    const params = {
      Bucket: bucketS3,
      Key: process.env.AWS_FOLDER_NAME + String(name)
    };

    s3.getObject(params, function (err, data) {
      if (err) {
        // cannot get file, err = AWS error response, 
        // return json to client
        return {
          success: false,
          error: err
        };
      } else {
        //sets correct header (fixes your issue ) 
        //if all is fine, bucket and file exist, it will return file to client
        const stream = s3.getObject(params)
          .createReadStream()
          .pipe(res)
      }
    });
  }

  @Get('allFiles/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all files of Partner' })
  async getAllFiles(
    @Param('id') link_id: string) {
    return this.filesService.getAll(link_id)
  }

  @Post('/uploads')
  @ApiOperation({ summary: "Upload single/multiple Files" })
  @UseInterceptors(
    FilesInterceptor('files[]', 20, {
      fileFilter: imageFileFilter,
    }),
  )
  async uploadMultipleFiles(@UploadedFiles() files, @Body() filesDto: FilesDto) {
    const response = [];
    files.forEach(file => {
      const name = file.originalname.split('.')[0];
      const fileExtName = extname(file.originalname);
      const randomName = Array(4)
        .fill(null)
        .map(() => Math.round(Math.random() * 16).toString(16))
        .join('');
      file.filename = process.env.AWS_FOLDER_NAME + `${name}-${randomName}${fileExtName}`
      const fileReponse = {
        originalname: file.originalname,
        filename: file.filename,
        services: file.services
      };

      const bucketS3 = process.env.STAGING_URL;
      this.uploadS3(file.buffer, bucketS3, file.filename);
      response.push(fileReponse);
    });
    return this.filesService.save(response, filesDto);
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
    return this.filesService.replace(fname, response, filesDto);
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
