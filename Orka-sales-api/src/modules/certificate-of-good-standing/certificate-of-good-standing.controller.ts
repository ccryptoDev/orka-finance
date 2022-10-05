import { ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  Controller,
  Post,
  UploadedFiles,
  UseInterceptors,
  Body,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { extname } from 'path';
import { S3 } from 'aws-sdk';
import { Logger } from '@nestjs/common';
import { CertificateOfGoodStandingService } from './certificate-of-good-standing.service';
import { CertificateOfGoodStandingDto } from './dto/certificate-of-good-standing.dto';
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

@ApiTags('Certificate of Good Standing')
@Controller('certificate-of-good-standing')
export class CertificateOfGoodStandingController {
  constructor(
    private readonly certificateOfGoodStandingService: CertificateOfGoodStandingService,
  ) {}
  @Post()
  @ApiOperation({ summary: 'File shall be sent from frontend' })
  @UseInterceptors(
    FilesInterceptor('files[]', 20, {
      fileFilter: imageFileFilter,
    }),
  )
  async uploadMultipleFiles(
    @UploadedFiles() files,
    @Body() certificateOfGoodStandingDto: CertificateOfGoodStandingDto,
    @RealIP() ip: string,
  ) {
    if (files) {
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
      return this.certificateOfGoodStandingService.save(
        response,
        certificateOfGoodStandingDto,
        ip,
      );
    } else {
      return this.certificateOfGoodStandingService.update(
        certificateOfGoodStandingDto,
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
