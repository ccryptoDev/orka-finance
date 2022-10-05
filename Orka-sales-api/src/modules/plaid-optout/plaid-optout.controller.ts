import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Logger,
  Param,
  ParseUUIDPipe,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { S3 } from 'aws-sdk';
import { RealIP } from 'nestjs-real-ip';
import { extname } from 'path';
import { PlaidOptoutFormDto } from './dto/plaid-optout.dto';
import { PlaidOptoutService } from './plaid-optout.service';

export const imageFileFilter = (req, file, callback) => {
  if (
    !file.originalname.match(/\.(jpg|jpeg|png|pdf|JPEG|PNG|JPG|docx|doc|xlsx)$/)
  ) {
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

@ApiTags('Plaid Optout')
@Controller('plaid-optout')
export class PlaidOptoutController {
  constructor(private readonly plaidOptoutService: PlaidOptoutService) {}

  @Get('/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get Bank Details' })
  async getDetails(@Param('id') id: string) {
    return this.plaidOptoutService.getDetails(id);
  }

  @Post('/:filename')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete Bank Details' })
  async deleteFiles(@Param('filename') filename: string) {
    return this.plaidOptoutService.deleteFiles(filename);
  }

  @Post()
  @ApiOperation({ summary: 'Bank Statements Upload' })
  @UseInterceptors(
    FilesInterceptor('files[]', 20, {
      fileFilter: imageFileFilter,
    }),
  )
  async uploadMultipleFiles(
    @UploadedFiles() files,
    @Body() plaidOptoutFormDto: PlaidOptoutFormDto,
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
        file.filename = `${process.env.AWS_FOLDER_NAME}${name}-${randomName}${fileExtName}`;
        const fileReponse = {
          originalname: file.originalname,
          filename: file.filename,
        };

        const bucketS3 = process.env.STAGING_URL;
        this.uploadS3(file.buffer, bucketS3, file.filename);
        response.push(fileReponse);
      });
      return this.plaidOptoutService.save(response, plaidOptoutFormDto, ip);
    } else {
      // return this.plaidOptoutService.verificationDetails(
      //   plaidOptoutFormDto,ip
      // );
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
