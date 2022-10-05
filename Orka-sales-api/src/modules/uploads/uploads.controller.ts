import {
  Controller,
  Post,
  UploadedFiles,
  UseInterceptors,
  Body,
  Get,
  Param,
  HttpStatus,
  HttpCode,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { FilesInterceptor } from '@nestjs/platform-express';
import { CreateUploadDto } from './dto/create-upload.dto';
import { extname } from 'path';
import { S3 } from 'aws-sdk';
import { Logger } from '@nestjs/common';
import { UploadsService } from './uploads.service';

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

@ApiTags('File Management')
@Controller('uploads')
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @Post()
  @ApiOperation({ summary: 'Upload documents admin/sales/partner' })
  @UseInterceptors(
    FilesInterceptor('files[]', 20, {
      fileFilter: imageFileFilter,
    }),
  )
  async uploadMultipleFiles(
    @UploadedFiles() files,
    @Body() createUploadDto: CreateUploadDto,
  ) {
    const response = [];
    files.forEach(file => {
      const name = file.originalname.split('.')[0];
      const fileExtName = extname(file.originalname);
      const randomName = Array(4)
        .fill(null)
        .map(() => Math.round(Math.random() * 16).toString(16))
        .join('');
      file.filename =
        process.env.AWS_FOLDER_NAME + `${name}-${randomName}${fileExtName}`;
      const fileReponse = {
        originalname: file.originalname,
        filename: file.filename,
      };

      const bucketS3 = process.env.STAGING_URL;
      this.uploadS3(file.buffer, bucketS3, file.filename);
      response.push(fileReponse);
    });
    return this.uploadsService.save(response, createUploadDto);
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

  @Get('/download/:name')
  @ApiOperation({ summary: 'Download documents admin/sales/partner/client' })
  @HttpCode(HttpStatus.OK)
  async getdetails(@Param('name') name: string, @Res() res: Response) {
    const s3 = this.getS3();
    const bucketS3 = process.env.STAGING_URL;
    const params = {
      Bucket: bucketS3,
      Key: process.env.AWS_FOLDER_NAME + String(name),
    };

    s3.getObject(params, err => {
      if (err) {
        return {
          success: false,
          error: err,
        };
      } else {
        s3.getObject(params)
          .createReadStream()
          .pipe(res);
      }
    });
  }

  getS3() {
    return new S3({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    });
  }
}
