import { ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  Controller,
  Post,
  HttpCode,
  HttpStatus,
  Body,
  Get,
  Param,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { BusinessVerificationService } from './business-verification.service';
import { BusinessVerificationFormDto } from './dto/business-verification.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { extname } from 'path';
import { S3 } from 'aws-sdk';
import { Logger } from '@nestjs/common';
import { RealIP } from 'nestjs-real-ip';

export const imageFileFilter = (req, file, callback) => {
  if (!file.originalname.match(/\.(jpg|jpeg|png|pdf)$/)) {
    return callback(
      {
        statusCode: 400,
        message: 'Only jpg,jpeg,png,pdf are allowed!',
        error: 'Bad Request',
      },
      false,
    );
  }
  callback(null, true);
};

@ApiTags('Business Verification')
@Controller('business-verification')
export class BusinessVerificationController {
  constructor(
    private readonly businessVerificationService: BusinessVerificationService,
  ) {}

  @Get('/:id')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Get details for Business Verification form alone' })
  async getDetails(@Param('id') cusId: string) {
    return this.businessVerificationService.getDetails(cusId);
  }

  @Get('/files/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get Files Details' })
  async getFilesDetails(@Param('id') id: string) {
    return this.businessVerificationService.getFilesDetails(id);
  }

  @Post('/files/:filename')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete Bank Details' })
  async deleteFiles(@Param('filename') filename: string) {
    return this.businessVerificationService.deleteFiles(filename);
  }

  @Post()
  @ApiOperation({ summary: 'Business Details w/wo tax exempt file' })
  @UseInterceptors(
    FilesInterceptor('files[]', 20, {
      fileFilter: imageFileFilter,
    }),
  )
  async uploadMultipleFiles(
    @UploadedFiles() files,
    @Body() businessVerificationFormDto: BusinessVerificationFormDto,
    @RealIP() ip: string,
  ) {
    //console.log('bdto',businessVerificationFormDto)
    if (files) {
      //console.log('controller----',files)
      const response = [];
      files.forEach(file => {
        //console.log('file----',file)
        const name = file.originalname.split('.')[0];
        const fileExtName = extname(file.originalname);
        const randomName = Array(4)
          .fill(null)
          .map(() => Math.round(Math.random() * 16).toString(16))
          .join('');
        file.filename = `${process.env.AWS_FOLDER_NAME}${name}-${randomName}${fileExtName}`;
        const fileReponse = {
          originalname: file.originalname,
          filename: file.filename,
          services: file.services,
        };

        const bucketS3 = process.env.STAGING_URL;
        this.uploadS3(file.buffer, bucketS3, file.filename);
        response.push(fileReponse);
      });
      return this.businessVerificationService.save(
        response,
        businessVerificationFormDto,
        ip,
      );
    } else {
      return this.businessVerificationService.verificationDetails(
        businessVerificationFormDto,
        ip,
      );
    }
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
