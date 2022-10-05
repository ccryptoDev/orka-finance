import { Module } from '@nestjs/common';
import { BorrowerHomeService } from './borrower-home.service';
import { BorrowerHomeController } from './borrower-home.controller';

@Module({
  controllers: [BorrowerHomeController],
  providers: [BorrowerHomeService]
})
export class BorrowerHomeModule {}
